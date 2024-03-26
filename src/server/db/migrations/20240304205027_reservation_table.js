/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('reservation_table', function(table) {
        table.integer('reservation_id').notNullable();
        table.integer('table').notNullable();
        table.integer('user_id').notNullable();
        table.string('date', 20).notNullable();
        table.string('guest');
        table.foreign('user_id').references('users.id');
        table.foreign('reservation_id').references('reservations.id');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('reservation_table')
};
