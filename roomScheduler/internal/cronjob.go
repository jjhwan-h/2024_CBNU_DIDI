package internal

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"

	"voteScheduler/database"
	"voteScheduler/repository"
	"voteScheduler/usecase"
	"voteScheduler/utils"

	"github.com/robfig/cron/v3"
	"github.com/spf13/viper"
)

const workerCount = 5

var wg sync.WaitGroup

type Job struct {
	roomID string
}
type Cron struct {
	job *cron.Cron
}

func worker(jobs <-chan Job, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs {
		sendMessageToQueue(job.roomID)
	}
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
		start := time.Now()

		jobs := make(chan Job)

		for i := 0; i < workerCount; i++ {
			wg.Add(1)
			go worker(jobs, &wg)
		}

		log.Printf("종료된 투표 탐색중..")
		for _, room := range rooms {
			if room.EndTime.Before(currentTime) {
				// fmt.Println(room.EndTime)
				// fmt.Println(currentTime)
				roomID := strconv.Itoa(room.RoomID)
				jobs <- Job{roomID: roomID}
			}
		}
		close(jobs)
		wg.Wait()
		elapsed := time.Since(start)
		fmt.Printf("time took:%s\n", elapsed)
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
