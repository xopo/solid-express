/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.createTable('description', function(table) {
        table.string('media_id', 255).notNullable();
        table.string('title', 255).notNullable();
        table.string('categories', 255);
        table.text('description');
        table.integer('epoch').notNullable();
        table.string('thumbnail', 200).notNullable();
        table.string('duration_string', 20);
        table.string('channel_url', 255);
        table.string('url', 255).notNullable();
        table.string('uploader', 120);
        table.string('upload_date', 50);
        table.string('upload_url', 255);
        table.foreign('media_id').references('Files.media_id')
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('description');
}

