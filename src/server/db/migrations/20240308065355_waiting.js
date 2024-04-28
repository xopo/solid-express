/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('waiting_media', table => {
        table.increments('id')
        table.string('media_id', 20).notNullable();
        table.string('url', 255).notNullable();
        table.string('status', 20);
        table.boolean('acknowledge').defaultTo(false);
        table.integer('user_id').notNullable().defaultTo(1);
        table.foreign('user_id').references('Users.id');
        table.integer('retry').defaultTo(0);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('waiting_media');
};
