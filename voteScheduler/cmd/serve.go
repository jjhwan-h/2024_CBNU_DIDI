package cmd

import (
	"log"
	"voteScheduler/api"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "start http server with configured api",
	Long:  "Starts a http server and serves the configured api",
	Run: func(cmd *cobra.Command, args []string) {
		server, err := api.NewServer()
		if err != nil {
			log.Fatal(err)
		}

		server.Start()
	},
}

func init() {
	RootCmd.AddCommand(serveCmd)

	viper.SetDefault("PORT", "4001") // .env파일 우선
}
