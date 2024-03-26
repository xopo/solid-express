import { For, Show, createResource, createSignal } from "solid-js";
import { apiAddUser, apiGetUsers, apiResetPassword } from "../../api";
import BASE_URL from "../../const";
import { date2String } from "../helper";

import './users.scss';

export type User = {
    id: number,
    name: string,
    last_active: string
    reset_password: 1|0
};

const getUsers = async ():Promise<User[]> => {
    const result = await apiGetUsers();
    if (result.error) {
        location.href = BASE_URL
    }
    return result?.users;
}

export default function Users() {
    const [users, {refetch}] = createResource(getUsers);
    const [name, setName] = createSignal('');
    const [pass, setPass] = createSignal('');
    const submitForm = async () => {
        const result = await apiAddUser({name: name(), pass: pass()});
        if (result.success) {
            setName('');
            setPass('');
            refetch();
        }
    }
    
    async function resetPassword(id: number) {
        const result = await apiResetPassword(id);
        if (result.success) {
            refetch();
        }
    }
    return (
        <div class='users'>
            <a class='home' href={BASE_URL} title='go home'>🏠</a>
            <h3 class='title'>Add new user</h3>
            <form>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={name()}
                    autocomplete="off"
                    oninput={ev => setName(ev.target.value)}
                    placeholder="User's name: John" />
                <input
                    type="password"
                    name="pass"
                    id="pass"
                    autocomplete="off"
                    value={pass()}
                    oninput={ev => setPass(ev.target.value)}
                    placeholder="Parola" />
                <button onClick={submitForm} type='button'>Submit</button>
            </form>
            <Show when={users()}>
                <ul>
                    <For each={users()}>
                        {({id, name, last_active, reset_password}) => (
                            <li>
                                {id} - {name} <span>{last_active ? date2String(last_active, true) : ''}</span>
                                {reset_password 
                                    ? '🔥' 
                                    : <button class='transparent icon' onClick={() =>resetPassword(id)}>♻️</button>}
                            </li>
                        )}
                    </For>
                </ul>
            </Show>
        </div>
    );
}