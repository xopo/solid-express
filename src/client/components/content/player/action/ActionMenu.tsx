import { apiDeleteMedia, apiRestartDownload } from "../../../../api";
import { EntryData, useMp3Context } from "../../../../context/appContext";
import SvgIcon from "../../../common/SvgIcon";
import './action-menu.scss'
export type ActionMenuProps = {
    entry: EntryData
}

export default function ActionMenu({entry}: ActionMenuProps) {
    const {refetchContent} = useMp3Context();
    function onSave(ev: MouseEvent) {
        ev.stopPropagation();
        console.log('Save', entry)
    }
    
    async function onDownload(ev: MouseEvent) {
        ev.stopPropagation();
        await apiRestartDownload(entry, true);
        refetchContent();
    }
    
    async function onDelete(ev: MouseEvent) {
        ev.stopPropagation();
        await apiDeleteMedia(entry.media_id);
        refetchContent();
    }

    return (
        <div class='action-menu'>
            <button title='Set a location' disabled>
                <SvgIcon name="open_folder" size={28}/>
            </button>
            <button title='Save locally' onclick={onSave}>
                <a href={`/assets/images/${entry.name}.mp3`} download={`${entry.title}.mp3`}>
                    <SvgIcon name="download" size={28} />
                </a>
            </button>
            <button title='Download again' onclick={onDownload}>
                <SvgIcon name="restart" size={28}/>
            </button>
            <button title='delete' onclick={onDelete}>
                <SvgIcon name="delete" size={28} />
            </button>
        </div>
    );
}