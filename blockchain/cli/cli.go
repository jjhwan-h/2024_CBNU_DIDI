package cli

import (
	"flag"
	"fmt"
	"os"
	"runtime"

	"github.com/jjhwan-h/DIDI/blockchain/rest"
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
	mode := flag.String("mode", "rest", "Server mode (default: rest)")
	portFlag := flag.String("port", "4004", "Port number (default: 4004)")

	// Parse flags
	flag.Parse()

	port := os.Getenv("PORT")
	if port == "" {
		port = *portFlag // Use the value from the flag if environment variable is not set
	}

	switch *mode {
	case "rest":
		rest.Start(port)
	default:
		usage()
	}
	fmt.Println(port, *mode)
}
