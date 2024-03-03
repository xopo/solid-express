import BASE_URL from "./const";

type Error = {
    error: string;
    data: undefined;
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

