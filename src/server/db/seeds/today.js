/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('reservations').del()
  await knex('reservations').insert([
    {id: 1, date: '2024-03-06T00:00:00.000Z'},
    {id: 2, date: '2024-03-13T00:00:00.000Z'}
  ])
  await knex('reservation_user').del()
  await knex('reservation_user').insert([
    {reservation_id: 1, user_id: 3, date: '2024-03-06T00:00:00.000Z'},
    {reservation_id: 1, user_id: 5, date: '2024-03-06T00:00:00.000Z'},
    {reservation_id: 1, user_id: 4, date: '2024-03-06T00:00:00.000Z'},
    {reservation_id: 1, user_id: 7, date: '2024-03-06T00:00:00.000Z'}, 
  ])

  await knex('reservation_table').del()
  await knex('reservation_table').insert([
    {reservation_id: 1, table: 4, user_id: 5, date: '2024-03-06T00:00:00.000Z'},
    {reservation_id: 1, table: 5, user_id: 4, date: '2024-03-06T00:00:00.000Z'},
  ])
};
