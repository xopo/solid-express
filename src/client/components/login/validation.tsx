import { JSX } from 'solid-js';
import {createStore} from 'solid-js/store';


export type BlurEv = JSX.FocusEventHandler<HTMLInputElement, FocusEvent> ;
export type InputEv = InputEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }

export function useForm() {
    const [errors, setErrors] = createStore<{nume: string, parola: string}>({nume: '', parola: ''});
    
    const validate:BlurEv|InputEv = async (ev) => {
        const minLength = parseInt(ev.currentTarget.getAttribute('minlength') || '0');
        const maxLength = parseInt(ev.currentTarget.getAttribute('maxlength') || '30');
        const value = ev.currentTarget.value.trim();

        if (ev.currentTarget.required && value.length === 0) {
          setErrors({[ev.currentTarget.name]: `${ev.target.name} contine min ${minLength} caractere`})
        }  else if (value.length < minLength) {
          setErrors({[ev.currentTarget.name]: `${ev.target.name} contine min ${minLength} caractere`})
        } else if (value.length > maxLength) {
          setErrors({[ev.currentTarget.name]: `${ev.target.name} contine max ${minLength} caractere`})
        } else {
          setErrors({[ev.currentTarget.name]: ''});
        }
    }

    return {validate, errors, setErrors}
}

