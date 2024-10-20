package repository

import (
	"context"
	"fmt"
	"voteScheduler/domain"

	"github.com/uptrace/bun"
)

type roomRepository struct {
	db *bun.DB
}

func NewRoomRepository(db *bun.DB) domain.RoomRepository {
	return &roomRepository{
		db: db,
	}
}

// Get gets an Room by RoomID
func (s *roomRepository) Get(c context.Context, roomID int) (*domain.Room, error) {
	r := &domain.Room{RoomID: roomID}
	err := s.db.NewSelect().
		Model(r).
		Where("room_id = ?", roomID).
		Scan(c)
	if err != nil {
		return nil, err
	}
	return r, err
}

// GetAll returns all Rooms
func (s *roomRepository) GetAll(c context.Context) ([]*domain.Room, error) {
	var rooms []*domain.Room

	err := s.db.NewSelect().
		Model(&rooms).
		Scan(c)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return rooms, nil
}

// Register register room
func (s *roomRepository) Register(c context.Context, room *domain.Room) error {
	_, err := s.db.NewInsert().
		Model(room).
		Exec(c)
	if err != nil {
		return err
	}
	return nil
}

func (s *roomRepository) Delete(c context.Context, roomID int) error {
	r := &domain.Room{RoomID: roomID}
	_, err := s.db.NewDelete().
		Model(r).
		Where("room_id = ?", roomID).
		Exec(c)
	if err != nil {
		return err
	}
	return nil
}
