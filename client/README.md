# Client App

## API Docs

### HTTP APIs

todo change this

| HTTP Method | Endpoint         | Description                  |
| ----------- | ---------------- | ---------------------------- |
| POST        | /bookings        | Crate new booking for a seat |
| POST        | /bookings/cancel | Cancel a booking             |
| GET         | /bookings/{id}   | Get booking info             |
| GET         | /bookings/       | Get all user bookings        |
| GET         | /events          | Get all events               |
| GET         | /events/{id}     | Get event info               |

## How To Start

1. Pastikan port 5433 dan 3000 tersedia
2. Pada root folder, jalankan `docker compose up`
3. Panggil http://localhost:3000 untuk memeriksa apakah service hidup

## How to Seed

1. Copy .env.example to .env
2. Run `pnpm seed`
