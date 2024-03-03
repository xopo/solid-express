/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function(knex)  {
    return knex.schema.createTable('user_role', table=>{
        table.integer('user_id').unsigned()
        table.integer('role_id').unsigned()
        table.foreign('user_id').references('Users.id')
        table.foreign('role_id').references('Roles.id')
    })
}


exports.down = function(knex) {
    return knex.schema.dropTable('user_role');
}

