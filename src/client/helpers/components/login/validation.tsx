import { JSX } from 'solid-js';
import {safeParse} from 'valibot';
import {createStore} from 'solid-js/store';
import { NameSchema, PassSchema } from '../../../common/validate/schema';



export type BlurEv = JSX.FocusEventHandler<HTMLInputElement, FocusEvent> ;
export type InputEv = InputEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }

export function useForm() {
    const [errors, setErrors] = createStore<{nume: string, parola: string}>({nume: '', parola: ''});
    
    const validate:BlurEv|InputEv = async (ev) => {
        const schema = ev.target.name === 'nume' ? NameSchema : PassSchema;
        const validation = safeParse(schema, ev.currentTarget.name === 'nume' ? ev.target.value: btoa(ev.currentTarget.value));
        setErrors({[ev.currentTarget.name]: validation.issues?.length ? validation.issues[0].message : ''})
    }

    return {validate, errors, setErrors}
}

