import { Router } from "express";
import { dbGetReservation, dbToggleTable, dbToggleUser } from "../db";
import { checkIsAuthenticated } from "./login";
import validate from "../middleware/validate";
import { postDateTable, postWithDate } from "../../common/validation/schema";

const router = Router();

router.post<any, any, any, any, {date: string}>
('/', checkIsAuthenticated, validate(postWithDate), async (req, res) => {
    const {date} = req.body;
    const {tables, users} = dbGetReservation(atob(date)) || {tables: '[]', users: '[]'}
    const data = {tables: JSON.parse(tables), users: JSON.parse(users)};
    res.json({success: true, data})
})


router.post<any,any, any,{date: string},  any>
('/addSelf', checkIsAuthenticated, validate(postWithDate),  async (req, res) => {
    const {date} = req.body;
    const safeName = `${req.session.user!.id}-${req.session.user!.name}`;
    const data = dbToggleUser( {self: safeName }, atob(date))
    res.json({success: true, data})
})

router.post<any,any, any,{date: string, table: Record<string, string | number> | number},  any>
('/toggleTable', checkIsAuthenticated, validate(postDateTable), async (req, res) => {
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
('/toggleGuest', checkIsAuthenticated, validate(postWithDate),  async (req, res) => {
    const {date, guest} = req.body;

    if (typeof guest.guest === 'string' && guest.guest.trim().length < 4) {
        res.json({error: 'bad username'})
        return;
    }
    let completeUser: Guest;
    if (typeof guest === 'string') {
        completeUser = { guest: { name: (guest as string), user: req.session.safeName! } }
    } else {
        completeUser = guest as Guest;
    }
    // const completeUser = typeof guest !== 'string' && guest.hasOwnProperty('guest') && guest.guest.hasOwnProperty('user')
    //         ? guest as Guest
    //         : { guest: { name: (guest as string), user: req.session.safeName } } as Guest;
    const data = dbToggleUser( completeUser, atob(date))
    res.json({success: true, data})
})

export default router;