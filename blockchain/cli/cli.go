package cli

import (
	"flag"
	"fmt"
	"log"
	"os"
	"runtime"

	"github.com/jjhwan-h/DIDI_BLOCKCHAIN/rest"
	"github.com/joho/godotenv"
)

func usage() {
	fmt.Printf("Please use the following flags:\n\n")
	fmt.Printf("-port=: Set the PORT of the server\n")
	fmt.Printf("-mode=: 'rest'\n")
	runtime.Goexit() //모든게 종료, defer수행 후
}

func Start() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	if len(os.Args) == 1 {
		usage()
	}

	port := os.Getenv("PORT")
	mode := flag.String("mode", "rest", "rest")
	flag.Parse()

	if port == "" {
		log.Fatal("Error loading port number")
	}

	switch *mode {
	case "rest":
		rest.Start(port)
	default:
		usage()
	}
	fmt.Println(port, *mode)
}
