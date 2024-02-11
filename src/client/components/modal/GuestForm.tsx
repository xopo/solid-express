import { createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { apiToggleGuest } from "../../api";
import { useReservation } from "../../provider/ReserveProvider";
import './guestform.scss';

type Props = {
    hide: () => void;
}

export default function GuestFormComponent({hide}: Props) {
    let formRef: HTMLFormElement;
    const context = useReservation();
    if (!context) return null;

    const [guest, setGuest] = createSignal<string>('')
    const saveGuest = async () => {
        const result = await apiToggleGuest(btoa(context.date()), {guest: guest()})
        if (result.success) {
            context.refetch();
            hide();
        }
    }
    let disableButton = () => guest().trim().length < 3;
    
    const outClick = (ev: MouseEvent & { currentTarget: HTMLDivElement; target: Element;}) => {
        if (ev.target !== formRef && ev.target.contains(formRef)) {
            hide();
        }
    }
    
    return(
        <Portal>
            <div class="addGuest" onClick={outClick}>
                <form ref={el => formRef = el}>
                    <input
                        type="text"
                        value={guest()}
                        oninput={(ev) => setGuest(ev.target.value)}
                        name="guest" id="guest" placeholder="Pe cine inviti?" />
                    <button
                        type='button'
                        disabled={disableButton()}
                        onClick={saveGuest}
                    >Adauga</button>
                </form>
            </div>
        </Portal>
    );
}