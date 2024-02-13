import {createSignal, createContext, useContext, JSX, Accessor, createResource, Resource, onMount, onCleanup } from 'solid-js';
import { apiGetMyUser, apiToggleGuest, apiToggleTable, apiUserAddSelf } from '../api';
import { agreedPlayDay, tables } from './const';
import { getData } from './utils';
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
    safeName: Accessor<string>;
    date: Accessor<string>;
    data: Resource<DataType>;
    refetch: () => void;
    removeGuest: (user: Guest) => void;
    toggleUser: () => void;
}

type AddReservation = {
    type: 'add',
    last: number,
}

// const isSame = (a: any, b: any) => {
//     return JSON.stringify(a) === JSON.stringify(b);
// }

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
    const [mySelf] = createResource<Self|null>(apiGetMyUser);
    const [lastRequest, setLastRequest] = createSignal<AddReservation>()
    // const [mySelf, setMyself] = createSignal(getStoredSelf());
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
        console.log('-- myself', mySelf())
    })
    
    const value = {
        addReservation,
        changeDate,
        safeName: () => mySelf() ? `${mySelf()?.id }-${mySelf()?.name}` : '--',
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