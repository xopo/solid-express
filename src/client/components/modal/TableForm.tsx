import { Portal } from 'solid-js/web';
import { Reservation } from '../../provider/ReserveProvider';
import './guestform.scss';

type FormProps = {
    table: Reservation['table'];
    addTable: (table: Reservation['table']) => void;
    hide: () => void;
}

export default function TableForm ({addTable, hide, table}: FormProps) {
    let formRef: HTMLFormElement;
    
    const outClick = (ev: MouseEvent & { currentTarget: HTMLDivElement; target: Element;}) => {
        if (ev.target !== formRef && ev.target.contains(formRef)) {
            hide();
        }
    }
    return (
        <Portal>
            <div class="addGuest confirm" onClick={outClick}>
            <form ref={el => formRef = el}>
                <h3>Ai primit confirmare de rezervare pentru masa {table} (SMS/mail)?</h3>
                <div class="action">
                    <button class='ok' type="button" onClick={() => addTable(table)}>Da</button>
                    <button class='bad' type="button" onClick={() => hide()}>NU</button>
                </div>
            </form>
            </div>
        </Portal>
    );
}