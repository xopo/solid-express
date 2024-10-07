import {
    Accessor,
    For,
    createEffect,
    createResource,
    createSignal,
} from "solid-js";
import {
    Waiting,
    apiDeleteWaiting,
    apiGetWaiting,
    apiRestartDownload,
} from "../../api";
import { date2String } from "../../helpers/time";
import "./waiting-files.scss";
import SvgIcon from "../common/SvgIcon";
import { useMp3Context } from "../../context/appContext";
import { effect } from "solid-js/web";
import { NewFile } from "../media/AddMedia";
import BASE_URL from "../../const";

type Props = {
    hide: () => void;
    newFiles: Accessor<NewFile[]>;
    resetNewFiles: () => void;
};

export default function WaitingFiles({ hide, newFiles, resetNewFiles }: Props) {
    const { serverMessage } = useMp3Context();
    const [lastMessage, setLastMessage] = createSignal("");
    const [files, { refetch: refetchWaiting }] = createResource(apiGetWaiting);

    createEffect(() => {
        if (serverMessage() !== lastMessage()) {
            setLastMessage(serverMessage() || "");
            if (
                serverMessage()?.includes("media") ||
                serverMessage()?.includes("content")
            ) {
                console.log("server message:", serverMessage());
                refetchWaiting();
                if (
                    files()?.data?.length === 1 &&
                    serverMessage()?.includes("content")
                ) {
                    hide();
                }
            }
        } else {
            console.log("server message", serverMessage());
        }
    });

    effect(() => {
        console.log(" get files", files());
        if (files() !== undefined) {
            console.log("reset new files");
            resetNewFiles();
        }
    });

    return (
        <ul class="download">
            <For each={newFiles()}>
                {(file) => (
                    <div class="flex">
                        <div>{file.url}</div>
                        <div>✅</div>
                        <div>
                            <img width="40" src={`${BASE_URL}spinner.gif`} />
                        </div>
                    </div>
                )}
            </For>
            <For each={files()?.data}>
                {(file) => <WaitingSkeleton file={file as Waiting} />}
            </For>
        </ul>
    );
}

const WaitingSkeleton = ({ file }: { file: Waiting }) => (
    <li class="waiting">
        <div class="name">{file.title || file.name}</div>
        <div class="content">
            <div class="info" classList={{ delete: file.status === "delete" }}>
                <div class="time">
                    {file.add_time
                        ? date2String(file.add_time, true)
                        : file.waiting_url}
                </div>
                <div class="status">
                    <div>{file.status || "new"} </div>
                    <div class="delete">
                        <button
                            class="transparent"
                            onClick={() => apiDeleteWaiting(file)}
                        >
                            <SvgIcon name="delete" />
                        </button>
                        <button
                            class="transparent"
                            onClick={() => apiRestartDownload(file)}
                        >
                            <SvgIcon name="restart" />
                        </button>
                    </div>
                </div>
                <div class="game">
                    {file.status && statusIndicator(file.status)}
                </div>
            </div>
            <div class="image">
                {file.thumbnail && (
                    <img src={file.thumbnail} alt={file.title} />
                )}
            </div>
        </div>
    </li>
);

const statusIndicator = (status: string) => {
    if (status === "waiting") return "⌛";
    if (["details", "download"].includes(status)) {
        console.log({ BASE_URL });
        return (
            <img width="40" src={`${BASE_URL}spinner.gif`} alt="download now" />
        );
    }
    return null;
};
