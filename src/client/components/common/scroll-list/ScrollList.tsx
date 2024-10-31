import { For, Show, Accessor, Resource } from "solid-js";
import { useMp3Context, Tag } from "../../../context/appContext";
import "./scrolllist.scss";

type ScrollProps = {
    set: (s: string) => void;
    tags: Accessor<string[]>;
    dbTags: Resource<never[] | Tag[]>;
};

function ScrollList({ tags, dbTags, set }: ScrollProps) {
    if (!dbTags) return null;
    return (
        <>
            <ul class="folders hide-scroll">
                <Show when={dbTags()}>
                    <For each={dbTags()?.filter((tag) => tag?.media_count)}>
                        {(tag) => (
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
            <hr id="bottomline" />
        </>
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
