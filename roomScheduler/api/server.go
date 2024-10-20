package api

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"voteScheduler/api/app/route"
	"voteScheduler/internal"

	"github.com/spf13/viper"
)

type Server struct {
	*http.Server
}

func NewServer() (*Server, error) {
	log.Println("configuring server...")
	api, err := route.New()
	if err != nil {
		return nil, err
	}

	var addr string
	port := viper.GetString("PORT")

	if strings.Contains(port, ":") {
		addr = port
	} else {
		addr = ":" + port
	}

	srv := http.Server{
		Addr:    addr,
		Handler: api,
	}

	return &Server{&srv}, nil
}

func (srv *Server) Start() {
	cron := internal.NewCronJob()
	if cron == nil {
		panic("failed to connect database")
	}

	log.Println("starting server...")
	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			panic(err)
		}
	}()

	//log.Println("Listening on %s\n", srv.Addr)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	sig := <-quit
	log.Println("Shutting down server... Reason: ", sig)

	//teardown logic...
	cron.StopCron()

	if err := srv.Shutdown(context.Background()); err != nil {
		panic(err)
	}
	log.Println("Server gracefully stopped")
}
