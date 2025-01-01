import { createSignal } from "solid-js";
import { apiDeleteMedia, apiRestartDownload } from "../../../../api";
import { EntryData, useMp3Context } from "../../../../context/appContext";
import SvgIcon from "../../../common/SvgIcon";
import "./action-menu.scss";
import { Show } from "solid-js";
import TagsModal from "../../../modal/TagsModal";
import { getMp3Link } from "../../../common/helpers/media";
export type ActionMenuProps = {
    entry: EntryData;
    disable: () => void;
};

export default function ActionMenu({ entry, disable }: ActionMenuProps) {
    const { refetchContent } = useMp3Context();
    const [showTagsModal, setShowTagsModal] = createSignal(false);
    // function onSave(ev: MouseEvent) {
    //     ev.stopPropagation();
    //     console.log("Save", entry);
    // }

    async function onDownload(ev: MouseEvent) {
        ev.stopPropagation();
        await apiRestartDownload(entry, true);
        refetchContent();
        disable();
    }

    async function onDelete(ev: MouseEvent) {
        ev.stopPropagation();
        await apiDeleteMedia(entry.media_id);
        refetchContent();
        disable();
    }
    return (
        <div class="action-menu" onclick={(e) => e.stopPropagation()}>
            <button
                type="button"
                title="Set a location"
                onClick={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    setShowTagsModal(true);
                }}
            >
                <SvgIcon name="open_folder" size={28} />
            </button>
            <button type="button" title="Save locally">
                <a
                    href={getMp3Link(entry.name)}
                    download={`${entry.title}.mp3`}
                    onClick={() => disable()}
                >
                    <SvgIcon name="download" size={28} />
                </a>
            </button>
            <button type="button" title="Download again" onclick={onDownload}>
                <SvgIcon name="restart" size={28} />
            </button>
            <button type="button" title="delete" onclick={onDelete}>
                <SvgIcon name="delete" size={28} />
            </button>
            <Show when={showTagsModal()}>
                <TagsModal
                    hide={() => {
                        setShowTagsModal(false)
                        disable()
                    }}
                    media_id={entry.media_id}
                />
            </Show>
        </div>
    );
}