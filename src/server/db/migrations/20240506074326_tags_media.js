/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("tags_media", function (table) {
        table.integer("tag_id").notNullable();
        table.integer("user_id").notNullable();
        table.string("media_id").notNullable();
        table.integer("enabled").defaultTo(1);
        table.unique(["user_id", "tag_id", "media_id"]);
        table.foreign("user_id").references("users.id");
        table.foreign("tag_id").references("tags.id");
        table.foreign("media_id").references("files.media_id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("tags_media");
};
