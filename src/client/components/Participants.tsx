import { For, Show, createSignal } from "solid-js";
import { User, useReservation } from "../provider/ReserveProvider";
import GuestFormComponent from "./modal/GuestForm";
import { Guest } from "../../server/routes/content";

export default function Participants() {
    const context = useReservation();
    const [guestForm, setGuestForm] = createSignal(false);
    const addGuest = () => setGuestForm(true);

    const extractName = (user: User | Guest) => {
        return 'self' in user ? user.self.split('-')[1] : user.guest.name;
    }

    return context ? (
        <>
            <ul class="details-participants">
                <div class="header">
                    <h3>Participanti: {context.data()?.users.length || 0}</h3>
                    <button onClick={addGuest}>Aduc un prieten 👱‍♂️</button>
                </div>
                <Show when={context.data()?.users}>
                    <For each={context.data()?.users}>
                        {user => (
                            <li classList={{selected: !!context.data()?.tables.find(t => t.name === user.self)}}>
                                {extractName(user)}
                            </li>
                        )}
                    </For>
                </Show>
            </ul>
            {guestForm() && <GuestFormComponent  hide={() => setGuestForm(false)}/>}
        </>
    ): null;
}