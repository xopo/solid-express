import {
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
type Tag = { id: number; name: string };

type Mp3ContextType = {
    dbTags: Resource<Tag[] | undefined>;
    content: Accessor<EntryData[] | undefined>;
    refetchContent: () => void;
    serverMessage: Accessor<string | undefined>;
    setTags: (s: string) => void;
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

// const fetchContent = async (tags: string) => {
//     console.log("fetch content", tags);
//     const result = (await (await fetch("/api/content")).json()) as {
//         data: EntryData[];
//     };
//     return result.data;
// };

export const Mp3Provider = (props: WithChildren) => {
    const [serverMessage, setServerMessage] = createSignal<string>();
    const [tags, setTags] = createSignal<string[]>([]);
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
        console.log(" toggle tag ", tag);
        if (tags().includes(tag)) {
            setTags(tags().filter((sTag) => sTag !== tag));
        } else {
            setTags([...tags(), tag]);
        }
    };
    effect(() => console.dir(tags()));

    const contextValue = {
        dbTags,
        content,
        refetchContent,
        serverMessage,
        tags,
        setTags: toggleTag,
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
