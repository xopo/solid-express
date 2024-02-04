import BASE_URL from "./const";
import { Reservation } from "./provider/ReserveProvider";

try {
    const {fetch: originalFetch} = window;
    window.fetch = async (...args) => {
        let [url, config] = args;
        //@ts-ignore
        const response = await originalFetch(url, config);
        if ([401, 403].includes(response.status)) {
            window.location.href = `${BASE_URL}login`;
        }
        return response
    }
} catch(er) {}

const post = async (url: string, data?: any) => {
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

const get = async (url: string) => {
    const URL = `${BASE_URL}api/${url}`;
    return await (await fetch(URL)).json()
}

export async function apiLogin(name: string, pass: string): Promise<{success: boolean} | {error: boolean, message: string}> {
    return post('login', {name, pass: btoa(pass)})
}

export async function apiGetContent(date?: string) {
    const extra = date ? `?date=${date}` : '';
    return post(`content${extra}`)
}

export async function apiUserAddSelf(date: string) {
    return post('content/addSelf', {date})
}

export async function apiToggleTable(date: string, table: Reservation) {
    return post('content/toggleTable', {date, table})
}

type Guest = {guest: {name: string, user: string}}

export async function apiToggleGuest(date: string, guest: Guest) {
    return post('content/toggleGuest', {date, guest})
}

export async function apiGetMyUser() {
    return get('login/getSelf')
}