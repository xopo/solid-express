import { NewFile } from "./components/media/AddMedia";
import BASE_URL from "./const";
import { EntryData } from "./context/appContext";

type Error = {
    error: string;
    data: undefined;
    success: undefined;
};

type Success<T> = {
    success: true;
    data: T;
};

type ApiResponse<T> = Success<T> | Error;

try {
    const { fetch: originalFetch } = window;
    window.fetch = async (...args) => {
        let [url, config] = args;
        const response = await originalFetch(url, config);
        if (
            [401, 403].includes(response.status) &&
            !["/login", "/register"].includes(location.pathname)
        ) {
            window.location.href = `${BASE_URL}login`;
        }
        return response;
    };
} catch (er) {}

const post = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const URL = `${BASE_URL}api/${url}`;
    try {
        const result = await fetch(URL, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify(data),
        });
        return await result.json();
    } catch (err) {
        return {
            error: (err as { message?: string })?.message || "error fetching",
            data: undefined,
            success: undefined,
        };
    }
};

const get = async <T>(url: string): Promise<ApiResponse<T>> => {
    const URL = `${BASE_URL}api/${url}`;
    return await (await fetch(URL)).json();
};

export const getTags = async () => {
    const result = await get<{ id: number; name: string }>("tags");
    console.log("get content result", result);
    return result?.data || [];
};

export const getContent = async (tags: string[]) => {
    const result =
        tags.length > 0
            ? await post<EntryData[]>("content", { tags })
            : await get<EntryData[]>("content");
    console.log("get content result", result);
    return result?.data || [];
};

export async function apiLogin(name: string, pass: string) {
    return post<null>("login", { name, pass: btoa(pass) });
}

export async function apiRegistration(name: string, pass: string) {
    return post("login/register", { name, pass: btoa(pass) });
}

export async function apiCheckUserUnique(name: string) {
    if (name.length > 4) {
        return get(`login/checkUser?name=${name}`);
    }
    return Promise.resolve({
        error: "numele trebuie sa contina min 4 charactere",
    });
}

export async function apiGetContent(date: string) {
    return post("content", { date });
}

export async function apiGetRoles() {
    return get<string[]>("content/roles");
}

export async function apiGetLabels() {
    const { data } = await get<{ id: number; name: string }[]>("tags");
    return data || [];
}

export const apiGetLabelsFor = (media_id: string) => async () => {
    console.log(
        "request for media_id",
        media_id,
        btoa(media_id),
        atob(btoa(media_id)),
    );
    const { data } = await get<{ id: number; enabled: number }[]>(
        `tags/media/${btoa(media_id)}`,
    );
    return data || [];
};

export async function apiSubmitNewMedia(url: string) {
    return post<
        | { success?: boolean; waiting?: NewFile }
        | { success: true; waiting: NewFile }
    >("content/add", { url });
}

export type DownloadMedia = {
    name: string;
    status: string;
    thumbnail: string;
    acknowledge: 0 | 1;
    title?: string;
    waiting_url: string;
    add_time: string;
};

export type Waiting = Exclude<DownloadMedia, "title"> & {
    title?: undefined;
    media_id: string;
    url?: undefined;
};

export type Confirmed = DownloadMedia & {
    media_id: string;
    categories?: string;
    description: string;
    epoch: number;
    thumbnail: string;
    duration_string: string;
    channel_url: string;
    uploader: string;
    upload_date: string;
    upload_url: string;
    url: string;
};

export function apiGetWaiting() {
    return post<(Waiting | Confirmed)[]>("content/getWaiting");
}

export function apiDeleteWaiting(file: Waiting | Confirmed) {
    const { media_id, waiting_url, url } = file;
    return post("content/delete", { media_id, url: url || waiting_url });
}

type Media = { media_id: string };
export async function apiRestartDownload(entry: Media, existing = false) {
    const { media_id } = entry;
    return post("content/reset", { media_id, existing });
}

export async function apiDeleteMedia(media_id: string) {
    return post("content/delete", { media_id });
}

export async function apiAddLabel(label: string) {
    return post("tags/add", { label });
}

export async function apiToggleLabelOnMedia(
    label_id: number,
    media_id: string,
) {
    return post("tags/media/toggle", { label_id, media_id });
}
