package models

import (
	"payment/db"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Payment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BookingId string             `bson:"booking_id" json:"bookingId"`
	Amount    float64            `bson:"amount" json:"amount"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
	Success   bool               `bson:"success" json:"success"`
}

func (payment *Payment) Insert(db *db.Database) error {
	res, err := db.Collection("payments").InsertOne(db.Ctx, payment)
	if err != nil {
		return err
	}
	payment.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}
