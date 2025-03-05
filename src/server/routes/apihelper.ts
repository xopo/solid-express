import { MediaDataType } from "../types";
import { join } from "node:path";
import { config } from "dotenv";
import {
    dbGetWaitingByMediaId,
    dbUpdateFileStatus,
    dbUpdateWaitingMediaStatus,
} from "../db/queries";
import { fsGetContent, renameOld } from "../grabber/grab";
import { unlink } from "node:fs";
import YTDlpWrap from "yt-dlp-wrap";
import { access } from "node:fs/promises";
import { constants } from "node:fs";

let ytdlp: YTDlpWrap | null = null;

export const {
    parsed: { STATIC_FILES, ENABLE_DOWNLOAD, YT_PATH },
} = config() as {
    parsed: { STATIC_FILES: string; ENABLE_DOWNLOAD: string; YT_PATH: string };
};
try {
    console.info("yt-dlp path: ", YT_PATH);
    if (!YT_PATH) {
        throw new Error(YT_PATH);
    }
    access(YT_PATH, constants.F_OK).catch((er) => {
        throw new Error(er);
    });
} catch (er) {
    console.log("Problem accessing yt-dlp binary!!", er);
    process.exit(0);
}

function getYtdlp() {
    if (ytdlp === null) {
        ytdlp = new YTDlpWrap(YT_PATH);
    }
    return ytdlp;
}
const ytDLP = getYtdlp();

export const mediaLocation = STATIC_FILES;
// console.log({ STATIC_FILES, ENABLE_DOWNLOAD });

export const titleSafe = (title: string, id: string) =>
    `${title.replace(/[^0-9a-z.\[\]]/gi, "")}[${id}]`;
export const newPathFileName = (mediaLocation: string, titleSafe: string) =>
    join(mediaLocation, `${titleSafe}`);

type ThumbType = {
    url: string;
};
export function selectThumbnail(thumbs: ThumbType[], defaultThumbnail: string) {
    // get mq
    const mqThumbs = thumbs.filter(
        (ob) => ob.url.includes("mq") && ob.url.includes("webp"),
    );
    if (mqThumbs.length) return mqThumbs[0]?.url;

    // or get hq
    const hqThumbs = thumbs.filter(
        (ob) => ob.url.includes("hq") && ob.url.includes("webp"),
    );
    if (hqThumbs.length) return hqThumbs[0]?.url;

    // or return default thumbnail
    return defaultThumbnail;
}

export type DownloadMedia = {};

export const downloadMediaData = async (url: string) => {
    // const metadata = (await ytDLP.getVideoInfo(url)) as MediaDataType;
    const metadata = await ytDLP.execPromise([
        url,
        "--no-cache-dir",
        "--dump-json",
        "--skip-download",
    ]);
    return JSON.parse(metadata) as MediaDataType;
};

// download and create a readable stream
// or download and emit progress for event emitter
// https://github.com/foxesdocode/yt-dlp-wrap
export async function downloadFile(
    url: string,
    media_id: string,
    title: string,
) {
    try {
        const mp3File = `${mediaLocation}/${title}.mp3`;
        console.log(
            url,
            "** before yt-dlp download file, check where it is saved and stuff",
            mp3File,
        );

        const readableStream = await ytDLP.execPromise([
            url,
            "-x",
            "--audio-format",
            "mp3",
            "-o",
            mp3File,
            "--add-metadata",
            "--embed-thumbnail",
        ]);
        console.log("----- done", readableStream);
        void dbUpdateFileStatus(media_id, true);
        return { completed: true };
    } catch (er) {
        console.error(er);
        return { completed: false };
    }
}

export async function renameFile(media_id: string) {
    const target = await dbGetWaitingByMediaId(media_id);
    if (target) {
        const { id, name } = target;
        const files = await fsGetContent();
        if (files?.length) {
            const downloads = files.filter(
                (f) => f.isFile() && f.name.includes(media_id),
            );
            if (downloads?.length) {
                for (let entity of downloads) {
                    if (!entity.name.includes(name)) {
                        if (entity.name.includes(".mp3")) {
                            await renameOld(entity.name, `${name}.mp3`);
                            dbUpdateWaitingMediaStatus(id, "done");
                        } else {
                            unlink(`${entity.path}${entity.name}`, (err) => {
                                if (err) throw new Error(err.message);
                            });
                        }
                    }
                }
            }
        }
    }
}