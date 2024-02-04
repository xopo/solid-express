import { Show } from "solid-js";
import { apiUserAddSelf } from "../api";
import { useReservation } from "../provider/ReserveProvider";
import Tables from "./Tables";
import Participants from "./Participants";
import './mainpage.scss'

export default function MainPage() {
    const context = useReservation();
    if (!context) return null;

    const toggleUser = async () => {
        const result = await apiUserAddSelf(btoa(context.date()));
        if (result.success) {
            context.refetch()
        }
    }

    const dayInMilliseconds = 1000 * 3600 * 24;
    const dateInFuture = () => (Math.abs(new Date(context.date()).valueOf() - new Date().valueOf()) / dayInMilliseconds) > 7;
    
    return(
        <div class="details">
            <div class='details-action' onClick={toggleUser}>
                {!!context.data()?.users.find(usr => usr.self === context?.mySelf.name) ? '➖' : '➕ particip si eu'}
            </div>
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