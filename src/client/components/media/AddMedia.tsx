import { Show,  createSignal } from "solid-js";

import { Portal } from "solid-js/web";
import { validateUri } from "../../helpers/validate";
import { apiSubmitNewMedia } from "../../api";
import WaitingFiles from "../table/WaitingFiles";
import './add_media.scss';

export default function AddMedia() {
    const [showModal, setShowModal] = createSignal(false)
    const [url, setUrl] = createSignal('')
    const [error, setError] = createSignal('')
    const [waiting, setWaiting] = createSignal(false)
    const onBlur = () => {
        const validation = validateUri(url())
        setError(validation === true ? '' : validation)
    }

    const submit = async () => {
        setWaiting(true);
        const result = await apiSubmitNewMedia(url());
        setWaiting(false);
        if (result.success) {
            setUrl('');
            setError('');
        }
    }

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
                                classList={{'error': !!error()?.length}}
                                id="url"
                                value={url()}
                                placeholder="ex: https://www.youtbe.com?v:2348j3-i&share=rumble/facebook"
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
                                disabled={!!error() || url()?.length < 5 }
                                onclick={submit}
                            >
                                {`${error() || 'Download'}`} _|_
                                {waiting() && <img width='30' src='/spinner'/>}
                            </button>
                        </div>
                        <WaitingFiles hide={() => setShowModal(false)}/>
                    </div>
                    <div class="backdrop" onclick={() => setShowModal(false)}/>
                </Portal>
            </Show>
        </>
    );
}