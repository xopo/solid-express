/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id');
        table.string('name', 255).notNullable();
        table.string('pass', 20).notNullable();
        table.unique('name')
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('users');
}

