import { date2String } from "../../helpers/time";
import { getMediumFromUrl } from "../../helpers/utils";
import SvgIcon from "../common/SvgIcon";
import { Accessor } from "solid-js";
import { Show } from "solid-js/web";
import ActionMenu from "./player/action/ActionMenu";
import { EntryData } from "../../context/appContext";
import { getWebpLink } from "../common/helpers/media";
import "./entry.scss";
import { unescape } from "validator";

type MediaEntryProps = {
    entry: EntryData;
    changeMedia: (entry: EntryData) => void;
    active: Accessor<EntryData | undefined>;
    setActive: (entry: EntryData) => void;
    addElement: (el: any) => void;
    visible: Accessor<string[]>;
    isLast: boolean;
};

export default function MediaEntry({
    entry,
    changeMedia,
    active,
    setActive,
    addElement,
    visible,
    isLast,
}: MediaEntryProps) {
    const medium = getMediumFromUrl(entry.url);
    const showActionMenu = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        setActive(entry);
    };

    const disableMenu = (entry: EntryData) => {
        setActive(entry);
    };

    const show = visible().includes(entry.media_id);

    const onChangeMedia = (e: MouseEvent | undefined) => {
        if ((e?.currentTarget as HTMLElement)?.classList?.contains("trigger")) {
            changeMedia(entry);
        }
    };

    return (
        <li
            class="entry"
            classList={{ lastentry: isLast }}
            data-id={entry.media_id}
            ref={(el) => addElement((prev: any[]) => [...prev, el])}
        >
            <div class="image">
                <div class="meta">
                    <div>{entry.duration_string}</div>
                    <div>
                        <a href={entry.url} target="__blank">
                            Link to video
                        </a>
                    </div>
                </div>
                <picture
                    class="trigger"
                    onclick={onChangeMedia}
                    data-url={getWebpLink(entry.name)}
                >
                    <source srcset={show ? getWebpLink(entry.name) : "#"} />
                    <img width="350" src={show ? entry.thumbnail : "#"} />
                </picture>
            </div>
            <div class="title trigger" onclick={onChangeMedia}>
                <SvgIcon name={medium} size={36} />
                <div class="text" title={entry.title}>
                    <strong>{entry.title}</strong>
                </div>
                <div class="action">
                    <Show when={active()?.name === entry.name}>
                        <ActionMenu
                            entry={entry}
                            disable={() => disableMenu(entry)}
                        />
                    </Show>
                    <button class="transparent" onClick={showActionMenu}>
                        <SvgIcon name="more_vert" />
                    </button>
                </div>
            </div>
            <div class="details">
                <div class="name">
                    <a href={decodeURI(entry.channel_url)} target="__blank">
                        <strong>{unescape(entry.uploader)}</strong>
                    </a>
                </div>
                <div class="time">{date2String(entry.add_time, true)}</div>
            </div>
            <p>{unescape(entry.description)}</p>
        </li>
    );
}
