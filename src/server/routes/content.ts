import { Router } from "express";
import { dbGetReservation, dbToggleTable, dbToggleUser } from "../db";

const router = Router();

router.post<any, any, any, any, {date: string}>
('/', async (req, res) => {
    const {date} = req.query;
    const data = dbGetReservation(atob(date))
    res.json({success: true, data})
})


router.post<any,any, any,{date: string},  any>
('/addSelf', async (req, res) => {
    const {date} = req.body;
    const safeName = `${req.session.user!.id}-${req.session.user!.name}`;
    const data = dbToggleUser( {self: safeName }, atob(date))
    res.json({success: true, data})
})

router.post<any,any, any,{date: string, table: Record<string, string | number>},  any>
('/toggleTable', async (req, res) => {
    const {date, table} = req.body;
    const data = dbToggleTable( table, atob(date))
    res.json({success: true, data})
})

export type Guest = {guest: {name: string, user: string}}

router.post<any,any, any,{date: string, guest: Guest},  any>
('/toggleGuest', async (req, res) => {
    const {date, guest} = req.body;
    //@ts-ignore 
    const data = dbToggleUser( guest, atob(date))
    res.json({success: true, data})
})

export default router;