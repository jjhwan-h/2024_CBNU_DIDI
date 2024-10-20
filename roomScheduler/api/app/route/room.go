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
	rh := &handler.RoomHandler{
		RoomUsecase: usecase.NewRoomUsecase(rr, timeout),
	}

	router.Group(func(r chi.Router) {
		router.Get("/rooms/{id}", rh.Get)
		router.Get("/rooms", rh.GetAll)
		router.Get("/rooms/{id}/status", rh.GetStatus)
		router.Post("/rooms", rh.Register)
		router.Delete("/rooms/{id}", rh.Delete)
	})
}
