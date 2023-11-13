package main

import (
	"bytes"
	"encoding/json"
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
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

type PaymentInput struct {
	BookingId string  `json:"bookingId" validate:"required"`
	Amount    float64 `json:"amount" validate:"required,min=0"`
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

	q, err := ch.QueueDeclare(
		"payment", // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)

	failOnError(err, "Failed to declare a queue")

	db, err := db.Connect()
	failOnError(err, "Failed to connect to MongoDB")
	defer db.Disconnect()

	var forever chan struct{}

	v := validator.New()

	maxWorkers := 2
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
			var paymentInput PaymentInput
			err := json.Unmarshal(msg.Body, &paymentInput)
			if err != nil {
				msg.Ack(false)
				continue
			}
			err = v.Struct(paymentInput)
			if err != nil {
				msg.Ack(false)
				log.Printf("Invalid message: %s", err.Error())
				continue
			}

			// generate random 10% of failure
			success := randomizer.Intn(10) != 0
			payment := models.Payment{
				BookingId: paymentInput.BookingId,
				Amount:    paymentInput.Amount,
				CreatedAt: time.Now(),
				Success:   success,
			}
			err = payment.Insert(db)
			if err != nil {
				msg.Nack(false, true)
				continue
			}
			jsonData, _ := json.Marshal(payment)
			resp, err := http.Post(TICKET_WEBHOOK_URL, "application/json", bytes.NewBuffer(jsonData))
			resp.Body.Close()

			if err != nil || resp.StatusCode >= 300 {
				msg.Nack(false, true)
			} else {
				msg.Ack(false)
			}
		}
	}

	for w := 0; w < maxWorkers; w++ {
		go worker()
	}

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
