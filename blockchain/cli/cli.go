package cli

import (
	"flag"
	"fmt"
	"os"
	"runtime"

	"github.com/jjhwan-h/DIDI_SERVER/rest"
)

func usage() {
	fmt.Printf("Please use the following flags:\n\n")
	fmt.Printf("-port=: Set the PORT of the server\n")
	fmt.Printf("-mode=: 'rest'\n")
	runtime.Goexit() //모든게 종료, defer수행 후
}

func Start() {
	if len(os.Args) == 1 {
		usage()
	}
	mode := flag.String("mode", "rest", "rest")
	port := os.Getenv("PORT")
	if port == "" {
		return
	}

	flag.Parse()

	switch *mode {
	case "rest":
		rest.Start(port)
	default:
		usage()
	}
	fmt.Println(port, *mode)
}
