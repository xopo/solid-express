import { trim, escape, isURL, isNumeric } from "validator";
import { MediaDataType } from "../server/types";

const sanitizeUrl = (url: string, removeQuery = true) => {
    if (!isURL(url)) return "";
    return removeQuery ? url.split("?")[0] : url;
};

export const sanitizeDetails = (details: MediaDataType) => {
    const {
        categories,
        channel_url,
        description,
        duration_string,
        epoch,
        id,
        original_url,
        thumbnail,
        thumbnails,
        title,
        upload_date,
        uploader,
        uploader_url,
    } = details;

    return {
        categories: categories.map((cat) => trim(escape(cat))),
        channel_url: sanitizeUrl(channel_url),
        description: trim(escape(description)),
        duration_string: trim(escape(duration_string)),
        epoch: isNumeric(`${epoch}`) ? epoch : Date.now(),
        id: trim(escape(id)),
        original_url: sanitizeUrl(original_url),
        thumbnail: sanitizeUrl(thumbnail),
        thumbnails: thumbnails.map((th) => ({
            id: isNumeric(th.id) ? th.id : "0",
            url: sanitizeUrl(th.url),
            preference: isNumeric(`${th.preference}`) ? th.preference : 0,
        })),
        title: trim(escape(title)),
        upload_date: trim(escape(upload_date)),
        uploader: trim(escape(uploader)),
        uploader_url: trim(escape(isURL(uploader_url) ? uploader_url : "")),
    };
};
