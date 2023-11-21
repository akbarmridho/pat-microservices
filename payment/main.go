package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"payment/db"
	"payment/models"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

type InvoiceInput struct {
	Amount float64 `json:"amount" validate:"required,min=0"`
}

func main() {
	godotenv.Load()

	TICKET_WEBHOOK_URL := os.Getenv("TICKET_WEBHOOK_URL")
	if TICKET_WEBHOOK_URL == "" {
		log.Fatalf("TICKET_WEBHOOK_URL is not set")
	}
	amqp_uri := os.Getenv("RABBITMQ_URI")
	if amqp_uri == "" {
		log.Fatalf("RABBITMQ_URI is not set")
	}
	conn, err := amqp.Dial(amqp_uri)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	err = ch.ExchangeDeclare("payment", "x-delayed-message", true, false, false, false, amqp.Table{
		"x-delayed-type": "direct",
	})
	failOnError(err, "Failed to declare an exchange")

	q, err := ch.QueueDeclare(
		"payment", // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)

	failOnError(err, "Failed to declare a queue")

	err = ch.QueueBind("payment", "payment", "payment", false, nil)
	failOnError(err, "Failed to bind a queue")

	db, err := db.Connect()
	failOnError(err, "Failed to connect to MongoDB")
	defer db.Disconnect()

	var forever chan struct{}

	v := validator.New()

	maxWorkers := 5
	randomizer := rand.New(rand.NewSource(time.Now().UnixNano()))
	worker := func() {
		msgs, err := ch.Consume(
			q.Name, // queue
			"",     // consumer
			false,  // auto-ack
			false,  // exclusive
			false,  // no-local
			false,  // no-wait
			nil,    // args
		)
		failOnError(err, "Failed to register a consumer")
		for msg := range msgs {
			log.Printf("Received a message: %s", msg.Body)
			// if message has x-delay header, it means that it's a retry
			// retry the webhook call, if it fails, requeue the message with double delay
			if msg.Headers["x-delay"] != nil {
				log.Printf("Retrying webhook call with delay: %d", msg.Headers["x-delay"])
				resp, err := http.Post(TICKET_WEBHOOK_URL, "application/json", bytes.NewBuffer(msg.Body))
				if err != nil || resp.StatusCode >= 300 {
					ch.PublishWithContext(
						context.Background(),
						"payment",
						q.Name,
						false,
						false,
						amqp.Publishing{
							ContentType: "application/json",
							Body:        msg.Body,
							Headers: amqp.Table{
								"x-delay": msg.Headers["x-delay"].(int32) * 2,
							},
						},
					)
				}
				msg.Ack(false)
				continue
			}

			// make the payment
			var invoiceId primitive.ObjectID
			err := json.Unmarshal(msg.Body, &invoiceId)
			if err != nil {
				msg.Nack(false, false)
				continue
			}

			// generate random 10% of failure
			success := randomizer.Intn(10) != 0
			var status string
			var failReason string
			if success {
				status = "success"
			} else {
				status = "failed"
				failReason = "Random failure"
			}

			isFound, err := models.UpdateStatus(db, invoiceId, status)
			if err != nil {
				msg.Nack(false, true)
				continue
			}

			if !isFound {
				msg.Ack(false)
				continue
			}

			jsonData, _ := json.Marshal(map[string]interface{}{
				"invoiceId":  invoiceId.Hex(),
				"status":     status,
				"failReason": failReason,
			})

			resp, err := http.Post(TICKET_WEBHOOK_URL, "application/json", bytes.NewBuffer(jsonData))

			// if webhook call fails, requeue the message with 5 seconds delay
			if err != nil || resp.StatusCode >= 300 {
				models.UpdateWebhookStatus(db, invoiceId, "failed")
				msg.Ack(false)
				ch.PublishWithContext(
					context.Background(),
					"payment",
					q.Name,
					false,
					false,
					amqp.Publishing{
						ContentType: "application/json",
						Body:        jsonData,
						Headers: amqp.Table{
							"x-delay": 100,
						},
					},
				)
			} else {
				models.UpdateWebhookStatus(db, invoiceId, "success")
				msg.Ack(false)
			}
		}
	}

	for w := 0; w < maxWorkers; w++ {
		go worker()
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(405)
			w.Write([]byte("Method not allowed"))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		var invoiceInput InvoiceInput
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&invoiceInput); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err := v.Struct(invoiceInput); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		invoice := models.Invoice{
			Amount:        invoiceInput.Amount,
			CreatedAt:     time.Now(),
			Status:        "pending",
			WebhookStatus: "pending",
		}

		if err := invoice.Insert(db); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		ctx := context.Context(context.Background())

		go func() {
			jsonData, _ := json.Marshal(invoice.ID)
			ch.PublishWithContext(ctx,
				"payment", // exchange
				q.Name,    // routing key
				false,     // mandatory
				false,     // immediate
				amqp.Publishing{
					ContentType: "application/json",
					Body:        jsonData,
				})
		}()

		jsonData, _ := json.Marshal(map[string]interface{}{
			"invoiceId":  invoice.ID.Hex(),
			"paymentUrl": "https://example.com/payment/" + invoice.ID.Hex(),
		})

		w.WriteHeader(201)
		w.Write(jsonData)
	})

	fmt.Println("Starting server at http://localhost:8080")
	go http.ListenAndServe(":8080", nil)

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
