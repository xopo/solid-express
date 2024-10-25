import BASE_URL from "../../../const";

function getMediaLink(name: string, type: string): string {
    return `${BASE_URL}media/${name}.${type}`;
}

export function getMp3Link(name: string): string {
    return getMediaLink(name, "mp3");
}

export function getWebpLink(name: string): string {
    return getMediaLink(name, "webp");
}