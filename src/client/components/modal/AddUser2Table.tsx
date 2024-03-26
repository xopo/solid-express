import { For, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { apiAddUser2Table } from "../../api";
import { User, Guest, useReservation } from "../../provider/ReserveProvider";

type Add2TableProps =  {
    user: User|Guest;
    hide: (e: undefined) => void;
}

export default function AddUser2Table({user, hide}: Add2TableProps) {
    let formRef: HTMLFormElement;
    const [table, setTable] = createSignal<number|undefined>();
    const context = useReservation()

    const outClick = (ev: MouseEvent & { currentTarget: HTMLDivElement; target: Element;}) => {
        if (ev.target !== formRef && ev.target.contains(formRef)) {
            hide(undefined);
        }
    }
    const add2Table = async () => {
        if (context && !!table() ) {
            await apiAddUser2Table(context.date(), `${user.guest_id ?? user.user_id}-${user.name}`, table() || 1)
            context.refetch();
            hide(undefined);
        }
    }
    const faraMese = context?.data()?.tables.length === 0
    const label = faraMese
        ? 'Nu sunt mese rezervate'
        : `Adauga pe [${user.name}] ${table() ? `la masa ${table()}` : ''}`

    return(
        <Portal>
            <div class="addGuest" onclick={outClick}>
                <form ref={el => formRef = el}>
                    <select 
                        disabled={faraMese}
                        onchange={e => setTable( e.target.value ? parseInt(e.target.value, 10): undefined)}>
                        <option selected value={undefined}>Alege</option>
                        <For each={context?.data()?.tables}>
                            {table => <option value={table.table}>Masa - {table.table}</option>}
                        </For>
                    </select>
                    <button
                        type='button'
                        disabled={!table()}
                        onclick={add2Table}
                    >{label}</button>
                </form>
            </div>
        </Portal>
    );
}