import { createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { apiToggleGuest } from "../../api";
import { useReservation } from "../../provider/ReserveProvider";
import './guestform.scss';

type Props = {
    hide: () => void;
}

export default function GuestFormComponent({hide}: Props) {
    const context = useReservation();
    if (!context) return null;

    const [guest, setGuest] = createSignal<string>('')
    const saveGuest = async () => {
        const result = await apiToggleGuest(btoa(context.date()), {guest: {name: guest(), user: context.mySelf.safeName()}})
        console.log({result})
        if (result.success) {
            context.refetch();
            hide();
        }
    }
    return(
        <Portal>
            <div class="addGuest">
                <form>
                    <input
                        type="text"
                        value={guest()}
                        onChange={(ev) => setGuest(ev.target.value)}
                        name="guest" id="guest" placeholder="Pe cine inviti?" />
                    <button
                        type='button'
                        disabled={guest().trim().length === 0}
                        onClick={saveGuest}
                    >Adauga</button>
                </form>
            </div>
        </Portal>
    );
}