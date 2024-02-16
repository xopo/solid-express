import { Show, createSignal } from "solid-js";
import { useReservation } from "../provider/ReserveProvider";
import Tables from "./tables/Tables";
import Participants from "./Participants";
import { effect } from "solid-js/web";
import { date2String } from "./helper";
import './mainpage.scss'

export default function MainPage() {
    const context = useReservation();
    const [showName, setShowName] = createSignal(0);
    const [timer, setTimer] = createSignal(0);
    
    if (!context) {
        return null;
    }
    
    effect(() => {
        if (timer() % 6 === 5) {
            setShowName(prev => prev === 0 ? 1 : 0)
        }
    })

    let counter: number;
    const reStartInterval = () => {
        if (counter) window.clearInterval(counter);
        counter = window.setInterval(() => {
            setTimer(t => t + 1);
        }, 1000)
    }

    reStartInterval();
    const dayInMilliseconds = 1000 * 3600 * 24;
    const dateDiff = () => Math.abs((new Date(context.date()).valueOf() - new Date().valueOf()) / dayInMilliseconds);
    const dateInFuture = () => dateDiff() > 6;
    effect(() => {
        console.log('date in future', dateInFuture())
    })

    const changeDate = (val = 1) => {
        setShowName(0);
        context.changeDate(val)
        setTimer(0);
    }
    const text2Show = () => {
        if (showName() === 0) {
            return <strong classList={{first: !dateInFuture()}}>{`Miercuri : ${context.date()}`}</strong>
        } else if (showName() === 1) {
            return date2String(context.date(), true)//}` //date2String(diff);
        }
        return <strong>{context.name()}</strong>
    }
    
    const onClickDate = () => { 
        setShowName(d => ((d+1) % 3));
        setTimer(0);
    }

    return(
        <div class="details">
            <div class='details-date' classList={{next: !dateInFuture()}}>
                <Show when={dateInFuture()} fallback={<span>⭐</span>}>
                    <span onClick={() => changeDate(-1)}>⬅️</span>
                </Show>
                <span class='title' onClick={onClickDate}>
                    {text2Show()}
                </span>
                <span onClick={() => changeDate()}>➡️</span>
            </div>
            <Participants />
            <Tables />
        </div>
    );
}