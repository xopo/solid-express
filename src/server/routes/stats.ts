import { Router, Response } from "express";
import { dbAcknowledgeSelf, dbGetFirstChange, dbGetLastChange, dbRemoveOldChanges, dbRemoveOldReservation, now } from "../db/db";
import { checkIsAuthenticated } from "./login";
const router = Router();

async function doCleanup() {
    const nowTime = now();
    if (nowTime.getHours() > 19 && nowTime.getHours() < 22 && nowTime.getMinutes() < 59) {
        const firstChange = await dbGetFirstChange();
        if (!firstChange.length) return;
        const firstTime = new Date(firstChange[0].date).valueOf() as number;
        const diff =  (nowTime.valueOf() - firstTime) / (100 * 60 * 60);
        if (diff > 20) {
            await dbRemoveOldChanges();
            console.error('TBD - check and remove old reservations')
            await dbRemoveOldReservation();
        }
    }
}

const setMessage = async (userId: number): Promise<string | undefined> => {
    const lastChange = (await dbGetLastChange())[0];
    if (!lastChange) return;
    if (lastChange.owner === userId) {
        return;
    }
    const acknowledge = JSON.parse(lastChange.acknowledge || '[]');
    if (acknowledge.includes(userId)) {
        return;
    }
    await dbAcknowledgeSelf(lastChange.id, userId);
    doCleanup();
    return `refresh page`;
}

router.get('/', checkIsAuthenticated,  async (req, res:Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const interval = setInterval( async () => {
        const message = await setMessage(req.session.user!.id);
        if (message) {
            res.write(`data: ${message}\n\n`);
        }
    }, 1000);
    console.log('-- Interval setup, let\'s rock')
    req.on('close', () => {
        console.info(`client ${req.session.user!.name} has closed connection`);
        res.end();
        clearInterval(interval);
    });
});

export default router;