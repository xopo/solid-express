import { For, createSignal } from "solid-js";
import { Reservation, useReservation } from "../../provider/ReserveProvider";
import { tables } from "../../provider/const";
import TableForm from "../modal/TableForm";
import './tables.scss';

export default function Tables() {
    const context = useReservation();
    if (!context || !context.mySelf()) return null;
    const [addForm, setAddForm] = createSignal<Reservation['table']|false>(false);

    const simpleName = (name?: string) => {
        return name ? name.split('-')[1] : '';
    }

    const onClickTable = (table: Reservation['table']) => {
        const isMine = context.data()?.tables.find(t => t.table === table)?.name === context.mySelf().safeName;
        if (isMine) { // if is mine I can cancel
            context.addReservation(table)
        } else {
            setAddForm(table)
        }
    }

    const addTable = (table: Reservation['table']) => {
        setAddForm(false);
        context.addReservation(table);
    }
    return (
        <>
            <h3>Mese: {context.data()?.tables.length }</h3>
            <div class='details-tables'>
                <For each={tables}>
                    {table => (
                        <div
                            class="table"
                            onClick={() => onClickTable(table)}
                            classList={{
                                selected: !!context.data()?.tables.find(t => t.table === table),
                                mine: context.data()?.tables.find(t => t.table === table)?.name === context.mySelf().safeName
                            }}>
                                <div class='free'>
                                    <div>{table}</div>
                                </div>
                                <div class='reserved'>
                                    <div>{table}</div>
                                    <div class='who'>
                                        <div>🏓</div>
                                        <div>
                                            {simpleName(context.data()?.tables.find(t => t.table === table)?.name)}
                                        </div>
                                    </div>
                                </div>
                        </div>
                    )}
                </For>
            </div>
            {!!addForm() && <TableForm table={addForm() as Reservation['table']} addTable={addTable} hide={() => setAddForm(false)}/>}
        </>
    );

}