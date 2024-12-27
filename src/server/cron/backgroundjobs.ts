import {
    dbRemoveWaitingMedia,
    dbUpdateRetryCount,
    dbGetFirstWaitingMedia,
    dbRemoveDeletableFromDB,
    dbRemoveFileByMediaId,
    dbRemoveMediaFromUser,
} from "../db/queries";
import { getWorker, terminateWorker } from "../workers/workers";
import eventEmitter, { EventTypes } from "../event";

function moreThan5Minutes(date?: string): boolean {
    if (!date) {
        // in case the job was never scheduled
        return true;
    }
    const now = Date.now();
    const jobDate = new Date(date).getTime();
    const diff = now - jobDate;
    const hours = Math.floor((diff / (1000 * 3600)) % 60);
    if (hours > 0) return true;
    // return if minutes `> moreThan5Minutes
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    console.log({ minutes });
    return minutes > 5;
}

async function downloadOrphanMedia() {
    const orphan = await dbGetFirstWaitingMedia();
    console.log({ orphan });
    if (!orphan || !moreThan5Minutes(orphan.add_time)) {
        console.log("orphan check exit");
        return;
    }
    if (orphan.retry > 3) {
        await dbRemoveMediaFromUser(orphan.media_id, orphan.user_id);
        await dbRemoveWaitingMedia(orphan.media_id);
        return dbRemoveFileByMediaId(orphan.media_id);
    }
    await dbUpdateRetryCount(orphan.media_id, orphan.retry);

    // worker will be undefined if there are multiple workers already busy
    const worker = getWorker(orphan.media_id, orphan);

    // any worker should finish job on max 5 minutes
    const workerOut = setTimeout(() => {
        worker?.terminate().then(() => {
            throw (new Error('Worker timeout 5 minues has passed'));
        })
    })

    if (!worker) return;

    worker?.on("message", (data: { type: string }) => {
        clearTimeout(workerOut)
        console.log("router got data from worker", data);
        eventEmitter?.emit(EventTypes.WORKER, data);
    });
    worker?.on("exit", () => {
        clearTimeout(workerOut)
        console.log("Worker exited, make cleanup");
        worker.removeAllListeners();
        terminateWorker(orphan.media_id);
    });
}
// delete entries from waiting media table ('marked with delete')
// cleanup - check for image/mp3 that should not exist ( nothing in db)
async function mediaCleanUp() {
    const deleted = await dbRemoveDeletableFromDB();
    if (deleted > 0) {
        eventEmitter?.emit(EventTypes.WORKER, { type: "delete" });
    }
}

export { downloadOrphanMedia, mediaCleanUp };