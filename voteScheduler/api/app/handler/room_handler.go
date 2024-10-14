package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"voteScheduler/domain"
	"voteScheduler/utils"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type RoomHandler struct {
	RoomUsecase domain.RoomUsecase
}

type roomResponse struct {
	*domain.Room
}

func newRoomResponse(r *domain.Room) *roomResponse {
	return &roomResponse{
		Room: r,
	}
}

func (rh *RoomHandler) Get(w http.ResponseWriter, r *http.Request) {
	roomID, err := strconv.Atoi(chi.URLParam(r, "id"))

	if err != nil {
		render.Render(w, r, ErrInvalidRequest(fmt.Errorf("invalid room ID: %v", err)))
		return
	}

	p, err := rh.RoomUsecase.Get(r.Context(), roomID)
	if err != nil {
		render.Render(w, r, ErrInternalServerError)
		return
	}
	render.Respond(w, r, newRoomResponse(p))
}

func (rh *RoomHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	p, err := rh.RoomUsecase.GetAll(r.Context())

	if err != nil {
		render.Render(w, r, ErrInternalServerError)
		return
	}

	render.Respond(w, r, p)
}

func (rh *RoomHandler) Register(w http.ResponseWriter, r *http.Request) {
	room := &domain.Room{}
	defer r.Body.Close()

	if err := render.Bind(r, room); err != nil {
		render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	fmt.Println(*room)
	err := rh.RoomUsecase.Register(r.Context(), room)
	if err != nil {
		render.Render(w, r, ErrInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, http.NoBody)
}

func (rh *RoomHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	roomID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		render.Render(w, r, ErrInvalidRequest(fmt.Errorf("invalid room ID: %v", err)))
		return
	}
	p, err := rh.RoomUsecase.Get(r.Context(), roomID)
	if err != nil {
		render.Render(w, r, ErrInternalServerError)
		return
	}
	currentTime, err := utils.GetCurrentTime()
	if err != nil {
		fmt.Printf("NTP 서버에서 시간을 가져오는 데 실패했습니다: %v", err)
		render.Render(w, r, ErrInternalServerError)
	}
	fmt.Println(p.EndTime)
	fmt.Println(currentTime)
	if p.EndTime.Before(currentTime) { // 종료
		render.Respond(w, r, true)
	} else { // 종료전
		render.Respond(w, r, false)
	}
}

func (rh *RoomHandler) Delete(w http.ResponseWriter, r *http.Request) {
	roomID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		render.Render(w, r, ErrInvalidRequest(fmt.Errorf("invalid room ID: %v", err)))
		return
	}

	err = rh.RoomUsecase.Delete(r.Context(), roomID)
	if err != nil {
		render.Render(w, r, ErrInternalServerError)
		return
	}
	render.Respond(w, r, http.NoBody)
}
