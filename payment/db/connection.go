package db

import (
	"context"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	*mongo.Database
	Ctx context.Context
}

func Connect() (*Database, error) {
	clientOptions := options.Client()
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatalf("MONGODB_URI is not set")
	}
	clientOptions.ApplyURI(uri)
	ctx := context.Background()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	return &Database{
		Ctx:      ctx,
		Database: client.Database("payment"),
	}, nil
}

func (db Database) Disconnect() error {
	return db.Client().Disconnect(db.Ctx)
}
