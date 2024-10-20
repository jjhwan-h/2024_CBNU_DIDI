package route

import (
	"net/http"
	"time"
	"voteScheduler/database"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"
	"github.com/spf13/viper"
)

func New() (*chi.Mux, error) {
	// logger := logging.NewLogger()
	db, err := database.DBConn()
	if err != nil {
		return nil, err
	}
	contextTime := viper.GetInt64("CONTEXT_TIME")
	timeout := time.Duration(contextTime) * time.Second

	r := chi.NewRouter()
	//r.Use(middleware.Timeout(15 * time.Second))
	r.Use(middleware.StripSlashes)
	r.Use(render.SetContentType(render.ContentTypeJSON))

	r.Group(func(r chi.Router) {
		NewRoomRouter(timeout, db, r)
		r.Get("/ping", func(w http.ResponseWriter, _ *http.Request) {
			w.Write([]byte("pong"))
		})
	})
	return r, nil
}
