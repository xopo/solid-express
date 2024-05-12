/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("tags_users", function (table) {
        table.integer("tag_id").notNullable();
        table.integer("user_id").notNullable();
        table.unique(["user_id", "tag_id"]);
        table.foreign("user_id").references("users.id");
        table.foreign("tag_id").references("tags.id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("tags_users");
};
