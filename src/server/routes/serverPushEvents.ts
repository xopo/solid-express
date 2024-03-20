import { Router, Response } from "express";
import { isAuthorized } from "./auth";
import { dbGetCompleteMedia, dbGetUnAcknowledged,  dbRemoveCompletedMedia, dbSetAcknowledged } from "../db/queries";

const sseRoute = Router();

const setMessage = async (userId: number): Promise<string | undefined> => {
    const lastChange = await dbGetUnAcknowledged();
    const completed = await dbGetCompleteMedia();
    if (!lastChange && !completed) {
        return;
    }
    
    const change = lastChange || completed;
    console.log('[SSE send message, found lastChange]:', change);
    
    if (lastChange) {
        await dbSetAcknowledged();
    } else if (completed) {
        await dbRemoveCompletedMedia();
    }
    return `refresh page`;
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