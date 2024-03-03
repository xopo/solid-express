/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.createTable('roles', function(table) {
        table.increments('id');
        table.string('name', 10);
        table.unique('name');
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('roles')
}

