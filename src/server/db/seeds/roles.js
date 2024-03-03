/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex("roles").del();
    await knex("users").del();
    await knex('user_role').del();

    // Inserts seed entries
    await knex("roles").insert([
        { id: 1, name: "admin" },
        { id: 2, name: "user" },
        { id: 3, name: "guest" }
    ]);

    await knex('users').insert([
        {id: 1, name: 'daniel', pass:'$2b$10$e9vjUS3v0kjM/3abHANz7uO2XDGbyf3UlduqzTrCpneRxicnRro5W'},
        {id: 2, name: 'peter', pass:'$2b$10$e9vjUS3v0kjM/3abHANz7uO2XDGbyf3UlduqzTrCpneRxicnRro5W'}
        ])

    await knex('user_role').insert([
        {user_id: 1, role_id: 1},
        {user_id: 1, role_id: 2},
        {user_id: 2, role_id: 2}
    ]);
};
