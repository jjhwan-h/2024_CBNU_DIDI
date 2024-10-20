package cmd

import (
	"voteScheduler/database/migrations"

	"github.com/spf13/cobra"
)

var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "use bun migration tool",
	Long:  "run bun migrations",
	Run: func(cmd *cobra.Command, args []string) {
		migrations.Migrate()
	},
}

func init() {
	RootCmd.AddCommand(migrateCmd)
}
