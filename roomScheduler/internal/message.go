package internal

import (
	"context"
	"encoding/json"
	"log"
	"strconv"
	"time"
	"voteScheduler/database"
	"voteScheduler/repository"

	"github.com/spf13/viper"
	"github.com/streadway/amqp"
)

type VoteEndedMessage struct {
	VoteID string `json:"vote_id"`
	Status string `json:"status"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Printf("%s: %s\n", msg, err)
	}
}

func sendMessageToQueue(roomID string) {
	URL := viper.GetString("MQ")
	conn, err := amqp.Dial(URL)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"vote_queue", // 큐 이름
		true,         // 내구성(큐를 디스크에 저장.rabbitMQ서버가 재시작하더라도 큐가 사라지지않음.)
		false,        // 자동 삭제
		false,        // 독점적 (연결된 채널에만 독점적으로 사용)
		false,        // 대기 중 여부(큐가 제대로 선언되었는지 확인)
		nil,          // 인수
	)
	failOnError(err, "Failed to declare a queue")

	body := VoteEndedMessage{
		VoteID: roomID,
		Status: "end",
	}
	jsonData, err := json.Marshal(body)
	failOnError(err, "Failed to Marshal")

	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key (큐 이름)
		false,  // mandatory (전송할 큐가 없더라도 에러 없이 메세지 사라짐)
		false,  // immediate (즉시 소비자에게 전달되지 않더라도 큐에 메시지 정상적으로 저장)
		amqp.Publishing{
			ContentType: "application/json",
			Body:        jsonData,
		})
	failOnError(err, "Failed to publish a message")

	// 방 삭제
	db, err := database.DBConn()
	if err != nil {
		failOnError(err, "Failed to connect DB")
	}

	rr := repository.NewRoomRepository(db)
	contextTime := viper.GetInt64("CONTEXT_TIME")
	id, err := strconv.Atoi(roomID)
	if err != nil {
		failOnError(err, "Failed to convert roomID")
	}

	timeout := time.Duration(contextTime) * time.Second
	context, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	err = rr.Delete(context, id)
	if err == nil {
		log.Printf("room: %d deleted\n", id)
	}

	log.Printf(" [x] Sent %s\n", body)
}
