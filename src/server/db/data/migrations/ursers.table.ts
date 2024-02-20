import knex from "knex";

export const up =  (knex: knex.Knex)  => knex.schema.createTable('users', tbl => {
    tbl.increments();
    tbl.integer('id').unique().notNullable();
    tbl.text('name').notNullable().unique();
    tbl.text('pass').notNullable();
})

export const down = (knex: knex.Knex) => knex.schema.dropTableIfExists('users');



// CREATE TABLE changes (
// 	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
// 	owner INTEGER NOT NULL,
// 	date TEXT NOT NULL,
// 	target TEXT,
// 	acknowledge INTEGER,
// 	CONSTRAINT changes_FK FOREIGN KEY (owner) REFERENCES users(id)
// );
