import { For, createSignal, onCleanup } from "solid-js";
import MediaEntry from "./Entry";


import './media_list.scss';
import MediaPlayer, { Direction } from "./player/Player";
import { EntryData, useMp3Context } from "../../context/appContext";
import { effect } from "solid-js/web";

export default function MediaList() {
    const [pick, setNewEntry] = createSignal<EntryData|undefined>();
    const [activeDetail, setActiveDetail] = createSignal<EntryData|undefined>();
    const {content, serverMessage, refetchContent, cleanup} = useMp3Context();

    const toggleActive = (entry: EntryData) => {
        if (activeDetail()?.name === entry.name) {
            setActiveDetail(undefined);
        } else {
            setActiveDetail(entry);
        }
    }

    function changeDirection(flow: Direction) {
        const playIndex = content()!.findIndex(entry => entry.media_id === pick()?.media_id)
        if (playIndex === -1) {
            return;
        }

        const direction = flow === 'next' ? 1 : -1;
        let newIndex =playIndex + direction;
        if (newIndex <= 0) {
            newIndex = content()!.length - 1;
        } else  if (newIndex>= content()!.length) {
            newIndex = 0;
        }
        setNewEntry(content()![newIndex]);
    }

    effect(() => {
        if (serverMessage()?.includes('refresh content')) {
            console.log(serverMessage(), 'refreshing content')
            refetchContent();
        }
    })

    onCleanup(cleanup);
    
    return(
        <>
            <MediaPlayer pick={pick} action={changeDirection}/>
            <ul class='media-list'>
                <For each={content()}>
                    {entry => (
                        <MediaEntry
                            changeMedia={setNewEntry}
                            entry={entry}
                            active={activeDetail}
                            setActive={toggleActive}
                        />
                    )}
                </For>
            </ul>
        </>
    );
}