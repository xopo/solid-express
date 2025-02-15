import { WaitingMedia, dbUpdateWaitingMediaStatus } from "../db/queries";
import { STATIC_FILES } from "../routes/apihelper";
import { Dirent, createWriteStream, existsSync } from "fs";
import { readdir, rename, unlink } from "node:fs/promises";
import axios from "axios";
import { finished } from "stream/promises";
import { Readable } from "stream";
import { join } from "path";
import { cutAndSave, toLargeThumbnail } from "../routes/imageHelper";
import { MediaDataType, Thumbnail } from "../types";
import { mkdirSync } from "node:fs";

export function writeStream2File(name: string, data: any, env = "all") {
    console.log("*** writeStream2files", {
        name,
        env,
        process: process.env.NODE_ENV,
    });
    if (env === "all" || process.env.NODE_ENV === env) {
        const writable = createWriteStream(name);
        if (writable) {
            let dataString = "";
            switch (typeof data) {
                case "string":
                    dataString = data;
                    break;
                case "object":
                    dataString = JSON.stringify(data, null, 2);
                    break;
                default:
                    dataString = "- something went wrong or no data sent";
            }
            writable.write(dataString);
            writable.end();
        }
    }
}

// location is '' for mp3 and 'thumb' for thumbnails
export const newImagePath = (title: string) =>
    join(STATIC_FILES, "thumb", title) + ".webp";

const youtubeQualityOrder = ["mqdefault", "mp3", "mp2", "mq1"];

export const getExtension = (url: string) =>
    url.split("?")[0].split(".").reverse()[0];

export async function grabImage(
    media: WaitingMedia,
    details: MediaDataType,
    title: string,
) {
    const alternativeImgUrl = details.thumbnail || details.thumbnails[0].url;
    // works for youtube.com and youtu.be urls
    if (media.url.includes("youtu") && details.thumbnails.length) {
        const sorted = details.thumbnails.sort(
            (a, b) => b.preference - a.preference,
        );
        let smallThumbNail: Thumbnail | undefined = undefined;
        for (let quality of youtubeQualityOrder) {
            const target = sorted.find((f) => {
                const file = f.url.split("/").reverse()[0];
                return file.includes(quality) && file.includes(".webp");
            });
            if (target) {
                smallThumbNail = target;
                break;
            }
        }
        if (smallThumbNail) {
            const newPath = newImagePath(title);
            url2file(smallThumbNail.url, newPath);
        } else {
            // no preference, hence use default thumbnail and transform size
            toLargeThumbnail(alternativeImgUrl, newImagePath(title));
        }
    } else {
        const newPathLarge = newImagePath(title);
        toLargeThumbnail(details.thumbnail, newPathLarge);
    }
    await dbUpdateWaitingMediaStatus(media.id, "details");
}

const url2file = async (url: string, thumbPath: string) => {
    if (url.includes(".web")) {
        const content = await axios.get(url, { responseType: "stream" });
        if (content) {
            finished(
                Readable.from(content.data).pipe(createWriteStream(thumbPath)),
            );
        }
    } else {
        const content = await axios.get<Buffer>(url, {
            responseType: "arraybuffer",
        });
        if (content) {
            cutAndSave(content.data, thumbPath);
        }
    }
};
//getAllImages
export async function fsGetContent(partialPath = ""): Promise<Dirent[]> {
    const location = join(STATIC_FILES, partialPath);
    try {
        if (!existsSync(location)) {
            mkdirSync(location, { recursive: true });
        }

        return await readdir(STATIC_FILES, { withFileTypes: true });
    } catch (er) {
        console.log(er);
        process.exit(0);
    }
}

export async function imageWithTitleExists(title: string) {
    const images = await fsGetContent("thumb");
    const found = images
        .filter((ent) => ent.isFile())
        .find((entry) => entry.name.includes(title));
    console.log({ found });
    return !!found;
}

export const renameOld = async (oldName: string, newName: string) => {
    const pathToOld = join(STATIC_FILES, oldName);
    const pathToNew = join(STATIC_FILES, newName);
    rename(pathToOld, pathToNew);
};

export const removeFilesIfExists = async (media_id: string) => {
    const images = await readdir(STATIC_FILES, { withFileTypes: true });
    images
        .filter((ent) => ent.isFile())
        .filter((entry) => entry.name.includes(media_id))
        .forEach(async (entry) => {
            const path = join(STATIC_FILES, entry.name);
            await unlink(path);
        });
};
