import BASE_URL from "./const";
import { Table } from "./provider/ReserveProvider";

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


export async function apiRegistration(name: string, pass: string, id?: number): Promise<{success: boolean} | {error: boolean, message: string}> {
    return post('login/register', {name, pass: btoa(pass), id})
}

export type CheckUserResponse = { error: string } | { data: { reset: boolean, id: number }, error: undefined };

export async function apiCheckUserUnique(name: string) {
    if (name.length > 4) {
        return get(`login/checkUser?name=${name}`) as Promise<CheckUserResponse>;
    }
    return Promise.resolve({error: 'numele trebuie sa contina min 4 charactere'})
}

export async function apiGetContent(date: string) {
    return post('content', {date})
}

export async function apiUserAddSelf(date: string) {
    return post('content/addSelf', {date})
}

export async function apiAddUser2Table(date: string, name: string, table: number) {
    return post('content/add2Table', {date, name, table})
}

export async function apiRemoveUserFromTable(reservation_id: number, table: number, name: string) {
    return post('content/removeFromTable', {reservation_id, table, name})
}

export async function apiToggleTable(date: string, table: Table) {
    return post('content/toggleTable', {date, table})
}

export async function apiToggleGuest(date: string, guest: string) {
    return post('content/toggleGuest', {date, guest})
}

export async function apiGetMyUser() {
    return get('login/getSelf')
}

export async function apiGetUsers() {
    return get('login/users');
}

export async function apiAddUser(user: {name: string, pass: string}) {
    return post('login/newUser', {user})
}

export async function apiLogout() {
    sessionStorage.clear();
    const result = await post('login/logout');
    console.log({result})
}

export async function apiResetPassword(id: number) {
    return post('login/resetPassword', {id})
}