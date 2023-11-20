package models

import (
	"payment/db"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Invoice struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Amount        float64            `bson:"amount" json:"amount"`
	CreatedAt     time.Time          `bson:"created_at" json:"createdAt"`
	Status        string             `bson:"status" json:"status"`
	WebhookStatus string             `bson:"webhook_status" json:"webhookStatus"`
}

func (invoice *Invoice) Insert(db *db.Database) error {
	res, err := db.Collection("invoices").InsertOne(db.Ctx, invoice)
	if err != nil {
		return err
	}
	invoice.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}

func UpdateStatus(db *db.Database, id primitive.ObjectID, status string) (bool, error) {
	res, err := db.Collection("invoices").UpdateOne(
		db.Ctx,
		primitive.M{"_id": id},
		primitive.M{"$set": primitive.M{"status": status}},
	)
	return res.MatchedCount == 1, err
}

func UpdateWebhookStatus(db *db.Database, id primitive.ObjectID, status string) (bool, error) {
	res, err := db.Collection("invoices").UpdateOne(
		db.Ctx,
		primitive.M{"_id": id},
		primitive.M{"$set": primitive.M{"webhook_status": status}},
	)
	return res.MatchedCount == 1, err
}
