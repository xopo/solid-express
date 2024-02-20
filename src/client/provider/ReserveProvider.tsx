import { createSignal, createContext, useContext, JSX, Accessor,
        createResource, Resource, onCleanup, Signal } from 'solid-js';
import {createStore, unwrap, reconcile} from 'solid-js/store'
import { apiGetMyUser, apiToggleGuest, apiToggleTable, apiUserAddSelf } from '../api';
import { agreedPlayDay, tables } from './const';
import { getData } from './utils';
import { Guest } from '../../server/routes/content';
import BASE_URL from '../const';
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
    name: Accessor<string>;
    refetch: () => void;
    removeGuest: (user: Guest) => void;
    toggleUser: () => void;
}

type AddReservation = {
    type: 'add',
    last: number,
}


const ReservationContext  = createContext<ProviderData>();

export type Self = {id: number, name: string, safeName: string};


const getWednesday = (offset = 0) => {
    const myDate = new Date();
    const day = myDate.getDay();
    myDate.setDate(myDate.getDate() + (agreedPlayDay + 7 - day) % 7 + offset * 7);
    const isoDate = myDate.toISOString().split('T');
    return `${isoDate[0]}T00:00:00.000Z`
}

function createDeepSignal<T>(value: T): Signal<T> {
    const [store, setStore] = createStore({value})
    return[
        () => store.value,
        (v: T) => {
            const unwrapped = unwrap(store.value)
            typeof v === "function" && (v = v(unwrapped))
            setStore("value", reconcile(v))
            return store.value
        }
    ] as Signal<T>;
}

export function ReservationProvider(props: {children: JSX.Element}) {
    const [offset,setOffset] = createSignal(0)
    const [date, setDate] = createSignal<string>(getWednesday(offset()))
    const [mySelf] = createResource<Self|null>(apiGetMyUser);
    const [lastRequest, setLastRequest] = createSignal<AddReservation>()
    let serverEvent: EventSource ;
    onCleanup(() => {
        serverEvent.close()
    })
    
    effect(() => {
        if (mySelf()?.id) {
            serverEvent = new EventSource(`${BASE_URL}api/stats`)
            serverEvent.onmessage = (msg: any) =>  {
                if (msg.data !== mySelf()?.safeName) {
                    refetch();
                }
            }
            serverEvent.onerror = e => console.error(e.toString());
            serverEvent.onopen = e => console.info('Server Event is open for business', e)
        }
    })

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

    const [data, {refetch}] = createResource(date, getData, {
        storage: createDeepSignal
    })

    const value = {
        addReservation,
        changeDate,
        safeName: () => mySelf() ? `${mySelf()?.id }-${mySelf()?.name}` : '--',
        name: () =>  mySelf()?.name || '',
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