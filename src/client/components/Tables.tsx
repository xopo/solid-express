import { For } from "solid-js";
import { useReservation } from "../provider/ReserveProvider";
import { tables } from "../provider/const";

export default function Tables() {
    const context = useReservation();
    
    const simpleName = (name?: string) => {
        return name ? name.split('-')[1] : '';
    }
    return context ? (
        <>
            <h3>Mese: {context.data()?.tables.length }</h3>
            <div class='details-tables'>
                <For each={tables}>
                    {table => (
                        <div
                            class="table"
                            onClick={() => context.addReservation(table)}
                            classList={{
                                selected: !!context.data()?.tables.find(t => t.table === table),
                                mine: context.data()?.tables.find(t => t.table === table)?.name === context.mySelf.safeName()
                            }}>
                                <div>{table}</div>
                                <div class='who'>
                                    {simpleName(context.data()?.tables.find(t => t.table === table)?.name)}
                                </div>
                        </div>
                    )}
                </For>
            </div>
        </>
    ) : null;

}