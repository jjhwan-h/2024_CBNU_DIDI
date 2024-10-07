package main

import (
	"github.com/jjhwan-h/DIDI_BLOCKCHAIN/cli"
	"github.com/jjhwan-h/DIDI_BLOCKCHAIN/db"
)

func main() {
	defer db.Close()

	cli.Start()
}
