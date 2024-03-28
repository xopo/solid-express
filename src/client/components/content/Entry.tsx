import { EntryData } from "../../App";
import { date2String } from "../../helpers/time";
import { getMediumFromUrl } from "../../helpers/utils";
import SvgIcon from "../common/SvgIcon";
import './entry.scss';
import { Accessor, Show } from "solid-js";
import ActionMenu from "./player/action/ActionMenu";

type MediaEntryProps = {
    entry: EntryData;
    changeMedia: (entry: EntryData) => void;
    active: Accessor<EntryData | undefined>;
    setActive: (entry: EntryData) => void;
}

export default function MediaEntry({entry, changeMedia, active, setActive}: MediaEntryProps) {
    const medium = getMediumFromUrl(entry.url);
    
    const showActionMenu = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        setActive(entry)
    }
    
    return (
        <li class='entry'>
            <div class="image">
                <div class="meta">
                    <div>{entry.duration_string}</div>
                    <div><a href={entry.url} target="__blank">Link to video</a></div>
                </div>
                <picture>
                    <source srcset={`/media/${entry.name}.webp`} />
                    <img  onclick={()=>changeMedia(entry)} width='350' src={entry.thumbnail}/>
                </picture>
            </div>
            <div class="title" onclick={()=>changeMedia(entry)}>
                <SvgIcon name={medium} size={36}/>
                <div class='text' title={entry.title}><strong>{entry.title}</strong></div>
                <div class="action">
                    <Show when={active()?.name === entry.name}>
                        <ActionMenu entry={entry}/>
                    </Show>
                    <button class='transparent' onClick={showActionMenu}>
                        <SvgIcon name='more_vert'/>
                    </button>
                </div>
            </div>
            <div class="details">
                <div class="name">
                    <a href={entry.channel_url} target="__blank"><strong>{entry.uploader}</strong></a>
                </div>
                <div class="time">{date2String(entry.add_time, true)}</div>
            </div>
            <p>{entry.description}</p>
        </li>
    );
}