/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('guests', table => {
        table.increments('id');
        table.string('name', 20).notNullable();
        table.integer('user_id').notNullable();
        table.foreign('user_id').references('users.id');
        table.unique(['name', 'user_id']);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('guests');
};
