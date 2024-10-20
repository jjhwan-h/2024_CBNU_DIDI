package main

import (
	"github.com/jjhwan-h/DIDI/blockchain/cli"
	"github.com/jjhwan-h/DIDI/blockchain/db"
)

func main() {
	defer db.Close()

	cli.Start()
}
