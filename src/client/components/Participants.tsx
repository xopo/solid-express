import { For, Show, createSignal } from "solid-js";
import { User, useReservation } from "../provider/ReserveProvider";
import GuestFormComponent from "./modal/GuestForm";
import { Guest } from "../../server/routes/content";


export default function Participants() {
    const context = useReservation();
    if (!context || !context.data || context.mySelf() === null) return null;

    const [guestForm, setGuestForm] = createSignal(false);
    const addGuest = () => setGuestForm(true);

    const extractName = (user: User | Guest) => {
        return 'self' in user ? user.self.split('-')[1] : user.guest.name;
    }
    
    const particip = () => {
        if (!context.data()?.users) {
            return false;
        }
        return context.data()?.users.find(usr => usr.self === context.mySelf()!.safeName);
    }
    
    const extraElement = (user: User|Guest) => {
        if ('self' in user && user.self === context.mySelf()!.safeName) {
            return <button
                class='remove'
                onClick={context.toggleUser}
                title='anuleaza participarea'
            >❌</button>
        } else if ('guest' in user && user.guest.user === context.mySelf()!.safeName ) {
            return <button
                class='remove'
                onClick={() => context.removeGuest(user)}
                title='anuleaza participarea'
            >❌</button>
        }
        return null;
    }
    return <>
            <div class="details-participants">
                <div class="header">
                    <h3>Participanti: {context.data()?.users.length || 0}</h3>
                    {!particip() && <button onClick={context.toggleUser}> particip si eu ➕</button>}
                </div>
                <Show when={context.data()?.users.length}>
                    <ul>
                        <For each={context.data()?.users}>
                            {user => (
                                <li classList={{selected: !!context.data()?.tables.find(t => t.name === user.self)}}>
                                    {extractName(user)}
                                    {extraElement(user)}
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>
                <button onClick={addGuest}>Aduc un prieten 👱‍♂️</button>
            </div>
            {guestForm() && <GuestFormComponent  hide={() => setGuestForm(false)}/>}
        </>
;
}