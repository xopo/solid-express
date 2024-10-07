import { dbGetFirstWaitingMedia } from "../db/queries";
import { getWorker } from "../workers/workers";
import eventEmitter, { EventTypes } from "../event";

async function downloadOrphanMedia() {
    const orphan = await dbGetFirstWaitingMedia();
    if (!orphan) {
        return;
    }
    const worker = getWorker(orphan.media_id, orphan);
    worker?.on("message", (data: { type: string }) => {
        console.log("router got data from worker", data);
        eventEmitter?.emit(EventTypes.WORKER, data);
    });
    worker?.on("exit", () => {
        console.log("Worker exited, make cleanup");
        worker.removeAllListeners();
    });
}

// cleanup - check for image/mp3 that should not exist ( nothing in db)
async function mediaCleanUp() {}

export { downloadOrphanMedia, mediaCleanUp };
