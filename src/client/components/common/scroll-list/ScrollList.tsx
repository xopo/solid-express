import { Accessor, Resource, createEffect, createSignal } from "solid-js";
import { For, Show } from "solid-js/web";
import { useMp3Context, Tag } from "../../../context/appContext";
import "./scrolllist.scss";
import SvgIcon from "../SvgIcon";

type ScrollProps = {
    set: (s: string) => void;
    tags: Accessor<string[]>;
    dbTags: Resource<never[] | Tag[]>;
};

function ScrollList({ tags, dbTags, set }: ScrollProps) {
    if (!dbTags) return null;
    const { onSearch, showModal } = useMp3Context();
    const [show, setShow] = createSignal(false);

    let iRef: HTMLInputElement;
    let myTime: number;
    const toggleShow = () => {
        if (!show()) {
            setTimeout(() => {
                iRef.focus();
            }, 0);
        }
        setShow(!show());
    };
    createEffect(() => {
        if (showModal()) {
            setShow(false);
            onSearch("", "");
        }
    });
    const updateTag = (ev: KeyboardEvent) => {
        console.log(ev);
        if (myTime) clearTimeout(myTime);
        const clean = iRef.value.replace(/[^a-zA-Z\s0-9]/gi, "");
        myTime = window.setTimeout(() => {
            onSearch(clean, ev.code);
            iRef.value = clean;
        }, 500);
    };
    return (
        <div class="scrollList">
            <ul class="folders hide-scroll">
                <Show when={dbTags()}>
                    <For
                        each={dbTags()?.filter((tag: Tag) => tag?.media_count)}
                    >
                        {(tag: Tag) => (
                            <li
                                classList={{
                                    selected: tags().includes(tag.name),
                                }}
                                onClick={() => set(tag.name)}
                            >
                                {tag.name}
                            </li>
                        )}
                    </For>
                </Show>
            </ul>
            <nav>
                <input
                    classList={{ hidden: !show() }}
                    ref={(e) => (iRef = e)}
                    type="search"
                    onkeyup={updateTag}
                    onreset={console.info}
                    placeholder="search"
                />
                <div onclick={() => toggleShow()}>
                    <SvgIcon name="search" />
                </div>
            </nav>
        </div>
    );
}

export default ScrollList;

export function HeadScrollList() {
    const { setTags, dbTags, tags } = useMp3Context();
    return <ScrollList tags={tags} dbTags={dbTags} set={setTags} />;
}

export function DownloadScrollList() {
    const { toggleDownloadTag, dbTags, downloadTags } = useMp3Context();
    return (
        <ScrollList
            tags={downloadTags}
            dbTags={dbTags}
            set={toggleDownloadTag}
        />
    );
}
