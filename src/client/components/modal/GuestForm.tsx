import { createSignal, Show } from "solid-js";
import { Portal, effect } from "solid-js/web";
import { apiToggleGuest } from "../../api";
import { useReservation } from "../../provider/ReserveProvider";
import { safeParse } from 'valibot';
import { NameSchema } from "../../../common/validation/schema";

import './guestform.scss';

type Props = {
    hide: () => void;
}

export default function GuestFormComponent({hide}: Props) {
    let formRef: HTMLFormElement;
    const context = useReservation();
    if (!context) return null;
    const [guest, setGuest] = createSignal<string>('')
    const [error, setError] = createSignal<string>('');
    let isValid = safeParse(NameSchema, guest())
    const saveGuest = async () => {
        const result = await apiToggleGuest(context.date(), guest())
        if (result.success) {
            context.refetch();
            hide();
        }
    }
    
    const outClick = (ev: MouseEvent & { currentTarget: HTMLDivElement; target: Element;}) => {
        if (ev.target !== formRef && ev.target.contains(formRef)) {
            hide();
        }
    }

    const onChange = (val: string) => {
        setGuest(val);
        const {issues} = safeParse(NameSchema, guest());
        setError(issues && issues[0].message ? issues[0].message : '');
    }

    effect(() => {
        isValid = safeParse(NameSchema, guest())
        console.info(isValid)
    })

    return(
        <Portal>
            <div class="addGuest" onClick={outClick}>
                <form ref={el => formRef = el}>
                    <input
                        type="text"
                        value={guest()}
                        oninput={(ev) => onChange(ev.target.value)}
                        name="guest" id="guest" placeholder="Pe cine inviti?" />
                    <Show when={error().length > 0}>
                        <span class='error'>{error()}</span>
                    </Show>
                    <button
                        type='button'
                        disabled={error().length > 0}
                        onClick={saveGuest}
                    >Adauga</button>
                </form>
            </div>
        </Portal>
    );
}