import {
    Setter,
    createContext,
    createResource,
    createSignal,
    onCleanup,
    useContext,
} from "solid-js";
import BASE_URL from "../const";
import { Accessor, Resource } from "solid-js";
import { getContent, getTags } from "../api";
import { effect } from "solid-js/web";

export const Mp3Context = createContext<Mp3ContextType>({} as Mp3ContextType);

type WithChildren = {
    children: any;
};
export type Tag = { id: number; name: string };

type Mp3ContextType = {
    dbTags: Resource<never[] | Tag[]>;
    content: Accessor<EntryData[] | undefined>;
    downloadTags: Accessor<string[]>;
    refetchContent: () => void;
    serverMessage: Accessor<string | undefined>;
    setTags: (s: string) => void;
    toggleDownloadTag: (s: string) => void;
    setDownloadTags: (s: string) => void;
    resetDownloadTags: () => void;
    showModal: Accessor<boolean>;
    setShowModal: Setter<boolean>;
    tags: Accessor<string[]>;
    cleanup: () => void;
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

export const Mp3Provider = (props: WithChildren) => {
    const [serverMessage, setServerMessage] = createSignal<string>();
    const [showModal, setShowModal] = createSignal(false);
    const [tags, setTags] = createSignal<string[]>([]);
    const [downloadTags, setDownloadTags] = createSignal<string[]>([]);
    const serverEvent = new EventSource(`${BASE_URL}api/newMedia`);
    const [dbTags] = createResource(getTags);
    const [content, { refetch: refetchContent }] = createResource(
        tags,
        getContent,
    );

    serverEvent.onmessage = (msg: any) => {
        if (msg.data !== serverMessage) {
            setServerMessage(msg.data);
            if (msg.data.includes("completed")) {
                refetchContent();
            }
        }
    };

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

    effect(() => console.log("dbtags", dbTags()));
    effect(() => console.dir({ "--tags": tags() }));
    effect(() => console.dir({ "--downloadTags": downloadTags() }));

    const contextValue = {
        dbTags,
        content,
        refetchContent,
        serverMessage,
        tags,
        setTags: toggleTag,
        toggleDownloadTag,
        showModal,
        downloadTags,
        setDownloadTags,
        resetDownloadTags,
        setShowModal,
        cleanup: () => serverEvent.close(),
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
