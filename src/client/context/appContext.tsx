import {
    Setter,
    createContext,
    createEffect,
    createResource,
    createSignal,
    onCleanup,
    useContext,
} from "solid-js";
import BASE_URL from "../const";
import { Accessor, Resource } from "solid-js";
import { getContent, getTags } from "../api";

export const Mp3Context = createContext<Mp3ContextType>({} as Mp3ContextType);

type WithChildren = {
    children: any;
};
export type Tag = { id: number; name: string; media_count: number };

type Mp3ContextType = {
    cleanup: () => void;
    content: Accessor<EntryData[] | undefined>;
    dbTags: Resource<never[] | Tag[]>;
    downloadTags: Accessor<string[]>;
    goNextPage: () => void;
    onSearch: (s: string, k: string) => void;
    refetchContent: () => void;
    resetDownloadTags: () => void;
    search: Accessor<string>;
    serverMessage: Accessor<string | undefined>;
    setDownloadTags: (s: string) => void;
    setShowModal: Setter<boolean>;
    setTags: (s: string) => void;
    showModal: Accessor<boolean>;
    tags: Accessor<string[]>;
    toggleDownloadTag: (s: string) => void;
};

export type EntryData = {
    name: string;
    add_time: string;
    media_id: string;
    title: string;
    categories?: string;
    description: string;
    epoch: number;
    thumbnail: string;
    duration_string: string;
    channel_url: string;
    url: string;
    uploader: string;
    upload_date: string;
    upload_url: string;
};

const nowSeconds = () => new Date().getTime() / 100;

export const Mp3Provider = (props: WithChildren) => {
    const [serverMessage, setServerMessage] = createSignal<string>();
    const [page, setPage] = createSignal(1);
    const [showModal, setShowModal] = createSignal(false);
    const [tags, setTags] = createSignal<string[]>([]);
    const [search, setSearch] = createSignal<string>("");
    const [downloadTags, setDownloadTags] = createSignal<string[]>([]);
    const [lastRequest, setLastRequest] = createSignal(nowSeconds());
    const serverEvent = new EventSource(`${BASE_URL}api/newMedia`);
    let serverTags: Tag[];

    const [dbTags, { mutate: mutateContent }] = createResource(() =>
        getTags().then((data) => {
            serverTags = data;
            return data;
        }),
    );

    const [media, setMedia] = createSignal<EntryData[]>([]);
    const [content, { refetch: refetchContent }] = createResource(
        { tags, page },
        getContent,
    );

    const goNextPage = () => {
        let thisNow = nowSeconds();
        console.log(thisNow, thisNow - lastRequest());
        if (thisNow - lastRequest() < 2) {
            console.error("too soon");
            return;
        }
        setLastRequest(thisNow);
        setPage(page() + 1);
        setTimeout(refetchContent, 100);
    };

    serverEvent.onmessage = (msg: any) => {
        if (msg.data !== serverMessage) {
            setServerMessage(msg.data);
            if (msg.data.includes("completed")) {
                refetchContent();
            }
        }
    };

    createEffect(() => {
        let newMedia: EntryData[] = [];
        if (page() === 1) {
            console.log("update media for page 1");
            newMedia = content() || [];
        } else {
            console.info("update media for next page");
            newMedia = [...media(), ...(content() || [])];
        }
        console.log("new media length", newMedia.length);
        setMedia(newMedia);
        debugger;
    });

    serverEvent.onerror = (e) => console.error(e.toString());
    serverEvent.onopen = (e) =>
        console.info("Server Event is open for business", e);

    const toggleTag = (tag: string) => {
        if (tags().includes(tag)) {
            setTags(tags().filter((sTag) => sTag !== tag));
        } else {
            setTags([...tags(), tag]);
        }
    };
    const toggleDownloadTag = (tag: string) => {
        if (downloadTags().includes(tag)) {
            setDownloadTags(downloadTags().filter((sTag) => sTag !== tag));
        } else {
            setDownloadTags([...downloadTags(), tag]);
        }
    };
    const resetDownloadTags = () => setDownloadTags([]);

    const onSearch = (term: string, key: string) => {
        if (key === "Escape") {
            mutateContent(serverTags);
            return;
        }
        setSearch(term);
        const searchList = term.toLowerCase().replace(/\s+/g, " ").split(" ");
        if (term.trim().length === 0) {
            mutateContent(serverTags);
            return;
        } else {
            mutateContent(
                serverTags.filter((tag) => {
                    const tagName = tag.name.toLowerCase();
                    for (let src of searchList) {
                        if (src.includes(tagName) || tagName.includes(src)) {
                            return true;
                        }
                    }
                }),
            );
        }
    };

    const contextValue = {
        cleanup: () => serverEvent.close(),
        content: media,
        dbTags,
        downloadTags,
        goNextPage,
        onSearch,
        refetchContent,
        resetDownloadTags,
        search,
        serverMessage,
        setDownloadTags,
        setShowModal,
        setTags: toggleTag,
        showModal,
        tags,
        toggleDownloadTag,
    };
    onCleanup(() => {
        serverEvent?.close();
    });
    return (
        <Mp3Context.Provider value={contextValue}>
            {props.children}
        </Mp3Context.Provider>
    );
};

export const useMp3Context = () => {
    return useContext(Mp3Context);
};
