import { dbAddGuestToReservation, dbAddNewGuest, dbAddReservation, dbAddTableToReservation, dbAddUserToReservation, dbGetGuest, dbGetReservation, dbGetReservationGuest, dbGetReservationTable, dbGetReservationUser, dbRemoveGuestFromReservation, dbRemoveOtherTableFromReservation, dbRemoveTableFromReservation, dbRemoveUserFromReservation } from "./db";

export const toggleGuest = async (guest: string, id: number, date: string) => {
    let dbGuest = await dbGetGuest(guest, id)
    if (!dbGuest) {
        const newId = await dbAddNewGuest(guest, id);
        dbGuest =  {name: guest, user_id: id, id: newId[0]}
    }
    let reservation = await dbGetReservation(date)
    if (!reservation) {
        const newReservation = await dbAddReservation(date);
        reservation = {id: newReservation[0], date}
    }
    const guestAdded = await dbGetReservationGuest(dbGuest.id, reservation.id, date);
    if (guestAdded) {
        await dbRemoveGuestFromReservation(dbGuest.id, reservation.id, date);
        return {success: true} 
    }
    await dbAddGuestToReservation(dbGuest.id, reservation.id, date);
    return {success: true}
}

export const toggleSelf = async ( id: number, date: string) => {
    let reservation = await dbGetReservation(date)
    if (!reservation) {
        const newReservation = await dbAddReservation(date);
        reservation = {id: newReservation[0], date}
    }
    const iAmAdded = await dbGetReservationUser(id, reservation.id, date);
    if (iAmAdded) {
        await dbRemoveUserFromReservation(id, reservation.id, date);
        return {success: true} 
    }
    await dbAddUserToReservation(id, reservation.id, date);
    return {success: true}
}

export const toggleTable = async (table: number,  user_id: number, date: string) => {
    let reservation = await dbGetReservation(date)
    if (!reservation) { 
        const newReservation = await dbAddReservation(date);
        reservation = {id: newReservation[0], date}
    }
    const userReservation = await dbGetReservationTable(user_id, reservation.id, date);
    if (userReservation && userReservation.table === table) {
        await dbRemoveTableFromReservation(table, user_id, reservation.id, date);
        return {success: true} 
    }
    await dbRemoveOtherTableFromReservation(user_id, reservation.id, date);
    await dbAddTableToReservation(table, user_id, reservation.id, date);
    return {success: true}
}