import {createSignal, createContext, useContext, JSX, Accessor, createResource, Resource, onMount, onCleanup } from 'solid-js';
import { apiGetMyUser, apiToggleGuest, apiToggleTable, apiUserAddSelf } from '../api';
import { agreedPlayDay, tables } from './const';
import { getData } from './utils';
import { getStoredSelf, storeSelf } from './storeutil';
import { Guest } from '../../server/routes/content';
import { effect } from 'solid-js/web';

export type User = Record<'self', string>;

export type Table = (typeof tables)[number];

export type Reservation = {
    name: string;
    table: Table;
}

export type DataType = {
    users: User[];
    tables: Reservation[];
};

export type ProviderData = {
    addReservation: (table: typeof tables[number]) => Promise<void>;
    changeDate: (offset?: number) => void;
    // checkUniqueUser: (n: string) => Promise<{ error: boolean; }>
    mySelf: Accessor<Self | null>;
    date: Accessor<string>;
    data: Resource<DataType>;
    // loginUser: (n: string, p: string) => void;
    // registerUser: (n: string, p: string) => void;
    refetch: () => void;
    removeGuest: (user: Guest) => void;
    toggleUser: () => void;
}

type AddReservation = {
    type: 'add',
    last: number,
}

const isDifferent = (a: any, b: any) => {
    return JSON.stringify(a) !== JSON.stringify(b);
}

const ReservationContext  = createContext<ProviderData>();

export type Self = {id: number, name: string, safeName: string};


const getWednesday = (offset = 0) => {
    const myDate = new Date();
    const day = myDate.getDay();
    myDate.setDate(myDate.getDate() + (agreedPlayDay + 7 - day) % 7 + offset * 7);
    return myDate.toUTCString().split(' ').slice(1, 4).join(' ');
}

export function ReservationProvider(props: {children: JSX.Element}) {
    const [offset,setOffset] = createSignal(0)
    const [date, setDate] = createSignal<string>(getWednesday(offset()))
    const [meMySelf] = createResource(apiGetMyUser);
    const [lastRequest, setLastRequest] = createSignal<AddReservation>()
    const [mySelf, setMyself] = createSignal(getStoredSelf);
    const now = () => new Date().getTime();
    const addReservation = async (nr: typeof tables[number]) => {
        if (lastRequest()?.type !== 'add' || now() - (lastRequest()?.last || 0) > 500) {
            setLastRequest({type: 'add', last: now()})
            const table = nr;
            const result = await apiToggleTable(btoa(date()), table);
            if (result.success) {
                refetch();
            }
        }
    }
    const changeDate = (offset = 1) => {
        setOffset(prev => {
            const newOffset = prev + offset;
            const nextWednesday = getWednesday(newOffset);
            setDate(nextWednesday);
            return newOffset;
        })
        refetch;
    }

    const toggleUser = async () => {
        const result = await apiUserAddSelf(btoa(date()));
        if (result.success) {
            refetch();
        }
    }

    const removeGuest = async (guest: string | Guest) => {
        const result = await apiToggleGuest(btoa(date()), guest)
        if (result.success) {
            refetch();
        }
    }

    const [data, {refetch}] = createResource(date, getData)

    let refetchInterval: number;
    onMount(() => {
        refetchInterval = window.setInterval(() => refetch(), 3000);
    })

    onCleanup(() => {
        clearInterval(refetchInterval);
    })

    effect(() => {
        if (meMySelf()) {
            const apiSelf = {...meMySelf(), safeName: `${meMySelf().id }-${meMySelf().name}`};
            setMyself(apiSelf);
            storeSelf(apiSelf);
        }
    })

    const value = {
        addReservation,
        changeDate,
        mySelf,
        data,
        date,
        removeGuest,
        refetch,
        toggleUser,
    }

    return (
        <ReservationContext.Provider value={value}>
            {props.children}
        </ReservationContext.Provider>

    );
}

export const useReservation = () => useContext(ReservationContext);