import { For, createSignal } from "solid-js";
import { Reservation, useReservation } from "../../provider/ReserveProvider";
import { tables } from "../../provider/const";
import TableForm from "../modal/TableForm";
import './tables.scss';

export default function Tables() {
    const context = useReservation();
    if (!context ) return null;
    const [addForm, setAddForm] = createSignal<Reservation['table']|false>(false);

    const onClickTable = async (table: Reservation['table']) => {
        const isSelected = context.data()?.tables.find(t => t.table === table);
        if (!isSelected) {
            setAddForm(table)
            return;
        }
        const isMine = isSelected?.user_id === context.mySelf()?.id;
        if (isMine) { // if is mine I can cancel
            context.addReservation(table)
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
                                mine: context.data()?.tables.find(t => t.table === table)?.user_id === context.mySelf()?.id
                            }}>
                                <div class='free'>
                                    <div>{table}</div>
                                </div>
                                <div class='reserved'>
                                    <div>{table}</div>
                                    <div class='who'>
                                        <div>🏓</div>
                                        <div>
                                            {context.data()?.tables.find(t => t.table === table)?.name}
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