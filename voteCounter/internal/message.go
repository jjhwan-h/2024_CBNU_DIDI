package internal

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/spf13/viper"
	"github.com/streadway/amqp"
)

type VoteEndedMessage struct {
	RoomID string `json:"vote_id"`
	Status string `json:"status"`
}

type resultResponse struct {
	RoomId string `json:"roomId"`
	Result []byte `json:"result"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func worker(id int, jobs <-chan amqp.Delivery) {
	for msg := range jobs {
		log.Printf("Worker %d received a message: %s", id, msg.Body)
		var data VoteEndedMessage

		err := json.Unmarshal(msg.Body, &data)
		if err != nil {
			log.Printf("Failed to process message: %s", msg.Body)
			msg.Nack(false, true)
		}
		//개표로직
		port := viper.GetString("BLOCKCHAIN_PORT")
		host := viper.GetString("BLOCKCHAIN_HOST")
		url := fmt.Sprintf("http://%s:%s/balance/%s?total=true", host, port, data.RoomID)

		var res resultResponse
		resp, err := http.Get(url)
		if err != nil {
			log.Printf("Failed to counting vote: %sroom", data.RoomID)
			msg.Nack(false, true)
		}
		err = json.NewDecoder(resp.Body).Decode(&res)
		if err != nil {
			log.Println("Failed to Decode result")
			msg.Nack(false, true)
		}

		log.Println(string(res.Result))

		port = viper.GetString("WEB_PORT")
		host = viper.GetString("WEB_HOST")
		url = fmt.Sprintf("http://%s:%s/rooms/%s/result", host, port, data.RoomID)
		_, err = http.Post(url, "application/json", bytes.NewBuffer(res.Result))
		if err != nil {
			log.Println("Failed to Send result")
			msg.Nack(false, true)
		}

		msg.Ack(false)
	}
}

func Listen() {
	URL := viper.GetString("MQ")
	conn, err := amqp.Dial(URL)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"vote_queue", // 큐 이름
		true,         // durable
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	)
	failOnError(err, "Failed to declare a queue")

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

	jobQueue := make(chan amqp.Delivery)

	workerCount := 5
	for w := 1; w <= workerCount; w++ {
		go worker(w, jobQueue)
	}

	go func() {
		for d := range msgs {
			jobQueue <- d
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	select {}
}
