import { URL } from "node:url";

export type Platform = "youtube" | "rumble" | "facebook";
export type MediaType = { id: string; type: Platform };

export const extractMediaMetaFromUrl = (mediaUrl: string): MediaType => {
    const urlObj = new URL(mediaUrl);
    const { hostname } = urlObj;
    if (hostname.includes("youtu")) {
        const id = extractYoutubeId(urlObj);
        return { type: "youtube", id };
    }
    if (hostname.includes("rumble")) {
        return { type: "rumble", id: extractRumbleId(urlObj) };
    }
    if (hostname.includes("facebook") || hostname.includes("fb.watch")) {
        return { type: "facebook", id: extractFacebookId(urlObj) };
    }
    throw new Error(
        `[extractMediaMetaFromUrl] - cannot extract meta from url ${mediaUrl}`,
    );
};

const extractYoutubeId = (url: URL) => {
    const { hostname, pathname, searchParams } = url;
    if (hostname.includes(".com")) {
        if (pathname.includes("live")) {
            return pathname.split("/live").join("");
        }
        return searchParams.get("v") as string;
    } else if (hostname.includes(".be")) {
        return pathname.split("/").reverse()[0].split("?")[0];
    }
    throw new Error("[extractYoutubeId] - cannot extract from url: " + url);
};

const extractRumbleId = (url: URL) => {
    return url.href.split("rumble.com/")[1].split("-")[0];
};

const extractFacebookId = (url: URL): string => {
    if (url.hostname.includes("facebook.com")) {
        if (url.searchParams && url.searchParams.get("v")) {
            return url.searchParams.get("v") as string;
        } else if (url.pathname.includes("videos")) {
            return url.pathname.split("videos/")[1].split("/")[0];
        }
    }
    if (url.hostname.includes("fb.watch")) {
        return url.href.split("fb.watch/")[1].split("/")[0];
    }
    throw new Error("[extractFacebookId] - cannot extract from url: " + url);
};