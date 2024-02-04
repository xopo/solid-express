import {createSignal, createContext, useContext, createResource, JSX, Resource, Accessor } from 'solid-js';
import { apiGetMyUser, apiToggleTable } from '../api';
import { agreedPlayDay, tables } from './const';
import { getData } from './utils';

export type User = Record<'self'|'guest', string>;

export type Reservation = {
    name: string;
    table: (typeof tables)[number];
}

export type ProviderData = {
    addReservation: (table: typeof tables[number]) => Promise<void>;
    changeDate: (offset?: number) => void;
    mySelf: {id?: number, name?: string, safeName: () => string};
    date: Accessor<string>;
    data: Resource<{
        users: User[];
        tables: Reservation[];
    }>;
    refetch: () => void;
}

const ReservationContext  = createContext<ProviderData>();

export type Self = {id: number, name: string};


const getWednesday = (offset = 0) => {
    const myDate = new Date();
    const day = myDate.getDay();
    myDate.setDate(myDate.getDate() + (agreedPlayDay + 7 - day) % 7 + offset * 7);
    return myDate.toUTCString().split(' ').slice(1, 4).join(' ');
}

export function ReservationProvider(props: {children: JSX.Element}) {
    const [mySelf] = createResource<Self>(apiGetMyUser);
    const [offset,setOffset] = createSignal(0)
    const [date, setDate] = createSignal<string>(getWednesday(offset()))
    const safeName = () => `${mySelf()?.id}-${mySelf()?.name}`;
    const addReservation = async (nr: typeof tables[number]) => {
        const table = {name: safeName(), table: nr}
        const result = await apiToggleTable(btoa(date()), table);
        if (result.success) {
            refetch()
        }
    }
    const changeDate = (offset = 1) => {
        setOffset(prev => {
            const newOffset = prev + offset;
            const nextWednesday = getWednesday(newOffset);
            setDate(nextWednesday);
            return newOffset;
        })
    }
    const [data, {refetch}] = createResource(date, getData)
    const value = {
        addReservation,
        changeDate,
        mySelf: {
            ...mySelf(),
            safeName,
        },
        data,
        date,
        refetch
    }

    return (
        <ReservationContext.Provider value={value}>
            {props.children}
        </ReservationContext.Provider>

    );
}

export const useReservation = () => useContext(ReservationContext);