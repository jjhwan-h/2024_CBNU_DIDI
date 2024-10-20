package utils

import (
	"time"

	"github.com/beevik/ntp"
)

func GetCurrentTime() (time.Time, error) {
	currentTime, err := ntp.Time("pool.ntp.org")
	if err != nil {
		return time.Time{}, err
	}

	return currentTime, nil
}
