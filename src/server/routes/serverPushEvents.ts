import { Router, Response } from "express";
import { isAuthorized } from "./auth";
import {
    dbGetCompleteMedia,
    dbGetDummyMedia,
    dbGetToDeleteMedia,
    dbGetUnAcknowledged,
    // dbGetWaitingMedia,
    dbRemoveCompletedMedia,
    dbRemoveDeletableFromDB,
    dbSetAcknowledged,
    dbSetDummyAsDone,
} from "../db/queries";
import eventEmitter, { EventTypes } from "../event";

const sseRoute = Router();

const setMessage = async (userId: number): Promise<string | null> => {
    const lastChange = await dbGetUnAcknowledged(userId);
    const completed = await dbGetCompleteMedia(userId);
    const deletable = await dbGetToDeleteMedia(userId);
    const dummy = await dbGetDummyMedia(userId);
    if (!lastChange && !completed && !deletable?.length && !dummy) {
        return null;
    }

    const change =
        lastChange ||
        completed ||
        (deletable?.length ? `delete ${deletable.length} files` : "");
    console.log("[SSE send message, found lastChange]:", change);
    if (deletable?.length > 0) {
        await dbRemoveDeletableFromDB();
        return null;
    }
    if (completed) {
        await dbRemoveCompletedMedia();
        return `refresh content ${completed.status}`;
    }
    if (dummy) {
        await dbSetDummyAsDone(dummy.id);
        return "media status: done";
    }
    if (lastChange) {
        await dbSetAcknowledged();
        return `media status: ${lastChange.status || "new"}`;
    }

    return "refresh page";
};

const intervalTime: Record<string, number> = {
    fast: 1000,
    slow: 5000,
    slower: 10000,
    enabled: 1,
};

const processMessage = async (user_id: number, res: Response) => {
    let speed = "slow";
    const message = await setMessage(user_id);
    console.info(
        "[SSE processMessage]: user_id=",
        user_id,
        " -message- ",
        message,
    );
    if (message) {
        res.write(`data: ${message}\n\n`);
        speed = "fast";
    }
    if (intervalTime.enabled) {
        console.info("[SSE processMessage]:", speed);
        setTimeout(() => {
            processMessage(user_id, res);
        }, intervalTime[speed]);
    }
};

const listener =
    (res: Response) => (data: { type: string; media_id?: string }) => {
        res.write(`data: media ${data.type} ${data.media_id || ""} \n\n`);
    };

sseRoute.get("/", isAuthorized, async (req, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const workerListener = listener(res);

    eventEmitter.on(EventTypes.WORKER, workerListener);

    req.on("resume", () => {
        console.info(`client ${req.session.user!.name} has opened connection`);
        res.write("data: connected\n\n");
        intervalTime.enabled = 1;
    });
    req.on("close", () => {
        console.info(`client ${req.session.user!.name} has closed connection`);
        res.end();
        eventEmitter.removeListener(EventTypes.WORKER, workerListener);
        intervalTime.enabled = 0;
    });
});

// async function sendWaitingFiles(user_id: number, res: Response) {
//     const sendWaitingFiles = await dbGetWaitingMedia(user_id);
//     res.write(`data: ${JSON.stringify(sendWaitingFiles)} \n\n`);
// }

export default sseRoute;
