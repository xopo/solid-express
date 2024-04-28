
export type MediaStore = {
    date: string;
    cursor: number;
    id: string;
}

export type UserConfig = {
    volume: number;
    cursor: number;
    play: number;
    history: MediaStore[];
}

const emptyData: UserConfig = {
    volume: 0.5,
    cursor: 0,
    play: 1,
    history: [],
};

const data = () => localStorage.getItem('media') || '{}';

export const getLocalStoragePreferences = () => {
    const preferences: typeof emptyData = JSON.parse(data());
    return {...emptyData, ...preferences};
}

export const getLocalStorageVolume = () => getLocalStoragePreferences().volume;

export const getLocalStorageCursor = () => getLocalStoragePreferences().cursor;

export const getLocalStoragePlay = () => getLocalStoragePreferences().play;


export const setLocalStorageVolume = (volume: number) => {
    localStorage.setItem('media', JSON.stringify({...getLocalStoragePreferences(), volume}));
}

export const setLocalStorageCursor = (cursor: number) => {
    localStorage.setItem('media', JSON.stringify({...getLocalStoragePreferences(), cursor}));
}

export const setLocalStoragePlay = (play: number) => {
    localStorage.setItem('media', JSON.stringify({...getLocalStoragePreferences(), play}));
}


export const setLocalStorageMedia = (id: string, cursor: number) => {
    const  date = new Date().toISOString();
    const oldHistory = getLocalStoragePreferences().history;
    const history = [...oldHistory.filter(item => item.id !== id), {id, cursor, date}]; 
    localStorage.setItem('media', JSON.stringify({...getLocalStoragePreferences(), history}));  
}

export const removeFromHistory = (id: string) => {
    const oldHistory = getLocalStoragePreferences().history;
    const history = oldHistory.filter(item => item.id !== id);
    localStorage.setItem('media', JSON.stringify({...getLocalStoragePreferences(), history}));
}