// Package database implements postgres connection and queries.
package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"sync"

	"github.com/spf13/viper"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	"github.com/uptrace/bun/extra/bundebug"
)

var (
	db   *bun.DB
	once sync.Once
	err  error
)

// DBConn returns a postgres connection pool.
func DBConn() (*bun.DB, error) {
	once.Do(func() {
		user := viper.GetString("DB_USER")
		password := viper.GetString("DB_PASSWORD")
		host := viper.GetString("DB_HOST")
		port := viper.GetString("DB_PORT")
		dbname := viper.GetString("DB_NAME")
		sslmode := viper.GetString("DB_SSLMODE")

		dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbname, sslmode)

		sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

		db = bun.NewDB(sqldb, pgdialect.New())

		err := checkConn(db)
		if err != nil {
			log.Println(err)
		} else {
			if viper.GetBool("db_debug") {
				db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))
			}
		}
	})

	return db, err
}

func checkConn(db *bun.DB) error {
	var n int
	return db.NewSelect().ColumnExpr("1").Scan(context.Background(), &n)
}
