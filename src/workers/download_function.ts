import { parentPort, workerData } from "worker_threads";
import { downloadMediaData, downloadFile } from "../server/routes/apihelper";
import {
    imageWithTitleExists,
    grabImage,
    writeStream2File,
} from "../server/grabber/grab";
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
import { sanitizeDetails } from "./sanitizer";

const status = {
    GET_INFO: "get_info",
    GET_IMAGE: "get_image",
    GET_MP3: "get_mp3",
    COMPLETED: "completed",
};

const setCompleted = (id: string) => {
    parentPort?.postMessage({ type: `${status.COMPLETED} for id ${id}` });
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
        setCompleted(media_id);
    }

    // write details to file for debug in dev
    writeStream2File(`/tmp/${details.id}.json`, details, "development");

    // it is possible that id's are not the same
    if (details.id !== media_id) {
        await dbUpdateWaitingMediaId(id, details.id);
    }
    await dbUpdateWaitingMediaStatus(id, "details");

    return sanitizeDetails(details);
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
    if (!(await imageWithTitleExists(title))) {
        await grabImage(media, details, title);
    }
}

async function getMedia() {
    console.log("\n\n Worker get media\n\n");
    const { id, media_id, url, user_id, tags } = workerData as WorkerData;
    try {
        await dbUpdateWaitingMediaStatus(id, "details");
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
        } else {
            console.log("-- dbFileExists");
        }

        if (!(await descriptionInDb(details.id))) {
            // set status to be displayed on customer side
            await dbUpdateWaitingMediaStatus(id, "waiting");
            await dbAddNewDescription(details);
            parentPort?.postMessage({ type: status.GET_INFO, media_id });
        } else {
            console.error("-- details description already in db");
        }

        await getImage(title, details, { ...workerData, media_id: details.id }); // media_id could be different from details.id, details.id has wright

        await dbUpdateWaitingMediaStatus(id, "download");
        parentPort?.postMessage({ type: status.GET_MP3, media_id });

        await downloadFile(url, details.id, title);

        setTimeout(async () => {
            await dbUpdateWaitingMediaStatus(id, "done");
            await dbRemoveCompletedMedia();
        }, 500);

        setTimeout(() => setCompleted(details.id), 1000);
    } catch (er) {
        console.error(er);
    }
}

export default getMedia;
