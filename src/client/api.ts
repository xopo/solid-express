import BASE_URL from "./const";

type Error = {
    error: string;
    data: undefined;
    success: undefined;
}

type Success<T> = {
    success: true;
    data: T;
}

type ApiResponse<T> = Success<T> | Error;

try {
    const {fetch: originalFetch} = window;
    window.fetch = async (...args) => {
        let [url, config] = args;
        const response = await originalFetch(url, config);
        if ([401, 403].includes(response.status) && !['/login', '/register'].includes(location.pathname)) {
            window.location.href = `${BASE_URL}login`;
        }
        return response
    }
} catch(er) {}

const post = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const URL = `${BASE_URL}api/${url}`;
    const result = await fetch(URL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
    })

    return await result.json();
}

const get = async <T>(url: string): Promise<ApiResponse<T>> => {
    const URL = `${BASE_URL}api/${url}`;
    return await (await fetch(URL)).json()
}

export async function apiLogin(name: string, pass: string) {
    return post('login', {name, pass: btoa(pass)})
}


export async function apiRegistration(name: string, pass: string) {
    return post('login/register', {name, pass: btoa(pass)})
}


export async function apiCheckUserUnique(name: string) {
    if (name.length > 4) {
        return get(`login/checkUser?name=${name}`)
    }
    return Promise.resolve({error: 'numele trebuie sa contina min 4 charactere'})
}

export async function apiGetContent(date: string) {
    return post('content', {date})
}

export async function apiGetRoles() {
    return get<string[]>('content/roles')
}



export async function apiSubmitNewMedia(url: string) {
    return post('content/add', {url});
}

export type DownloadMedia = {
    name: string;
    status: string;
    thumbnail: string;
    acknowledge: 0|1;
    title?: string;
    waiting_url: string;
    add_time: string;
}

export type Waiting = Exclude<DownloadMedia, 'title'> & {
    title?: undefined;
}

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
}

export  function apiGetWaiting() {
    return  post<(Waiting|Confirmed)[]>('content/getWaiting');
}
