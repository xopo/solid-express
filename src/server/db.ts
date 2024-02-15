import Database from 'better-sqlite3';
import {join} from 'path';
import path from 'path';
import {fileURLToPath} from 'url';

import { Guest } from './routes/content';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const dbFile = join(__dirname, './pingpong.db');
const db = new Database(dbFile, {verbose: console.log})

export function dbAddUser(user: {name: string, pass: string}) {
    console.info('-- dbAddUser Real function')
    return db.prepare('INSERT INTO users (name, pass, token) values (?, ?, ?)').run(user.name, user.pass, user.pass);
}

export function dbGetUser(name: string) {
    return db.prepare('SELECT * FROM users WHERE name=?').get(name) as {id: number, name: string, pass: string, token: string};
}

export function dbGetUsers() {
    return db.prepare('SELECT id, name FROM users').all() as {id: number, name: string, pass: string, token: string}[];
}

export function dbCheckUserExists(name: string) {
    return db.prepare('SELECT id, name FROM users WHERE name=?').get(name) as {id:number, name: string} | undefined;
}

export function dbGetReservation(date: string) {
    return db.prepare('SELECT * FROM reservation WHERE date=?').get(date) as {date: string, users: string, tables: string};
}

export function dbInsertReservation({date, tables, users}: {date: string, tables: string, users: string}) {
    return db.prepare('INSERT INTO reservation (date, users, tables) values (?, ?, ?)').run(date, users, tables);
}

export function dbToggleUser(user: Guest | Record<string, string>, date: string) {
    const record = dbGetReservation(date)
    const data = record || {date: '', tables: '[]', users: '[]'};
    const users = JSON.parse(data.users) as Array<Record<string, string>>;
    let updUsers;
    if (users.find(u => JSON.stringify(u) === JSON.stringify(user))) {
        updUsers = users.filter(u => JSON.stringify(u) !== JSON.stringify(user))
    } else {
        updUsers = [...users, user];
    }
    updUsers = JSON.stringify(updUsers);
    return record 
        ? db.prepare('UPDATE reservation SET users=? WHERE date=?').run(updUsers, date)
        : dbInsertReservation({...data, date, users: updUsers});
}

export function dbToggleTable(table: Record<string, string | number>, date: string) {
    const record = dbGetReservation(date);
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
        ? db.prepare('UPDATE reservation SET tables=? WHERE date=?').run(updTables, date)
        : dbInsertReservation({...data, date, tables: updTables});
}