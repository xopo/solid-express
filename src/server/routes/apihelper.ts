import youtubeDl from "youtube-dl-exec";
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

export const {
    parsed: { STATIC_FILES },
} = config() as { parsed: { STATIC_FILES: string } };
export const mediaLocation = STATIC_FILES;

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
    const result = (await youtubeDl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
    })) as MediaDataType;
    console.log("-- ond download media data", { url, result });
    return result;
};

export async function downloadFile(url: string, media_id: string) {
    try {
        const mp3File = await youtubeDl(url, {
            extractAudio: true,
            audioFormat: "mp3",
            noCheckCertificates: true,
            embedThumbnail: true,
            addMetadata: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ["referer:youtube.com", "user-agent:googlebot"],
            //@ts-ignore
            paths: mediaLocation,
        });
        await renameFile(media_id);
        await dbUpdateFileStatus(media_id, true);
        return !!mp3File;
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
