/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('reservation_guest', table => {
        table.integer('reservation_id').notNullable();
        table.integer('guest_id').notNullable();
        table.string('date', 20).notNullable();
        table.foreign('guest_id').references('guests.id');
        table.foreign('reservation_id').references('reservations.id');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('reservation_guest')
};
