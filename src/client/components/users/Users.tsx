import { For, Show, createResource, createSignal } from "solid-js";
import { apiAddUser, apiGetUsers } from "../../api";
import { effect } from "solid-js/web";
import BASE_URL from "../../const";

const getUsers = async ():Promise<{id: number, name: string}[]> => {
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
    
    effect(() => {
        console.log('users', users())
    })
    return (
        <div class='users'>
            <h1>Add new</h1>
            <form>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={name()}
                    oninput={ev => setName(ev.target.value)}
                    placeholder="User's name: John" />
                <input
                    type="password"
                    name="pass"
                    id="pass"
                    value={pass()}
                    oninput={ev => setPass(ev.target.value)}
                    placeholder="Parola" />
                <button onClick={submitForm} type='button'>Submit</button>
            </form>
            <Show when={users()}>
                <ul>
                    <For each={users()}>
                        {user => (
                            <li>{user.id} - {user.name}</li>
                        )}
                    </For>
                </ul>
            </Show>
        </div>
    );
}