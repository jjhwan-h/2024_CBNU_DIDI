package cmd

import (
	"voteCounting/internal"

	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "start server with MQ consumer",
	Long:  "start server with MQ consumer",
	Run: func(cmd *cobra.Command, args []string) {
		internal.Listen()
	},
}

func init() {
	RootCmd.AddCommand(serveCmd)
}
