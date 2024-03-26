import knex from 'knex';

import config from './knexfile.js';
// import { Guest } from '../routes/content.js';

const db = knex(config.database);

// db.on('query', (query) => console.log('[sqlite]', query.sql, JSON.stringify(null, query.bindings, 4)));
// add query print
db.on('query-response', (response, query) => {
    if (query.sql.includes('* from `changes` order by `id`')) return;
    console.log('[sqlite query]', query.sql, ',', `[${query.bindings ? query.bindings.join(',') : ''}]`);
    console.log('[sqlite response]', response, '/n/n')
})

const reservationTable = () => db<Reservation>('reservations');
const reservationUserTable = () => db('reservation_user as ru');
const reservationGuestTable = () => db('reservation_guest as rg');
const reservationTablesTable = () => db<ReservationTable>('reservation_table as rt')
const usersTable = () => db<User>('users');
const guestTable = () => db<Guest>('guests')
const changesTable = () => db<Change>('changes');


type Change = {id: number, owner: number, date: string, acknowledge: string};
type Reservation = {id: number, date: string};
type ReservationTable = {reservation_id: number, table: number, user_id: number, guest: string, date: string}
type Guest = {id: number, name: string, user_id: number};


export async function dbGetReservation(date: string) {
    const result =  await reservationTable().where({date}).first();
    console.log('get reservation', result)
    return result;

}

export const test = () => {console.log('test original')}

export const dbAddNewGuest = async (name: string, user_id: number) => {
    return  guestTable().insert<number[]>({name, user_id})
}

export  const dbGetGuest = async (name: string, user_id: number) => {
    return await guestTable().where({name, user_id}).limit(1).first();
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
    return await changesTable().insert({owner, date});
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

export async function dbCreateNewReservation(date: string) {
    return reservationTable().insert({date})
}

export async function dbGetReservationGuest(guest_id: number, reservation_id: number, date: string) {
    return reservationGuestTable().where({guest_id, reservation_id, date}).first();
}

export async function dbGetReservationTables(reservation_id: number) {
    return reservationTablesTable()
        .select('reservation_id', 'table', 'user_id', 'name', 'date', 'guest')
        .where({reservation_id})
        .leftJoin('users as u', 'u.id', 'rt.user_id' )
}

export async function dbRemoveOtherTableFromReservation(user_id: number, reservation_id: number, date: string) {
    return reservationTablesTable().where({ user_id, reservation_id, date}).delete();
}

export async function dbRemoveTableFromReservation(table: number, user_id: number, reservation_id: number, date: string) {
    return reservationTablesTable().where({table, user_id, reservation_id, date}).delete();
}

export async function dbAddTableToReservation(table: number, user_id: number,reservation_id: number, date: string) {
    return reservationTablesTable().insert({reservation_id, user_id, table, date});
}

export async function dbGetReservationTable( user_id: number,reservation_id: number, date: string) {
    return reservationTablesTable().where({ user_id, reservation_id, date}).first();
}

export async function dbGetReservationGuests(reservation_id: number) {
    return reservationGuestTable()
        .select('name', 'guest_id', 'user_id')
        .where({reservation_id})
        .leftJoin('guests as g', 'g.id', 'guest_id');
}

export async function dbRemoveUserFromReservation(user_id: number, reservation_id: number, date: string) {
    return reservationUserTable().where({user_id, reservation_id, date}).delete();
}

export async function dbAddUserToReservation(user_id: number, reservation_id: number, date: string) {
    return reservationUserTable().insert({reservation_id, user_id, date});
}

export async function dbGetReservationUser(user_id: number, reservation_id: number, date: string) {
    return reservationUserTable().where({user_id, reservation_id, date}).first();
}

export async function dbGetReservationUsers(reservation_id: number) {
    return reservationUserTable()
        .select('name', 'user_id')
        .where({reservation_id})
        .leftJoin('users as u', 'u.id', 'user_id');
}

export async function dbRemoveGuestFromReservation(guest_id: number, reservation_id: number, date: string) {
    return reservationGuestTable().where({guest_id, reservation_id, date}).delete();
}

export async function dbAddGuestToReservation(guest_id: number, reservation_id: number, date: string) {
    return reservationGuestTable().insert({reservation_id, guest_id, date});
}

export async function dbToggleGuest(guest: Guest | Record<string, string>, date: string ) {
    console.info({'togle user': guest})
    let reservation = await dbGetReservation(date);
    console.log('reservaton', reservation) 
    if (!reservation) {
        const newReservation = await dbCreateNewReservation(date);
        reservation = {id: newReservation[0], date};
    }
    
    console.log('got reservation', reservation);
    return {id: 3, name: 'fuck'}
}

export async function dbAddReservation(date: string) {
    return await reservationTable().insert({date})
}


export function dbAddUser(user: {name: string, pass: string}) {
    return usersTable().insert({name: user.name, pass: user.pass, token: user.pass})
}

type User = {id: number, name: string, pass: string, token: string};
export function dbGetUser(name: string) {
    return usersTable().where('name', name).first();
}

export function dbGetUsers() {
    return usersTable().select('id', 'name', 'last_active', 'reset_password').orderBy('last_active', 'desc');
    // return db.prepare('SELECT id, name FROM users').all() as {id: number, name: string, pass: string, token: string}[];
}

// reset_password = 0 - no reset, account locked
// reset_password = 1 - the user will be able to reset pass
export function dbCheckUserExists(name: string) {
    return usersTable().select('id', 'name', 'reset_password').where('name', name).first();
}

export async function dbSetUserActive(id: number) {
    return await usersTable().update('last_active', now(true)).where({id})
}

export async function dbAddParticipant2Table(date: string, name: string, table: number) {
    const reservation = await reservationTablesTable().where({date, table}).first();
    if (!reservation) {
        return {error: 'no reservation'};
    }
    const guest = reservation.guest ? JSON.parse(reservation.guest) : [];
    const updatedGuest = [... new Set([...guest, name])];
    await reservationTablesTable().update('guest', JSON.stringify(updatedGuest)).where({date, table})
    return {success: true}
}

export async function dbRemoveUserFromReservationTable(reservation_id: number, name: string, table: number) {
    const reservation = await reservationTablesTable().where({reservation_id, table}).first();
    if (!reservation) {
        return {error: 'no reservation'};
    }
    const guest = reservation.guest ? JSON.parse(reservation.guest) : [];
    const updatedGuest = guest.filter((g: string) => g !== name);
    await reservationTablesTable().update('guest', JSON.stringify(updatedGuest)).where({reservation_id, table})
    return {success: true}
}

export async function dbResetPassword(id: number) {
    return usersTable().update('reset_password', 1).where({id})
}

export async function dbChangeUserPassword(id: number, pass: string) {
    return usersTable().update('pass', pass).update('reset_password', 0).where({id}).andWhere('reset_password', 1);
}