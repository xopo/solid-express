import { JSX, Show, createSignal } from "solid-js";

import { effect, Portal } from "solid-js/web";
import { validateInputUrl } from "../../helpers/validate";
import { apiSubmitNewMedia } from "../../api";
import WaitingFiles from "../table/WaitingFiles";
import "./add_media.scss";
import BASE_URL from "../../const";

export default function AddMedia() {
  const [showModal, setShowModal] = createSignal(false);
  const [url, setUrl] = createSignal("");
  const [error, setError] = createSignal("");
  const [waiting, setWaiting] = createSignal<string>("");
  const onBlur = () => {
    const validation = validateInputUrl(url()) as true | { message: string };
    console.log("on blur validation", validation);
    setError(validation === true ? "" : validation.message);
  };

  const onChange = (val: string) => {
    setUrl(val);
  };

  const onPaste = (e: any) => {
    const pasteUrl = e.clipboardData.getData("Text");
    if (pasteUrl) {
      console.log("url is validated", pasteUrl);
      setUrl(pasteUrl);
      setError("");
    } else {
      console.log(" not validated", pasteUrl);
    }
  };

  const submit = async () => {
    setWaiting(url());
    const result = await apiSubmitNewMedia(url());
    if (result.success) {
      setUrl("");
      setError("");
      setWaiting("");
    }
  };

  effect(() => {
    if (showModal()) {
      document.querySelector("body")?.classList.add("modal-open");
    } else {
      document.querySelector("body")?.classList.remove("modal-open");
    }
  });

  effect(() => {
    console.log("disabled", !!error() || url()?.length < 5);
    console.log({ error: !!error(), url: url()?.length });
  });

  return (
    <>
      <Show
        when={showModal()}
        fallback={
          <button
            onClick={() => setShowModal((prev) => !prev)}
            class="icon add_media"
          >
            ➕
          </button>
        }
      >
        <Portal>
          <div class="modal">
            <div class="row">
              <label for="url">Link to media</label>
              <input
                classList={{ error: !!error()?.length }}
                id="url"
                placeholder="ex: https://www.youtbe.com?v:2348j3-i&share=rumble/facebook"
                type="url"
                onchange={(e) => onChange(e.target.value)}
                onpaste={onPaste}
                onblur={onBlur}
              />
            </div>
            <div class="row">
              <label>Pick a folder </label>
              <div id="folder">#Todo</div>
            </div>
            <div class="row">
              <button
                type="button"
                disabled={!!error() || url()?.length < 5}
                onclick={submit}
              >
                {`${error() || "Download"}`} _|_
                {waiting() && (
                  <div>
                    <img width="30" src={`${BASE_URL}/spinner.gif`} />
                  </div>
                )}
              </button>
            </div>
            <WaitingFiles hide={() => setShowModal(false)} waiting={waiting} />
          </div>
          <div class="backdrop" onclick={() => setShowModal(false)} />
        </Portal>
      </Show>
    </>
  );
}
