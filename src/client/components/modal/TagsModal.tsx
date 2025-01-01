import { effect, Portal, Show } from "solid-js/web";
import "./tagsmodal.scss";
import { createSignal, For } from "solid-js";
import {
    apiAddLabel,
    apiGetLabels,
    apiGetLabelsFor,
    apiToggleLabelOnMedia,
} from "../../api";
import { createResource } from "solid-js";

type TagsModalProps = {
    hide: () => void;
    media_id: string;
};

export default function TagsModal({ hide, media_id }: TagsModalProps) {
    const [showInput, setShowInput] = createSignal(false);
    const [labels, { refetch }] = createResource(apiGetLabels);
    const getLabelsForMedia = apiGetLabelsFor(media_id);

    const [mediaLabels, { refetch: updateList }] =
        createResource(getLabelsForMedia);

    const [label, setLabel] = createSignal("");
    let inputRef: HTMLInputElement;

    const updateLabel = (l: string) => {
        const upd = l.replace(/[^a-zA-Z\s0-9]/gi, "");
        setLabel(upd.length > 2 ? upd : "");
        inputRef.value = upd;
    };

    const onAddLabel = async () => {
        const result = await apiAddLabel(label());
        if (result?.success) {
            refetch();
        }
    };

    const onToggleLabel = async (label_id: number) => {
        const result = await apiToggleLabelOnMedia(label_id, media_id);
        if (result.success) {
            updateList();
        }
    };

    const bi = (id: number): boolean | undefined => {
        if (!mediaLabels()) return false;
        const target = mediaLabels()?.find((ml) => ml.id === id);
        return !!target?.enabled;
    };

    const toggleInput = (ev: MouseEvent) => {
        ev.stopPropagation();
        setShowInput((prev) => !prev);
    };
    effect(() => console.log("--labels", mediaLabels()));
    return (
        <Portal>
            <div class="backdrop" onClick={hide}></div>
            <div class="tags">
                <Show when={labels()?.length}>
                    <ul class="tags-list">
                        <For each={labels()}>
                            {(label) => (
                                <li>
                                    <input
                                        id={`label-${label.name}`}
                                        type="checkbox"
                                        checked={bi(label.id)}
                                        onchange={() => onToggleLabel(label.id)}
                                    />
                                    <label for={`label-${label.name}`}>
                                        {label.name}
                                    </label>
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>
                <Show when={showInput}>
                    <div class="tags-new">
                        <input
                            ref={(el) => (inputRef = el)}
                            type="search"
                            pattern="a-ZA-Z"
                            onkeyup={(e) => updateLabel(e.currentTarget.value)}
                        />
                        <Show when={label()}>
                            <button onClick={onAddLabel}>Add</button>
                        </Show>
                    </div>
                </Show>
                <button type="button" onClick={toggleInput}>
                    Add new folder
                </button>
            </div>
        </Portal>
    );
}