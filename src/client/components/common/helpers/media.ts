import BASE_URL from "../../../const";

function getMediaLink(name: string, type: string, subfolder = "/"): string {
    return `${BASE_URL}media${subfolder}${name}.${type}`;
}

export function getMp3Link(name: string): string {
    return getMediaLink(name, "mp3");
}

export function getWebpLink(name: string): string {
    return getMediaLink(name, "webp", "/thumb/");
}
