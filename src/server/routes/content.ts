import { Router } from "express";
import { checkIsAuthenticated } from "./login";
import validate from "../middleware/validate";
import { postDateTable, postGuest, postWithDate } from "../../common/validation/schema";
import { dbGetReservation,  dbAddChange, dbSetUserActive, dbAddParticipant2Table, dbGetReservationUsers,
        dbAddReservation,  dbGetReservationGuests, dbGetReservationTables, dbRemoveUserFromReservationTable } from "../db/db";
import { toggleGuest, toggleSelf, toggleTable } from "../db/helper";

const router = Router();

type ContentData = {
    users: {id: number, name: string}[];
    guests: {id: number, name: string, user_id: number}[];
    tables: {user_id: number, table: number}[];
}

router.post<any, any, any, any, {date: string}>
('/', checkIsAuthenticated, validate(postWithDate), async (req, res) => {
    const {date} = req.body;
    const reservation = await dbGetReservation(date);
    let data: ContentData = {users: [], guests: [], tables: []};
    if (!reservation) {
        await dbAddReservation(date);
    } else {
        data.users = await dbGetReservationUsers(reservation.id);
        data.guests = await dbGetReservationGuests(reservation.id);
        data.tables = await dbGetReservationTables(reservation.id);

    }

    if (req.session.user) {
        await dbSetUserActive(req.session.user.id)
    }

    res.json({success: true, data})
})


router.post<any,any, any,{date: string},  any>
('/addSelf', checkIsAuthenticated, validate(postWithDate),  async (req, res) => {
    const {date} = req.body;
    res.json(await toggleSelf(req.session.user!.id, date));
    await dbAddChange(req.session.user!.id)
})

router.post<any,any, any,{date: string, table: number},  any>
('/toggleTable', checkIsAuthenticated, validate(postDateTable), async (req, res) => {
    const {date, table} = req.body;
    const data = await toggleTable(table, req.session.user!.id, date)
    await dbAddChange(req.session.user!.id)
    res.json({success: true, data})
})

export type Unregistered = {
    guest: string;
};
export type Guest = {guest: {name: string, user: string}}

router.post<any,any, any,{date: string, name: string, table: number}>
('/add2table', checkIsAuthenticated, async(req, res) => {
    const {date, name, table} = req.body;
    await dbAddParticipant2Table(date, name, table);
    await dbAddChange(req.session.user!.id)
    res.status(200).json({success: true});
})

router.post<any,any, any,{reservation_id: number, name: string, table: number}>
('/removeFromTable', checkIsAuthenticated, async(req, res) => {
    const {reservation_id, name, table} = req.body;
    const result = await dbRemoveUserFromReservationTable(reservation_id, name, table);
    await dbAddChange(req.session.user!.id)
    res.status(result.success ? 200 : 400).json(result);
})

router.post<any,any, any,{date: string, guest: string},  any>
('/toggleGuest', checkIsAuthenticated, validate(postGuest),  async (req, res) => {
    const {date, guest} = req.body;
    const data = await toggleGuest(guest, req.session.user!.id, date);
    await dbAddChange(req.session.user!.id)
    res.json(data)
})

export default router;