package route

import (
	"time"
	"voteScheduler/api/app/handler"
	"voteScheduler/repository"
	"voteScheduler/usecase"

	"github.com/go-chi/chi/v5"
	"github.com/uptrace/bun"
)

func NewRoomRouter(timeout time.Duration, db *bun.DB, router chi.Router) {
	rr := repository.NewRoomRepository(db)
	rc := &handler.RoomHandler{
		RoomUsecase: usecase.NewRoomUsecase(rr, timeout),
	}

	router.Group(func(r chi.Router) {
		router.Get("/rooms/{id}", rc.Get)
		router.Get("/rooms", rc.GetAll)
		router.Post("/rooms", rc.Register)
	})
}
