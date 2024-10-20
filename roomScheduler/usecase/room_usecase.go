package usecase

import (
	"context"
	"time"
	"voteScheduler/domain"
)

type roomUsecase struct {
	roomRepository domain.RoomRepository
	contextTimeout time.Duration
}

func NewRoomUsecase(roomRepository domain.RoomRepository, timeout time.Duration) domain.RoomUsecase {
	return &roomUsecase{
		roomRepository: roomRepository,
		contextTimeout: timeout,
	}
}

func (ru *roomUsecase) Get(c context.Context, roomID int) (*domain.Room, error) {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.roomRepository.Get(ctx, roomID)
}

func (ru *roomUsecase) GetAll(c context.Context) ([]*domain.Room, error) {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.roomRepository.GetAll(ctx)
}

func (ru *roomUsecase) Register(c context.Context, room *domain.Room) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.roomRepository.Register(ctx, room)
}

func (ru *roomUsecase) Delete(c context.Context, roomID int) error {
	ctx, cancel := context.WithTimeout(c, ru.contextTimeout)
	defer cancel()
	return ru.roomRepository.Delete(ctx, roomID)
}
