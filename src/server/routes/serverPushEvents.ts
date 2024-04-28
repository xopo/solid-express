import { Router, Response } from "express";
import { isAuthorized } from "./auth";
import { dbGetCompleteMedia, dbGetDummyMedia, dbGetToDeleteMedia, dbGetUnAcknowledged,  dbRemoveCompletedMedia, dbRemoveDeletableFromDB, dbSetAcknowledged, dbSetDummyAsDone } from "../db/queries";

const sseRoute = Router();

const setMessage = async (userId: number): Promise<string | null> => {
    console.info('1 last change');
    const lastChange = await dbGetUnAcknowledged(userId);
    console.info('2 complete media');
    const completed = await dbGetCompleteMedia(userId);
    console.info('3 get to delete media');
    const deletable = await dbGetToDeleteMedia(userId);
    console.info('4 get dummy media');
    const dummy = await dbGetDummyMedia(userId);
    if (!lastChange && !completed && !deletable?.length && !dummy) {
        return null;
    }

    const change = lastChange || completed || (deletable?.length ? `delete ${deletable.length} files` : '');
    console.log('[SSE send message, found lastChange]:', change);
    if (deletable?.length > 0) {
        await dbRemoveDeletableFromDB();
        return null;
    }
    if (completed) {
        await dbRemoveCompletedMedia();
        return `refresh content ${(completed).status}`;
    } 
    if (dummy) {
        await dbSetDummyAsDone(dummy.id);
        return 'media status: done';
    } 
    if (lastChange) {
        await dbSetAcknowledged();
        return `media status: ${lastChange.status || 'new'}`;
    } 
    
    return 'refresh page';
}


const intervalTime: Record<string, number> = {
    fast: 1000,
    slow: 5000,
    slower: 10000,
    enabled: 1,
}

const processMessage = async (user_id: number, res: Response) => {
    console.info('[SSE processMessage]: user_id=', user_id)
    let speed = 'slow';
    const message = await setMessage(user_id);
    if (message) {
        res.write(`data: ${message}\n\n`);
        speed = 'fast';
    }
    if (intervalTime.enabled) {
        console.info('[SSE processMessage]:', speed)
        setTimeout(() => {
            processMessage(user_id, res);
        }, intervalTime[speed]);
    }
}

sseRoute.get('/', isAuthorized,  async (req, res:Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    // const interval = setInterval( async () => {
    //    processMessage(req.session.user!.id, res);
    // }, intervalTime.fast);

    setTimeout(() => {
        processMessage(req.session.user!.id, res);
    }, 1000);
    

    req.on('resume', () => {
        console.info(`client ${req.session.user!.name} has opened connection`);
        res.write('data: connected\n\n');
        intervalTime.enabled = 1;
    });
    req.on('close', () => {
        console.info(`client ${req.session.user!.name} has closed connection`);
        res.end();
        intervalTime.enabled = 0;
    });
});

export default  sseRoute;