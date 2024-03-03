/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.createTable('folders', function(table) {
        table.integer('media_id').notNullable();
        table.string('name', 20).notNullable();
        table.unique(['name', 'media_id']);
        table.foreign('media_id').references('Files.media_id');
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('folders');
}

