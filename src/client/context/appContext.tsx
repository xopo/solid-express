import {
    createContext,
    createResource,
    createSignal,
    useContext,
} from "solid-js";
import BASE_URL from "../const";
import { Accessor } from "solid-js";
import { getContent } from "../api";

export const Mp3Context = createContext<Mp3ContextType>({} as Mp3ContextType);

type WithChildren = {
    children: any;
};

type Mp3ContextType = {
    content: Accessor<EntryData[] | undefined>;
    refetchContent: () => void;
    serverMessage: Accessor<string | undefined>;
    setTags: (s: string) => void;
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
    const [tags, setTags] = createSignal<string>("");
    const serverEvent = new EventSource(`${BASE_URL}api/newMedia`);
    const [content, { refetch: refetchContent }] = createResource(
        tags,
        getContent
    );

    serverEvent.onmessage = (msg: any) => {
        console.log("[Context - SSE Event message]:", msg);
        setServerMessage(msg.data);
    };
    serverEvent.onerror = (e) => console.error(e.toString());
    serverEvent.onopen = (e) =>
        console.info("Server Event is open for business", e);

    const contextValue = {
        content,
        refetchContent,
        serverMessage,
        setTags,
        cleanup: () => serverEvent.close(),
    };
    return (
        <Mp3Context.Provider value={contextValue}>
            {props.children}
        </Mp3Context.Provider>
    );
};

export const useMp3Context = () => {
    return useContext(Mp3Context);
};
