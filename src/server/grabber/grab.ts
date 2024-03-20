import { Payload, Thumbnail } from "youtube-dl-exec";
import { WaitingMedia, dbAddNewDescription, dbAddNewFile, dbFileExists, dbGetDownloadingMedia, dbGetFirstWaitingMedia, dbGetNewWaitingMedia, dbUpdateWaitingMediaStatus, descriptionInDb } from "../db/queries";
import { STATIC_FILES, downloadFile, downloadMediaData } from "../routes/apihelper";
import { Dirent, createWriteStream, existsSync, readdirSync, renameSync, writeFileSync } from "fs";
import axios from 'axios';
import { finished } from "stream/promises";
import { Readable } from "stream";
import { join } from "path";
import { cutAndSave, toLargeThumbnail, toSmallThumbnail } from "../routes/imageHelper";

/**
 * Get max 20 new entries from db
 * For each get details from media and set in db
 * Return null when nothing to do
 */
export async function grabWaiting() {
    const newMedia = await dbGetNewWaitingMedia(2);
    if (newMedia?.length) {
        for(let media of newMedia) {
            console.log('[get image and details for media]: ', media.media_id, media.url)
            const details = await downloadMediaData(media.url);
            if (details) {
                dbUpdateWaitingMediaStatus(media.id, 'details')
                // get file name to use in image and file
                const title = `${details.title.replace(/[^0-9a-z.\[\]]/gi, '')}[${details.id}]`;
                // check image exist else 
                if (!(await imageWithTitleExists(title))) {
                    grabImage(media, details, title)
                }
                if (!(await dbFileExists(details.id))) {
                    await dbAddNewFile(details.id, title);
                    await dbUpdateWaitingMediaStatus(media.id, 'details')
                }
                if (!(await descriptionInDb(details.id))) {
                    await dbAddNewDescription(details);
                    await dbUpdateWaitingMediaStatus(media.id, 'waiting')
                }
                writeFileSync(`/tmp/${media.media_id}.details`, JSON.stringify(details, null, 2))
            }
        }
    }
}

export const newPathFileName = (title: string, extension: string, small=false) =>
    join(STATIC_FILES, `${title}`) +  (small ? '_small' : '') +  '.' +  extension;


/**
 * Get 1 entry from db
 * Grab mp3 from media
 * Set to local file
 */
export async function grabMedia() {
    const downloadInProgress = await dbGetDownloadingMedia();
    if (downloadInProgress) return;

    const waiting = await dbGetFirstWaitingMedia();
    if (!waiting) return;

    await dbUpdateWaitingMediaStatus(waiting.id, 'download')
    const result = await downloadFile(waiting.url, waiting.media_id);
    if (!result) return;
}

const youtubeQualityOrder = ['mp3', 'mp2', 'mq1']
export const getExtension = (url: string) => url.split('?')[0].split('.').reverse()[0];

export async function grabImage(media: WaitingMedia, details: Payload, title: string) {
    const alternativeImgUrl = details.thumbnail || details.thumbnails[0].url;

    if (media.url.includes('youtube') && details.thumbnails.length) {
        const sorted = details.thumbnails.sort((a, b) => a.preference - b.preference);
        const smallestWebp = sorted.find(f => f.url.split('.').reverse()[0] === 'webp')
        let smallThumbNail: Thumbnail | undefined = undefined;
        for(let quality of youtubeQualityOrder) {
            const target = sorted.find(f => {
                const file = f.url.split('/').reverse()[0];
                return file.includes(quality) && file.includes('.webp');
            });
            if (target) {
                smallThumbNail = target;
            }
        }
        if (smallThumbNail) {
            const extension = getExtension(smallThumbNail.url)
            const newPath = newPathFileName(title, extension);
            url2file(smallThumbNail.url, newPath )
        } else {
            // no preference, hence use default thumbnail and transform size
            toLargeThumbnail(alternativeImgUrl, newPathFileName(title, getExtension(alternativeImgUrl)))
        }
        if (smallestWebp) {
            const extension = getExtension(smallestWebp.url)
            const newPath = newPathFileName(title, extension, true);
            url2file(smallestWebp.url, newPath)
        } else { 
            const extension = getExtension(alternativeImgUrl)
            const newPath = newPathFileName(title, extension, true);
            // no preference, hence use default thumbnail and transform size
            toSmallThumbnail(alternativeImgUrl, newPath)
        }
    } else if (media.url.includes('rumble')) {
        const extension = getExtension(alternativeImgUrl)
        const newPathSmall = newPathFileName(title, extension, true);
        const newPathLarge = newPathFileName(title, extension);
        toSmallThumbnail(details.thumbnail, newPathSmall);
        toLargeThumbnail(details.thumbnail, newPathLarge);
    }
    dbUpdateWaitingMediaStatus(media.id, 'details')
}

const url2file = async (url: string, thumbPath: string) => {
    if (url.includes('.web')) {
        const content = await axios.get(url, {responseType: 'stream'});
        if (content) {
            finished(Readable.from(content.data).pipe(createWriteStream(thumbPath)))
        }
    } else {
        const content = await axios.get<Buffer>(url, {responseType: 'arraybuffer'});
        if (content) {
            cutAndSave(content.data, thumbPath)
        }
    }
}
//getAllImages
export async function fsGetContent(): Promise<Dirent[]> {
    if (!existsSync(STATIC_FILES)) {
        throw new Error(`folder /${STATIC_FILES} does not exist`)
    }

    return readdirSync(STATIC_FILES, {withFileTypes: true})
}

async function imageWithTitleExists(title: string) {
    const images = await fsGetContent();
    const found = images
        .filter(ent => ent.isFile())
        .find(entry => entry.name.includes(title))
    return !!found;
}


export const renameOld = (oldName: string, newName: string) =>{
    const pathToOld = join(STATIC_FILES, oldName);
    const pathToNew = join(STATIC_FILES, newName);
    renameSync(pathToOld, pathToNew);
}
