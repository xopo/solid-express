import path from "node:path";
import os from "node:os";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(import.meta.url)

const workerPath = path.join(__dirname, "../../workers/download.js");
const serverCpus = os.cpus().length;

let workerPool: Record<string, Worker | undefined> = {};

function getWorker(id: string, data: unknown) {
    const workers = Object.keys(workerPool).length;
    if (workers > serverCpus - 2) {
        return;
    }
    if (!workerPool[id]) {
        try {
            console.log('Create new worker with : ', workerPath)
            workerPool[id] = new Worker(workerPath, {
                workerData: data,
            });
        } catch (er) {
            console.log("Failed to create download worker", er);
            throw er;
        } finally {
            console.log('after starting a new worker')
        }
    }
    console.log("\n\n\n[stats]", {
        serverCpus,
        workerPoolSize: Object.keys(workerPool),
    });
    return workerPool[id];
}

function terminateWorker(id: string) {
    if (workerPool[id] !== undefined) {
        workerPool[id]?.removeAllListeners();
        workerPool[id]?.terminate();
        workerPool[id] = undefined;
        delete workerPool[id];
    }
}


function terminateAllWorkers() {
    for (let entry of Object.entries(workerPool)) {
        const [key, worker] = entry;
        worker?.removeAllListeners();
        worker?.terminate();
        delete workerPool[key];
    }
}

export { getWorker, terminateWorker, terminateAllWorkers };