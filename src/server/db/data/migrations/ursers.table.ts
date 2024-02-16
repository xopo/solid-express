import knex from "knex";

export const up =  (knex: knex.Knex)  => knex.schema.createTable('users', tbl => {
    tbl.increments();
    tbl.integer('id').unique().notNullable();
    tbl.text('name').notNullable().unique();
    tbl.text('pass').notNullable();
})

export const down = (knex: knex.Knex) => knex.schema.dropTableIfExists('users');
