import { For } from "solid-js";
import { useMp3Context } from "../../../context/appContext";
import "./head.scss";
import { effect } from "solid-js/web";

export default function Head() {
    const { setTags, dbTags, tags } = useMp3Context();
    let iRef: HTMLInputElement;
    let myTime: number;
    const updateTag = () => {
        if (myTime) clearTimeout(myTime);
        const clean = iRef.value.replace(/[^a-zA-Z\s0-9]/gi, "");
        myTime = window.setTimeout(() => {
            setTags(clean);
            iRef.value = clean;
        }, 500);
    };
    effect(() => console.log("***", tags()));
    return (
        <div class="head">
            <ul class="folders">
                <For each={dbTags()}>
                    {(tag) => (
                        <li
                            classList={{ selected: tags().includes(tag.name) }}
                            onClick={() => setTags(tag.name)}
                        >
                            {tag.name}
                        </li>
                    )}
                </For>
            </ul>
            <nav>
                <input
                    ref={(e) => (iRef = e)}
                    type="search"
                    onkeyup={updateTag}
                    placeholder="search"
                ></input>
            </nav>
        </div>
    );
}
