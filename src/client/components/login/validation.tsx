import { Accessor, JSX } from 'solid-js';
import {createStore} from 'solid-js/store';

type BlurEvent = JSX.FocusEventHandler<HTMLInputElement, FocusEvent> ;

export function useForm() {
    const [errors, setErrors] = createStore<{nume: string, parola: string}>({nume: '', parola: ''});
  
    const validate:BlurEvent = (ev) => {
        const minLength = parseInt(ev.currentTarget.getAttribute('minlength') || '0');
        const maxLength = parseInt(ev.currentTarget.getAttribute('maxlength') || '30');
        const value = ev.currentTarget.value.trim();
        const currentLength = value.trim().length;
        if (ev.currentTarget.required && value.length === 0) {
          ev.currentTarget.focus();
          setErrors({[ev.currentTarget.name]: `${ev.target.name} contine min ${minLength} caractere`})
        }  else if (value.length < minLength) {
          ev.currentTarget.focus();
          setErrors({[ev.currentTarget.name]: `${ev.target.name} contine min ${minLength} caractere`})
        } else if (value.length > maxLength) {
          ev.currentTarget.focus();
          setErrors({[ev.currentTarget.name]: `${ev.target.name} contine max ${minLength} caractere`})
        } else {
          setErrors({[ev.currentTarget.name]: ''});
        }
    }
    
    return {validate, errors}
}