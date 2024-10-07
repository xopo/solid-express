import path from "node:path";
import { Worker } from "node:worker_threads";

const workerPath = path.join(__dirname, "./download.js");
console.log("\n\n", workerPath);

let workerPool: Record<string, Worker | undefined> = {};

function getWorker(id: string, data: unknown) {
    if (!workerPool[id]) {
        try {
            workerPool[id] = new Worker(workerPath, {
                workerData: data,
            });
        } catch (er) {
            console.log("Failed to create download worker", er);
            throw er;
        }
    }
    return workerPool[id];
}

function terminateWorker(id: string) {
    if (workerPool[id]) {
        workerPool[id]?.removeAllListeners();
        workerPool[id]?.terminate();
        workerPool[id] = undefined;
    }
}

function terminateAllWorkers() {
    for (let entry of Object.entries(workerPool)) {
        entry[1]?.removeAllListeners();
        entry[1]?.terminate();
    }
}

export { getWorker, terminateWorker, terminateAllWorkers };
