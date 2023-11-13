FROM golang:alpine
RUN apk update
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod tidy

COPY . .
RUN go build -o main .

ENTRYPOINT [ "/app/main" ]