import { createSignal } from 'solid-js'

export default function Count() {
    const [count, setCount] = createSignal(0)
    const double = () => count() * 2
    return (
        <div class="card">
            <button onClick={() => setCount((count) => count + 1)}>
                count is {count()}
            </button>
            <p>
                <em>Double: <b>{double()}</b></em><br />
                Edit <code>src/App.tsx</code> and save to test HMR
            </p>
        </div>
    );
}