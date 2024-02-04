import { useForm } from './validation';
import './login.scss';
import { apiLogin } from '../../api';

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            formSubmit: [() => any, (v: any) => any];
            validate: [() => any, (v: any) => any];
        }
    }
}

export default function Login() {
    let nameRef: HTMLInputElement;
    let passRef: HTMLInputElement;
    const {validate, errors}  = useForm()

    const onLogin = async () => {
        if (nameRef.value.trim().length === 0) {
            nameRef.focus();
            return;
        } else if (passRef.value.trim().length === 0) {
            passRef.focus();
            return;
        }
        const result = await apiLogin(nameRef.value, passRef.value);
        if (result.hasOwnProperty('success')) {
            location.href = '/'
        }
    }
    
    return (
        <div class="login">
            <form>
                <label>Nume
                    <input
                        ref={el => nameRef = el}
                        name='nume'
                        type='text'
                        minlength="5"
                        maxlength="15"
                        required
                        onblur={validate}
                    />
                    {errors?.nume && <span class='error'>{errors.nume}</span>}
                </label>
                <label>Parola
                    <input
                        ref={el => passRef = el}
                        name='parola'
                        type='password'
                        minlength="5"
                        maxlength="15"
                        required
                        onblur={validate}
                    />
                    {errors?.parola && <span class='error'>{errors.parola}</span>}
                </label>
                <button
                    onClick={onLogin}
                    disabled={!!errors.nume.length || !!errors.parola.length}
                    type='button'
                >Login</button>
            </form>
        </div>
    );
}