import { Router } from "express";
import { dbGetReservation, dbToggleTable, dbToggleUser } from "../db";

const router = Router();

router.post<any, any, any, any, {date: string}>
('/', async (req, res) => {
    const {date} = req.query; 
    const {tables, users} = dbGetReservation(atob(date)) || {tables: '[]', users: '[]'}
    const data = {tables: JSON.parse(tables), users: JSON.parse(users)};
    res.json({success: true, data})
})


router.post<any,any, any,{date: string},  any>
('/addSelf', async (req, res) => {
    const {date} = req.body;
    const safeName = `${req.session.user!.id}-${req.session.user!.name}`;
    const data = dbToggleUser( {self: safeName }, atob(date))
    res.json({success: true, data})
})

router.post<any,any, any,{date: string, table: Record<string, string | number> | number},  any>
('/toggleTable', async (req, res) => {
    const {date, table} = req.body;
    const augmentedTable = typeof table === 'number'
        ? { name: req.session.safeName!, table}
        : table;
    const data = dbToggleTable( augmentedTable, atob(date))
    res.json({success: true, data})
})

export type Unregistered = {
    guest: string; 
};
export type Guest = {guest: {name: string, user: string}}

router.post<any,any, any,{date: string, guest: Guest | Unregistered},  any>
('/toggleGuest', async (req, res) => {
    const {date, guest} = req.body;

    if (typeof guest.guest === 'string' && guest.guest.trim().length < 4) {
        res.json({error: 'bad username'})
        return;
    }
    const completeUser = typeof guest.guest !== 'string' && 'user' in guest.guest
            ? guest as Guest
            : { guest: { name: guest.guest, user: req.session.safeName } } as Guest;
    const data = dbToggleUser( completeUser, atob(date))
    res.json({success: true, data})
})

export default router;