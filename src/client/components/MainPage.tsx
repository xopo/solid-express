import { Show } from "solid-js";
import { useReservation } from "../provider/ReserveProvider";
import Tables from "./tables/Tables";
import Participants from "./Participants";
import './mainpage.scss'
import { effect } from "solid-js/web";

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
            <div class='details-date'>
                <Show when={dateInFuture()}>
                    <span onClick={() => context.changeDate(-1)}>⬅️</span>
                </Show>
                    Data: {context.date()}
                <span onClick={() => context.changeDate()}>➡️</span>
            </div>
            <Participants />
            <Tables />
        </div>
    );
}