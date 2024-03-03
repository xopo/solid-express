import { Show, createSignal } from "solid-js";

import './add_media.scss'
import { Portal } from "solid-js/web";
import { validateUri } from "../../helpers/validate";

export default function AddMedia() {
    const [showModal, setShowModal] = createSignal(false)
    const [url, setUrl] = createSignal('')
    const [error, setError] = createSignal('')

    const onBlur = () => {
        console.log('on submit', url())
        const validation = validateUri(url())
        setError(validation === true ? '' : validation)
    }
    
    const submit = () => console.log('submit to backend');

    return (
        <>
            <Show when={showModal()}
                fallback={<button onClick={() => setShowModal(prev => !prev)} class='icon add_media'>➕</button>}
            >
                <Portal>
                    <div class="modal">
                        <div class="row">
                            <label for="url">Link to media</label>
                            <input
                                classList={{'error': !!error().length}}
                                id="url"
                                placeholder="http://www.youtbe  / rumble / facebook"
                                type="url"
                                onblur={onBlur}
                                onchange={e => setUrl(e.target.value)} />
                        </div>
                        <div class="row">
                            <label>Pick a folder </label>
                            <div id="folder">#Todo</div>
                        </div> 
                        <div class="row">
                            <button 
                                type='button'
                                disabled={error()?.length > 0 || url()?.length < 5 }
                                onclick={submit}
                            >{`${error() || 'Download'}`} _|_</button>
                        </div>
                        {JSON.stringify({error:error(), url: url()})}
                    </div>
                    <div class="backdrop" />
                </Portal>
            </Show>
        </>
    );
}