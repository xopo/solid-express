import { parentPort, workerData } from "worker_threads";

import { downloadMediaData, downloadFile } from "../server/routes/apihelper";
import { grabImage, writeStream2File } from "../server/grabber/grab";
import {
    dbRemoveCompletedMedia,
    dbUpdateWaitingMediaId,
    dbUpdateWaitingMediaStatus,
    dbFileExists,
    dbAddNewFile,
    dbAddMediaToUser,
    dbAddNewDescription,
    descriptionInDb,
    dbSetMediaTags,
} from "../server/db/queries";
import { imageWithTitleExists } from "../server/grabber/grab";

const status = {
    GET_INFO: "get_info",
    GET_IMAGE: "get_image",
    GET_MP3: "get_mp3",
    COMPLETED: "completed",
};

const setCompleted = () => {
    parentPort?.postMessage({ type: status.COMPLETED });
    process.exit();
};

// get details from source
// in case of problem close the worker
// do the db diligence related to updating tables
async function getDetails(id: number, media_id: string) {
    const details = await downloadMediaData(workerData.url);
    if (!details) {
        console.error(
            `\n\bWorker error on download ${workerData.url}, will exit now!\n\n`,
        );
        process.exit();
    }
    if (details.is_live) {
        await dbUpdateWaitingMediaStatus(id, "live");
        setCompleted();
    }

    // write details to file for debug in dev
    writeStream2File(`/tmp/${details.id}.json`, details, "development");

    // it is possible that id's are not the same
    if (details.id !== media_id) {
        await dbUpdateWaitingMediaId(id, details.id);
    }
    await dbUpdateWaitingMediaStatus(id, "details");
    return details;
}

type WorkerData = {
    id: number;
    media_id: string;
    url: string;
    user_id: number;
    tags: number[];
};

// get image for the file
//@ts-ignore
async function getImage(title: string, details, media) {
    await imageWithTitleExists(title);
    await grabImage(media, details, title);
}

async function getMedia() {
    console.log("\n\n Worder get media\n\n");
    const { id, media_id, url, user_id, tags } = workerData as WorkerData;
    try {
        const details = await getDetails(id, media_id);
        console.log("-- details", { id, url, user_id });

        const title = `${details.title.replace(/[^0-9a-z.\[\]]/gi, "")}[${details.id}]`;

        // update db with relevant info
        if (!(await dbFileExists(details.id))) {
            const file = await dbAddNewFile(details.id, title);
            await dbAddMediaToUser(file[0], user_id);
            if (tags?.length > 0) {
                await dbSetMediaTags(media_id, user_id, tags);
            }
            await dbUpdateWaitingMediaStatus(id, "details");
        } else {
            console.log("-- dbFileExists");
        }
        if (!(await descriptionInDb(details.id))) {
            await dbAddNewDescription(details);
            await dbUpdateWaitingMediaStatus(id, "waiting");
        } else {
            console.error("-- details description already in db");
        }
        console.log("-- before image");
        await getImage(title, details, { ...workerData, media_id: details.id }); // media_id could be different from details.id, details.id has wright

        // inform SSE chante done
        parentPort?.postMessage({ type: status.GET_INFO, media_id });

        console.log(`\n\nDownload file ${url} here\n\n`);
        const result = await downloadFile(url, details.id);
        if (result) {
            parentPort?.postMessage({ type: status.GET_MP3, media_id });
        } else {
            console.log("-- problem download file");
        }
        console.log("-- at the end");
        setTimeout(() => {
            dbRemoveCompletedMedia().then(() => { });
        }, 500);
        setTimeout(() => setCompleted(), 1000);
    } catch (er) {
        console.error(er);
    }
}

export default getMedia;