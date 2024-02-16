import knex from 'knex';

import config from './knexfile.js';
import { Guest } from '../routes/content.js';

const db = knex(config.database);

type Reservation = {tables: string, users: string, data: string};

export async function dbGetReservation(date: string) {
    return db<Reservation>('reservation').where('date', date).first();
}

export async function dbToggleUser(user: Guest | Record<string, string>, date: string ) {
    console.log('here toggle user');
    const reservation = await dbGetReservation(date);
    const data = reservation || {date: '', tables: '[]', users: '[]'};
    const users = JSON.parse(data.users) as Array<Record<string, string>>;
    let updUsers;
    if (users.find(u => JSON.stringify(u) === JSON.stringify(user))) {
        updUsers = users.filter(u => JSON.stringify(u) !== JSON.stringify(user))
    } else {
        updUsers = [...users, user];
    }
    updUsers = JSON.stringify(updUsers);
    return reservation 
        ? db('reservation').update('users', updUsers).where('date', date)
        : dbInsertReservation({...data, date, users: updUsers});
}

export async function dbInsertReservation({date, tables, users}: {date: string, tables: string, users: string}) {
    return db('reservation').insert({date, users, tables});
}

export async function dbToggleTable(table: Record<string, string | number>, date: string) {
    const record = await dbGetReservation(date);
    const data = record || {date: '', tables: '[]', users: '[]'}
    const tables = JSON.parse(data.tables) as Array<Record<string, string>>;
    let updTables;
    if (tables.find(u => JSON.stringify(u) === JSON.stringify(table))) {
        updTables = tables.filter(u => JSON.stringify(u) !== JSON.stringify(table))
    } else {
        updTables = [...tables.filter(tbl => tbl.name !== table.name), table];
    }
    updTables = JSON.stringify(updTables); 
    return record 
        ? db('reservation').update('tables', updTables).where('date', date)
        : dbInsertReservation({...data, date, tables: updTables});
}

export function dbAddUser(user: {name: string, pass: string}) {
    return db('users').insert({name: user.name, pass: user.pass, token: user.pass})
}

type User = {id: number, name: string, pass: string, token: string};
export function dbGetUser(name: string) {
    return db<User>('users').where('name', name).first();
}

export function dbGetUsers() {
    return db('users').select('id', 'name');
    // return db.prepare('SELECT id, name FROM users').all() as {id: number, name: string, pass: string, token: string}[];
}

export function dbCheckUserExists(name: string) {
    return db<User>('users').select('id', 'name').where('name', name).first();
}