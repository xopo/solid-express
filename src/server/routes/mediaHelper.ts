import url from 'node:url';
import { parse } from 'node:querystring';

export type Platform = 'youtube'|'rumble';
export type MediaType = {id: string, type: Platform}

export const extractMediaMetaFromUrl = (mediaUrl: string): MediaType => {
    if (mediaUrl.includes('youtu')) {
        const id = extractYoutubeId(mediaUrl)
        return {type: 'youtube', id}
    }
    if (mediaUrl.includes('rumble')) {
        return { type: 'rumble', id: extractRumbleId(mediaUrl)};
    }
    throw new Error(`[extractMediaMetaFromUrl] - cannot extract meta from url ${url}`);
}


const extractYoutubeId = (mediaUrl: string) => {
    if (mediaUrl.includes('.com')) {
        const qryString = url.parse(mediaUrl).query;
        if (qryString) {
            const {v} = parse(qryString) as {v: string};
            return v;
        }
    } else if (mediaUrl.includes('.be')) {
        return mediaUrl.split('/').reverse()[0].split('?')[0]
    }
    throw new Error('[extractYoutubeId] - cannot extract from url: ' + url)
}

const extractRumbleId = (mediaUrl: string) => {
    return mediaUrl.split('rumble.com/')[1].split('-')[0]
}