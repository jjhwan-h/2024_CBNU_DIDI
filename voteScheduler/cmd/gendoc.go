package cmd

import (
	"fmt"
	"log"
	"os"
	"voteScheduler/api/app/route"

	"github.com/go-chi/docgen"
	"github.com/spf13/cobra"
)

var (
	routes bool
)

// gendocCmd represents the gendoc command
var gendocCmd = &cobra.Command{
	Use:   "gendoc",
	Short: "Generate project documentation",
	Long: `A longer description that spans multiple lines and likely contains examples
			and usage of using your command.`,
	Run: func(cmd *cobra.Command, args []string) {
		if routes {
			genRoutesDoc()
		}
	},
}

func init() {
	RootCmd.AddCommand(gendocCmd)
	gendocCmd.Flags().BoolVarP(&routes, "routes", "r", false, "create api routes markdown file")
}

func genRoutesDoc() {
	api, _ := route.New()
	fmt.Print("generating routes markdown file: ")
	md := docgen.MarkdownRoutesDoc(api, docgen.MarkdownOpts{
		ProjectPath: "Room API",
		Intro:       "This is the Room API documentation.",
	})
	if err := os.WriteFile("routes.md", []byte(md), 0644); err != nil {
		log.Println(err)
		return
	}
	fmt.Println("OK")
}
