import knex from 'knex';

import config from './knexfile.js';
import { Guest } from '../routes/content.js';

const db = knex(config.database);

const reservationTable = () => db<Reservation>('reservation');
const usersTable = () => db<User>('users');
const changesTable = () => db<Change>('changes');


type Change = {id: number, owner: number, date: string, acknowledge: string};
type Reservation = {tables: string, users: string, date: string};

export async function dbGetReservation(date: string) {
    return reservationTable().where('date', date).first();
}

export function now(str: true): string;
export function now(): Date;
export function now(str: false): Date;
export function now (str?: boolean) {
    const date = new Date();
    return str && str === true ? date.toISOString(): date;
}

export async function dbAddChange(owner: number) {
    const date = now(true);
    await changesTable().insert({owner, date});
}

export async function dbGetLastChange() {
    return changesTable().orderBy('id', 'desc').limit(1);
}

export async function dbGetFirstChange() {
    return changesTable().orderBy('id', 'asc').limit(1);
}

export async function dbRemoveOldChanges() {
    return changesTable().where('date', '<', now(true)).delete();
}

export async function dbRemoveOldReservation() {
    const lastWeek = new Date((new Date()).setDate(new Date().getDate() - 7)).toISOString();
    return reservationTable().where('date', '<',  lastWeek )
}

export async function dbAcknowledgeSelf(changeId: number, userId: number) {
    const change = await changesTable().where('id', changeId);
    if (change.length) {
        const acknowledge = JSON.parse(change[0].acknowledge || '[]');
        const updated = [... new Set([...acknowledge, userId])]
        await changesTable().update('acknowledge', JSON.stringify(updated)).where('id', changeId);
    }
}

export async function dbToggleUser(user: Guest | Record<string, string>, date: string ) {
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
        ? reservationTable().update('users', updUsers).where('date', date)
        : dbInsertReservation({...data, date, users: updUsers});
}

export async function dbInsertReservation({date, tables, users}: {date: string, tables: string, users: string}) {
    return reservationTable().insert({date, users, tables});
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
        ? reservationTable().update('tables', updTables).where('date', date)
        : dbInsertReservation({...data, date, tables: updTables});
}

export function dbAddUser(user: {name: string, pass: string}) {
    return usersTable().insert({name: user.name, pass: user.pass, token: user.pass})
}

type User = {id: number, name: string, pass: string, token: string};
export function dbGetUser(name: string) {
    return usersTable().where('name', name).first();
}

export function dbGetUsers() {
    return usersTable().select('id', 'name');
    // return db.prepare('SELECT id, name FROM users').all() as {id: number, name: string, pass: string, token: string}[];
}

export function dbCheckUserExists(name: string) {
    return usersTable().select('id', 'name').where('name', name).first();
}