/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.createTable('user_media', function(table) {
        table.integer('user_id').notNullable();
        table.integer('file_id').notNullable();
        table.unique(['user_id', 'file_id']);
        table.foreign('user_id').references('users.id');
        table.foreign('file_id').references('files.id');
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('user_media');
}


