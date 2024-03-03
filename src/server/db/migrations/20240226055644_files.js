/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.createTable('files', function(table) {
        table.increments('id');
        table.string('mediaId', 15).notNullable();
        table.string('name', 255).notNullable();
        table.string('addTime', 255).notNullable();
        table.unique('mediaId');
        table.unique('name');
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('files');
}
