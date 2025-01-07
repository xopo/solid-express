import {
    For,
    Show,
    createEffect,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import MediaEntry from "./Entry";
import MediaPlayer, { Direction } from "./player/Player";
import { EntryData, useMp3Context } from "../../context/appContext";
import { createIntersectionObserver } from "@solid-primitives/intersection-observer";

import "./media_list.scss";

export default function MediaList() {
    let observer: IntersectionObserver;
    const [pick, setNewEntry] = createSignal<EntryData | undefined>();
    //@ts-ignore
    const [visible, setVisible] = createSignal<string[]>([]);
    const [activeDetail, setActiveDetail] = createSignal<
        EntryData | undefined
    >();
    const {
        content,
        deleted,
        serverMessage,
        refetchContent,
        cleanup,
        goNextPage,
    } = useMp3Context();

    const [targets, setTargets] = createSignal<Element[]>([]);

    const toggleActive = (entry: EntryData) => {
        if (activeDetail()?.name === entry.name) {
            setActiveDetail(undefined);
        } else {
            setActiveDetail(entry);
        }
    };

    function bottomScrooll(
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver,
    ) {
        console.log({ entries, observer });
        entries.forEach((entry: IntersectionObserverEntry) => {
            //@ts-ignore
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                entry.target.classList.remove("lastentry");
                goNextPage();
            }
        });
    }

    onMount(() => {
        // const root = document.querySelector("#root");
        observer = new IntersectionObserver(bottomScrooll, {
            // root,
            // rootMargin: "0px",
            // threshold: 1.0,
        });
    });

    createIntersectionObserver(targets, (entries, observer) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                let pic = e.target.getElementsByTagName("picture")[0];
                pic.getElementsByTagName("source")[0].srcset = pic.dataset.url!;
                pic.getElementsByTagName("img")[0].src = pic.dataset.url!;
                observer.unobserve(e.target);
            }
        });
    });

    function changeDirection(flow: Direction) {
        if (flow === "stop") {
            setNewEntry(undefined);
            return;
        }
        const playIndex = content()!.findIndex(
            (entry) => entry.media_id === pick()?.media_id,
        );
        if (playIndex === -1) {
            return;
        }

        const direction = flow === "next" ? 1 : -1;
        let newIndex = playIndex + direction;
        if (newIndex <= 0) {
            newIndex = content()!.length - 1;
        } else if (newIndex >= content()!.length) {
            newIndex = 0;
        }
        setNewEntry(content()![newIndex]);
    }

    createEffect(() => {
        if (serverMessage()?.includes("refresh content")) {
            console.log(serverMessage(), "refreshing content");
            refetchContent();
        }
    });

    onCleanup(cleanup);

    createEffect(() => {
        //@ts-ignore
        if (content()?.length > 0) {
            const target = document.querySelector(".lastentry");
            if (target) {
                observer.observe(target);
            }
        }
    });

    const fewMedia = () => {
        if (!content()) return true;
        return content()!.length < 3;
    };

    return (
        <>
            <MediaPlayer pick={pick} action={changeDirection} />
            <ul class="media-list" classList={{ small: fewMedia() }}>
                <For each={content()}>
                    {(entry, idx) => (
                        <Show when={!deleted().includes(entry.media_id)}>
                            <MediaEntry
                                changeMedia={setNewEntry}
                                entry={entry}
                                active={activeDetail}
                                setActive={toggleActive}
                                addElement={setTargets}
                                visible={visible}
                                isLast={content()?.length === idx() + 1}
                            />
                        </Show>
                    )}
                </For>
            </ul>
        </>
    );
}
