package main

import (
	"github.com/jjhwan-h/DIDI_SERVER/cli"
	"github.com/jjhwan-h/DIDI_SERVER/db"
)

func main() {
	defer db.Close()

	cli.Start()
}
