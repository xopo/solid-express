/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.createTable('files', function(table) {
        table.increments('id');
        table.string('media_id', 15).notNullable();
        table.string('name', 255).notNullable();
        table.string('add_time', 255).notNullable();
        table.unique('media_id');
        table.unique('name');
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('files');
}
