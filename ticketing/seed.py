import requests

data = [
    {
        "title": "Twoset Violin World Tour - Singapore",
        "description": "Twoset tour",
        "price": 1500000,
        "seatCount": 100
    },
        {
        "title": "Taylor Swift The Eras Tour - Singapore",
        "description": "Taylor swift tour in singapore",
        "price": 4000000,
        "seatCount": 50
    },
    {
        "title": "Yoasobi Asia Tour Live in Jakarta",
        "description": "Yoasobi Asia Tour Live in Jakarta",
        "price": 1200000,
        "seatCount": 200
    },
        {
        "title": "Tulus Tur Manusia - Bandung",
        "description": "Tur konser tulus album manusia",
        "price": 500000,
        "seatCount": 20
    }
]

base_url = "http://localhost:8000/events"

for each in data:
    requests.post(base_url, json=each)