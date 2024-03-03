/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.alterTable('roles', table => {
        table.string('date', 22);
    })
}


exports.down = function(knex) {
    return knex.schema.alterTable('roles', table => {
        table.dropColumn('date');
    })
}

