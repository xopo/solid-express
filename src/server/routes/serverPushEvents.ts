import { Router, Response } from "express";
import { isAuthorized } from "./auth";
import { dbGetCompleteMedia, dbGetToDeleteMedia, dbGetUnAcknowledged,  dbRemoveCompletedMedia, dbRemoveDeletableFromDB, dbSetAcknowledged } from "../db/queries";

const sseRoute = Router();

const setMessage = async (userId: number): Promise<string | null> => {
    const lastChange = await dbGetUnAcknowledged();
    const completed = await dbGetCompleteMedia();
    const deletable = await dbGetToDeleteMedia();
    if (!lastChange && !completed && !deletable?.length) {
        return null;
    }

    const change = lastChange || completed || (deletable?.length ? `delete ${deletable.length} files` : '');
    console.log('[SSE send message, found lastChange]:', change);
    console.error('remember to check if the change belong to current user');
    if (lastChange) {
        await dbSetAcknowledged();
        return `media status: ${lastChange.status || 'new'}`;
    } else if (completed) {
        await dbRemoveCompletedMedia();
        return `refresh content ${completed.status}`;
    } else if (deletable?.length) {
        await dbRemoveDeletableFromDB();
        return null;
    }
    return 'refresh page';
}

sseRoute.get('/', isAuthorized,  async (req, res:Response) => {
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

    req.on('close', () => {
        console.info(`client ${req.session.user!.name} has closed connection`);
        res.end();
        clearInterval(interval);
    });
});

export default  sseRoute;