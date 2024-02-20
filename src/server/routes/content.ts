import { Router } from "express";
import { checkIsAuthenticated } from "./login";
import validate from "../middleware/validate";
import { postDateTable, postWithDate } from "../../common/validation/schema";
import { dbGetReservation, dbToggleUser, dbToggleTable, dbAddChange } from "../db/db";

const router = Router();

router.post<any, any, any, any, {date: string}>
('/', checkIsAuthenticated, validate(postWithDate), async (req, res) => {
    const {date} = req.body;
    const result = await dbGetReservation(atob(date));
    const {tables, users} = result || {tables: '[]', users: '[]'};
    const data = {tables: JSON.parse(tables), users: JSON.parse(users)};
    res.json({success: true, data})
})

// router.get('/stats', async (_req, res) => {
//     await prepStream(res);
    
    
//     let counter = 0;
//     const i = setInterval(() => {
//         counter++;
//         sendMessage('message', counter, res);
//         // res.write('event: message');
//         // res.write(`data: {"value": ${counter}}`);
//         // res.write('\n\n');
//         // res.flush(); // for compression package to work ( not keep the buffer open)
//         if (counter > 5) {
//             clearInterval(i);
//             sendMessage('close', Date.now(), res);
//             // res.write('event: close\n');
//             // res.write(`data: {"time": ${Date.now()}}`);
//             // res.write('\n\n')
//         }
//     }, 2000);
//     res.on('close', () => res.end());
// })

router.post<any,any, any,{date: string},  any>
('/addSelf', checkIsAuthenticated, validate(postWithDate),  async (req, res) => {
    const {date} = req.body;
    const safeName = `${req.session.user!.id}-${req.session.user!.name}`;
    const data = dbToggleUser( {self: safeName }, atob(date))
    await dbAddChange(req.session.user!.id)
    res.json({success: true, data})
})

router.post<any,any, any,{date: string, table: Record<string, string | number> | number},  any>
('/toggleTable', checkIsAuthenticated, validate(postDateTable), async (req, res) => {
    const {date, table} = req.body;
    const augmentedTable = typeof table === 'number'
        ? { name: req.session.safeName!, table}
        : table;
    const data = dbToggleTable( augmentedTable, atob(date))
    await dbAddChange(req.session.user!.id)
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
    const data = dbToggleUser( completeUser, atob(date))
    await dbAddChange(req.session.user!.id)
    res.json({success: true, data})
})

export default router;