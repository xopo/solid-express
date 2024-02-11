import { useForm } from './validation';
import BASE_URL from '../../const';
import { Show, createResource, createSignal } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { effect } from 'solid-js/web';
import { apiCheckUserUnique, apiLogin, apiRegistration } from '../../api';
import './login.scss';
declare module "solid-js" {
    namespace JSX {
        interface Directives {
            formSubmit: [() => any, (v: any) => any];
            validate: [() => any, (v: any) => any];
        }
    }
}

export default function Login() {
    const [usr, setUsr] = createSignal('');
    const [dup, setDup] = createSignal('');
    // const exists  = createQuery<{error?: string}>(() => ({
    //     queryKey: ['check-same'], 
    //     queryFn: async () => {
    //         const result = await apiCheckUserUnique(usr());
    //         if (result.error) {
    //             setDup(result.error);
    //         } else {
    //             setDup('');
    //         }
    //         return result;
    //     },
    //     enabled: usr().length > 4
    // }));
    const {validate, errors, setErrors}  = useForm()
    const exists = createResource(usr(), apiCheckUserUnique)
    
    // console.log('login context', context)
    let nameRef: HTMLInputElement = {value: ''} as HTMLInputElement;
    let passRef: HTMLInputElement = {value: ''} as HTMLInputElement;
    let confRef: HTMLInputElement;

    const loginUser = async () => {
        const name = nameRef.value.trim();
        const pass = passRef.value.trim();
        if (name.length >= 4 && pass.length >= 5) {
            const result =  await apiLogin(name, pass);
            if ('success' in result) {
                location.href = BASE_URL;
            } else {
                nameRef.focus();
                setErrors('nume', result.message)
            }
        }
    }
    const [_login, {refetch: refetchLogin}] = createResource(loginUser);
    const registerUser = async () => {
        const name = nameRef.value.trim();
        const pass = passRef.value.trim();
        if (name.length >= 4 && pass.length >= 5) {
            const result =  await apiRegistration(name, pass);
            if ('success' in result) {
                location.href = BASE_URL;
            } else {
                nameRef.focus();
                setErrors('nume', result.message)
            }
        }
    }
    
    const checkUserName = async () => {
        const nameVal = nameRef.value.trim();
        if (location.pathname !== '/register' || nameVal.length < 4) {
            return Promise.resolve(true); // we don't care
        }
        const response = await apiCheckUserUnique(nameVal) as {error?: string};
        if (response.error) {
            setErrors({'nume': response.error})
        }
    }
    const [_reg, {refetch: refetchRegister}] = createResource(registerUser);
    const [_checkDupe, {refetch: refetchDupe}] = createResource(checkUserName);
    const [confErr, setConfErr] = createSignal('');
    const routeLocation = useLocation();
    const [isLogin, setIsLogin] = createSignal(true);
    

    effect(() => {
        setIsLogin(routeLocation.pathname === `${BASE_URL}login`)
    })
    
    const onLogin = async () => {
        if (nameRef.value.trim().length === 0) {
            nameRef.focus();
            return;
        } else if (passRef.value.trim().length === 0) {
            passRef.focus();
            return;
        }
        if (isLogin()) {
            refetchLogin();
        } else {
            refetchRegister();
        }
    }

    const confirmPass = () => {
        if ( passRef.value !== confRef.value) {
            setConfErr('Parolele nu sunt identice')
            return;
        }
        setConfErr('');
    }

    return (
        <div class="login" classList={{register: !isLogin()}}>
            <form>
                <label>Nume
                    <input
                        classList={{register: !isLogin()}}
                        ref={el => nameRef = el}
                        name='nume'
                        type='text'
                        minlength="4"
                        maxlength="15"
                        //@ts-ignore
                        oninput={validate}
                        required
                        onblur={ev => {
                            validate(ev);
                            refetchDupe();
                        }}
                    />
                    {(errors?.nume ||  dup()) && <span class='error'>{errors.nume || dup()}</span>}
                </label>
                <label>Parola
                    <input
                        ref={el => passRef = el}
                        name='parola'
                        type='password'
                        minlength="5"
                        maxlength="15"
                        required
                        disabled={!!errors.nume}
                        onblur={validate}
                        /*@ts-ignore*/
                        oninput={validate}
                    />
                    {errors?.parola && <span class='error'>{errors.parola}</span>}
                </label>
                <Show when={!isLogin()}>
                    <label class='conf'>Conf
                        <input
                            ref={el => confRef = el}
                            name='confirmare'
                            type='password'
                            minlength="5"
                            maxlength="15"
                            required
                            disabled={!!errors.parola}
                            placeholder='confirma parola'
                            onblur={confirmPass}
                            oninput={confirmPass}
                        />
                        {confErr() && <span class='error'>{confErr()}</span>}
                    </label>
                </Show>
                <button
                    onClick={onLogin}
                    disabled={!!dup() || !!errors.nume.length || !!errors.parola.length || !!confErr().length}
                    type='button'
                >{isLogin() ? 'Login' : 'Inregistreaza' }</button>
                <Show when={isLogin()}>
                    <a href={`${BASE_URL}register`}>inregistrare</a>
                </Show>
                {JSON.stringify(_login)}
            </form>
        </div>
    );
}