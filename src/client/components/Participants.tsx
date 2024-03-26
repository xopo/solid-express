import { For, Show, createSignal } from "solid-js";
import { Guest, User, useReservation } from "../provider/ReserveProvider";
import GuestFormComponent from "./modal/GuestForm";
import AddUser2Table from "./modal/AddUser2Table";
import { apiRemoveUserFromTable } from "../api";


export default function Participants() {
    const context = useReservation();
    if (!context || !context.data ) {
        return null;
    }
    const [add2table, setAdd2Table] = createSignal< User | Guest | undefined>()
    const [guestForm, setGuestForm] = createSignal(false);
    const addGuest = () => setGuestForm(true);
    
    const count = () => ({
        participants: (context.data()?.guests.length ?? 0 )+ (context.data()?.users.length ?? 0),
        tables: context.data()?.tables.length ?? 0
    });
    
    const toggleUserTable = async (user: User | Guest) => {
        // owner with table cannot be removed
        const safeName = `${user.guest_id || user.user_id}-${user.name}`;
        console.log('user', user, safeName)
        console.log('toggleUserTable', user)
        if (!user.guest_id) { // for owners not guests
            const hasOwnTable = context.data()?.tables.find(tbl => tbl.user_id ===  user.user_id)
            if (hasOwnTable || user.user_id !== context.mySelf()?.id) {
                return;
            }
            // is my self so i can toggle.
            const table = context.data()?.tables.find(tbl => (tbl.guest || [])?.includes(safeName));
            if (table) {
                const result = await apiRemoveUserFromTable(table.reservation_id, table.table, safeName);
                if (result.success) {
                    context.refetch();
                }
                return;
            }
        } else if (user.user_id === context.mySelf()?.id) { // alow change if i invited the guest
            const inTable = context.data()?.tables.find(tbl => (tbl.guest || [])?.includes(safeName))
            if (inTable) {
                const result = await apiRemoveUserFromTable(inTable.reservation_id, inTable.table, safeName);
                if (result.success) {
                    context.refetch();
                }
            }
            return;
        }
    }
    
    const getTable = (user: User | Guest) => {
        if (!user.guest_id) { // for owners not guests
            const hasOwnTable = context.data()?.tables.find(tbl => tbl.user_id ===  user.user_id)
            if (hasOwnTable) {
                return <span class='table id' onclick={() => toggleUserTable(user)}>{hasOwnTable ? `Masa ${hasOwnTable.table}` : ''}</span>
            }
            const isParticipant = context.data()?.tables.find(tbl => (tbl.guest || [])?.includes(`${user.user_id}-${user.name}`))
            if (isParticipant?.table) {
                return <span class='table id' onclick={() => toggleUserTable(user)}>{`Masa ${isParticipant.table}`}</span>
            }
        }
        const hasTable = context.data()?.tables.find(tbl => (tbl.guest || [])?.includes(`${user.guest_id}-${user.name}`))
        if (hasTable) {
            return <span class='table id' onclick={() => toggleUserTable(user)}>{hasTable ? `Masa ${hasTable.table}` : ''}</span>
        }
        if (user.user_id !== context.mySelf()?.id) {
            return false;
        }
        return <button onClick={() => setAdd2Table(user)} class='icon transparent add-table'>addTable</button>
    }

    const particip = () => {
        if (!context.data()?.users.length) {
            return false;
        }
        return context.data()?.users.find(usr => usr.user_id === context.mySelf()?.id);
    }
    
    const userHasNoTable = (user: Guest | User) => {
        //@ts-ignore
        if (user.self) {
            //@ts-ignore
            if (context.data().tables?.find(tbl =>tbl.name === user.self)) {
                return false;
            }
        }
        const tablesWithParticipants = context.data()?.tables.filter(tbl => tbl.guest)
        if (!tablesWithParticipants) {
            return true;
        }
        return !!!tablesWithParticipants.find(tbl => tbl.guest?.includes(`${user.guest_id ?? user.user_id}-${user.name}`))
    }
    
    const extraElement = (user: User|Guest) => {
        if (!user.guest_id && user.user_id === context.mySelf()?.id) {
            return <button
                class='remove'
                onClick={context.toggleUser}
                title='anuleaza participarea mea'
            >❌</button>
        } else if (user.guest_id && user.user_id === context.mySelf()?.id ) {
            return <button
                class='remove'
                //@ts-ignore
                onClick={() => context.removeGuest(user)}
                title='anuleaza participarea'
            >❌</button>
        }
        return null;
    }
    return <>
            <div class="details-participants">
                <div class="header">
                    <h3>Participanti: {count().participants}</h3>
                    {!particip() && <button onClick={context.toggleUser}> particip si eu ➕</button>}
                </div>
                <Show when={context.data()?.users.length}>
                    <ul>
                        <For each={context.data()?.users}>
                            {user => (
                                <li classList={{
                                    self: 'self' in user && user.self === context.safeName(),
                                    selected: !!context.data()?.tables.find(t => t.user_id === user.user_id),
                                    free: !!userHasNoTable(user)
                                }}>
                                    {user.name}
                                    {extraElement(user)}
                                    {getTable(user)}
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>
                <Show when={context.data()?.guests.length}>
                    <ul>
                        <For each={context.data()?.guests}>
                            {guest => (
                                <li class='guest' classList={{
                                    free: !!userHasNoTable(guest),
                                    mine: guest.user_id === context.mySelf()?.id
                                }}>
                                    {guest.name}
                                    {extraElement(guest)}
                                    {getTable(guest)}
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>
                <button onClick={addGuest}>Aduc un prieten 👱‍♂️</button>
            </div>
            <Show when={guestForm()}>
                <GuestFormComponent  hide={() => setGuestForm(false)}/>
            </Show>
            <Show when={!!add2table()}>
                <AddUser2Table
                    user={add2table()!}
                    hide={setAdd2Table} />
            </Show>
        </>
;
}