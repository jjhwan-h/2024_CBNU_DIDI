package domain

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/uptrace/bun"
)

type Room struct {
	ID      int       `bun:"id,pk,autoincrement" json:"-"`
	RoomID  int       `bun:"room_id,notnull" json:"room_id"`
	EndTime time.Time `bun:"end_time,notnull,nullzero" json:"end_time"`

	CreatedAt time.Time `bun:"created_at,notnull,nullzero" json:"-"`
}

type RoomRepository interface {
	Get(c context.Context, roomID int) (*Room, error)
	GetAll(c context.Context) ([]*Room, error)
	Register(c context.Context, room *Room) error
	Delete(c context.Context, roomID int) error
}

type RoomUsecase interface {
	Get(c context.Context, roomID int) (*Room, error)
	GetAll(c context.Context) ([]*Room, error)
	Register(c context.Context, room *Room) error
	Delete(c context.Context, roomID int) error
}

func (r *Room) BeforeInsert(db *bun.DB) error {
	now := time.Now()
	if r.CreatedAt.IsZero() {
		r.CreatedAt = now
	}
	return nil
}

func (d *Room) Bind(r *http.Request) error { // request를 구조체에 바인딩. 검증이나 기본값같은 추가처리 추가가능
	if err := json.NewDecoder(r.Body).Decode(d); err != nil && err != io.EOF {
		fmt.Println(d)
		return fmt.Errorf("invalid request payload: %v", err)
	}
	return nil
}
