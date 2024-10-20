package internal

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"voteScheduler/database"
	"voteScheduler/repository"
	"voteScheduler/usecase"
	"voteScheduler/utils"

	"github.com/robfig/cron/v3"
	"github.com/spf13/viper"
)

type Cron struct {
	job *cron.Cron
}

func NewCronJob() *Cron {
	db, err := database.DBConn()
	if err != nil {
		return &Cron{}
	}
	c := &Cron{cron.New()}

	c.job.AddFunc("*/1 * * * *", func() {
		contextTime := viper.GetInt64("CONTEXT_TIME")
		timeout := time.Duration(contextTime) * time.Second
		rr := repository.NewRoomRepository(db)
		rc := usecase.NewRoomUsecase(rr, timeout)

		rooms, err := rc.GetAll(context.Background())
		if err != nil {
			log.Printf("Room 정보를 가져오는 중 오류 발생: %v", err)
		}

		currentTime, err := utils.GetCurrentTime()
		if err != nil {
			log.Printf("NTP 서버에서 시간을 가져오는 데 실패했습니다: %v", err)
		}

		log.Printf("종료된 투표 탐색중..")
		for _, room := range rooms {
			if room.EndTime.Before(currentTime) {
				fmt.Println(room.EndTime)
				fmt.Println(currentTime)
				// mq로 메세지 전송
				roomID := strconv.Itoa(room.RoomID)
				sendMessageToQueue(roomID)
			}
		}
	})
	c.job.Start()
	return c
}

func (c *Cron) StopCron() {
	if c == nil || c.job == nil {
		log.Println("Cron 객체 또는 cronJob이 nil입니다.")
		return
	}
	c.job.Stop()
	log.Println("Cron job이 정상종료되었습니다.")
}
