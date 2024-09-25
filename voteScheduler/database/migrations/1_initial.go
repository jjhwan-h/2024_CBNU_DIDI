package migrations

import (
	"context"
	"fmt"

	"github.com/uptrace/bun"
)

const roomTable = `
CREATE TABLE rooms(
id serial NOT NULL,
created_at timestamp NOT NULL DEFAULT current_timestamp,
room_id int NOT NULL,
end_time timestamp NOT NULL
)
`

func init() {
	up := []string{
		roomTable,
	}
	down := []string{
		`DROP TABLE rooms`,
	}

	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		fmt.Println("creating inital tables")
		for _, q := range up {
			_, err := db.Exec(q)
			if err != nil {
				return err
			}
		}
		return nil
	}, func(ctx context.Context, db *bun.DB) error {
		fmt.Println("dropping initial tables")
		for _, q := range down {
			_, err := db.Exec(q)
			if err != nil {
				return err
			}
		}
		return nil
	})
}
