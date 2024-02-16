import { For, Show, createSignal } from "solid-js";
import { User, useReservation } from "../provider/ReserveProvider";
import GuestFormComponent from "./modal/GuestForm";
import { Guest } from "../../server/routes/content";


export default function Participants() {
    const context = useReservation();
    if (!context || !context.data ) return null;

    const [guestForm, setGuestForm] = createSignal(false);
    const addGuest = () => setGuestForm(true);

    const extractName = (user: User | Guest) => {
        return 'self' in user ? user.self.split('-')[1] : user.guest.name;
    }

    const particip = () => {
        if (!context.data()?.users) {
            return false;
        }
        return context.data()?.users.find(usr => usr.self === context.safeName());
    }

    const extraElement = (user: User|Guest) => {
        if ('self' in user && user.self === context.safeName()) {
            return <button
                class='remove'
                onClick={context.toggleUser}
                title='anuleaza participarea'
            >❌</button>
        } else if ('guest' in user && user.guest.user === context.safeName() ) {
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
                                <li classList={{
                                    self: 'self' in user && user.self === context.safeName(),
                                    selected: !!context.data()?.tables.find(t => t.name === user.self)
                                }}>
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