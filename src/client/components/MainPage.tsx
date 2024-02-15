import { Show } from "solid-js";
import { useReservation } from "../provider/ReserveProvider";
import Tables from "./tables/Tables";
import Participants from "./Participants";
import { effect } from "solid-js/web";
import './mainpage.scss'

export default function MainPage() {
    const context = useReservation();
    if (!context) return null;
    const dayInMilliseconds = 1000 * 3600 * 24;
    const dateInFuture = () => (Math.abs(new Date(context.date()).valueOf() - new Date().valueOf()) / dayInMilliseconds) > 6;
    effect(() => {
        console.log('date in future', dateInFuture())
    })
    return(
        <div class="details">
            <div class='details-date' classList={{next: !dateInFuture()}}>
                <Show when={dateInFuture()}>
                    <span onClick={() => context.changeDate(-1)}>⬅️</span>
                </Show>
                <span class='title'>Miercuri: <strong>{context.date()}</strong></span>
                <span onClick={() => context.changeDate()}>➡️</span>
            </div>
            <Participants />
            <Tables />
        </div>
    );
}