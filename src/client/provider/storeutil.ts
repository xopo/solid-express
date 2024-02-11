import { DataType, Self } from "./ReserveProvider";

type StoreKey = 'self' | 'data';

const saveInStore = (key: StoreKey, data: Self) => {
    window.sessionStorage.setItem(key, JSON.stringify(data))
}

const getFromStorage = (key: StoreKey) => {
    return window.sessionStorage.getItem(key)
}

export const getStoredSelf = (): Self|null => {
    const self = getFromStorage('self');
    return self ? JSON.parse(self) : null
}

export const storeSelf = (data: Self) => {
    saveInStore('self', data);
}

export const storeData = (date: string, data: DataType) => {
    const storedData = getFromStorage('data');
    const inStore = storedData === null ? {} : JSON.parse(storedData as string);
    const newStore = {...inStore, [date]: data};
    saveInStore('data', newStore);
}

const emptyData = {
    users: [],
    tables: [],
}

export const getStoredData = (date: string) => {
    const storedData = getFromStorage('data');
    if (!storedData) return emptyData;
    const parsedData = JSON.parse(storedData as string);
    if (date in parsedData) {
        return parsedData[date];
    }
    return emptyData;
}