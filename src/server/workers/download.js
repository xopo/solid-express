import { parentPort, workerData } from "worker_threads";
import { downloadMediaData, downloadFile } from "../routes/apihelper";
import { grabImage } from "../grabber/grab";
import {
    dbRemoveCompletedMedia,
    dbUpdateWaitingMediaId,
    dbGetWaitingByMediaId,
    dbUpdateWaitingMediaStatus,
    dbFileExists,
    dbAddNewFile,
    dbAddMediaToUser,
    dbAddNewDescription,
    descriptionInDb,
} from "../db/queries";
import { imageWithTitleExists } from "../grabber/grab";

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
async function getDetails(id, media_id) {
    const details = await downloadMediaData(workerData.url);
    // no details -> exit
    if (!details) {
        console.error(
            `\n\bWorker error on download ${workerData.url}, will exit now!\n\n`,
        );
        process.exit();
    }
    if (details.is_live) {
        await dbUpdateWaitingMediaStatus(media_id, "live");
        setCompleted();
    }

    // it is possible that id's are not the same
    if (details.id !== media_id) {
        await dbUpdateWaitingMediaId(id, details.id);
    }
    await dbUpdateWaitingMediaStatus(media_id, "details");
    return details;
}

// get image for the file
//@ts-ignore
async function getImage(title, details, media) {
    await imageWithTitleExists(title);
    await grabImage(media, details, title);
}

async function getMedia() {
    console.log("\n\n Worder get media\n\n");
    const { id, media_id, url, user_id } = workerData;
    try {
        const details = await getDetails(id, media_id);
        console.log("-- details", { id, url, user_id });

        const title = `${details.title.replace(/[^0-9a-z.\[\]]/gi, "")}[${details.id}]`;

        // update db with relevant info
        if (!(await dbFileExists(details.id))) {
            const file = await dbAddNewFile(details.id, title);
            await dbAddMediaToUser(file[0], user_id);
            await dbUpdateWaitingMediaStatus(media_id, "details");
        } else {
            console.log("-- dbFileExists");
        }
        if (!(await descriptionInDb(details.id))) {
            await dbAddNewDescription(details);
            await dbUpdateWaitingMediaStatus(media_id, "waiting");
        } else {
            console.error("-- details description already in db");
        }
        console.log("-- before image");
        await getImage(title, details, { ...workerData, media_id: details.id }); // media_id could be different from details.id, details.id has wright

        // inform SSE chante done
        parentPort?.postMessage({ type: status.GET_INFO });

        console.log(`\n\nDownload file ${url} here\n\n`);
        const result = await downloadFile(url, details.id);
        if (result) {
            parentPort?.postMessage({ type: status.GET_MP3 });
        } else {
            console.log("-- problem download file");
        }
        console.log("-- at the end");
        setTimeout(() => {
            dbRemoveCompletedMedia().then(() => {});
        }, 500);
        setTimeout(() => setCompleted(), 1000);
    } catch (er) {
        console.error(er);
    }
}
getMedia();
