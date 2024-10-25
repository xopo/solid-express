package main

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	fmt.Println("connect to db")
	db, err := sql.Open("sqlite3", "../mp3db.sqlite?moderwc&_journal=WAL")
	if err != nil {
		fmt.Print(err)
	}
	defer db.Close()

	fmt.Println("get list of folders")
	folders := getListOfFolderFromFiles(db)
	fmt.Println(folders)
}

func getListOfFolderFromFiles(db *sql.DB) []string {
	existingMap := make(map[string]int)
	result := []string{}
	query := "SELECT media_id, folder FROM files WHERE LENGTH(folder) > 1 "

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	// just remember to close when finish
	defer rows.Close()

	for rows.Next() {
		time.Sleep(10 * time.Millisecond)
		var media_id string
		var folder string
		err = rows.Scan(&media_id, &folder)
		if err != nil {
			log.Fatal("row next", err)
		}
		fmt.Printf("%q: %q\n", media_id, folder)
		split := strings.Split(folder, ",")
		fmt.Println("==", split, len(split))
		for _, tag := range split {
			time.Sleep(10 * time.Millisecond)
			var tagId int
			if id, exists := existingMap[tag]; exists {
				tagId = id
			} else {
				tagId = insertNewTagInDB(tag, db)
			}
			insertMediaTags(tagId, media_id, db)
		}
	}

	return result
}

func insertMediaTags(tagId int, mediaId string, db *sql.DB) {
	fmt.Println("Insert media tags ", tagId, mediaId)
	row := db.QueryRow("select * from tags_media where tag_id=? and user_id=1 and media_id=? limit 1", tagId, mediaId)
	var media_id string
	row.Scan(&media_id)
	if len(media_id) == 0 {
		_, err := db.Exec("insert into tags_media (media_id, user_id, tag_id) values (?, 1, ?)", mediaId, tagId)
		if err != nil {
			log.Fatal("insert media tags error", err)
		}
	}
}

func insertNewTagInDB(name string, db *sql.DB) int {
	fmt.Println("insert new tag in db:", name)
	rows, err := db.Query("select id from tags where name=? limit 1", name)
	if err != nil {
		log.Fatal("select new tag in db", err)
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		rows.Scan(&id)
		if id > -1 {
			return id
		}
	}
	result, err := db.Exec("insert into tags (name) values (?)", name)
	if err != nil {
		log.Fatal("insert new tag", err)
	}
	lastId, err := result.LastInsertId()
	if err != nil {
		log.Fatal("last insert id", err)
	}
	return int(lastId)
}
