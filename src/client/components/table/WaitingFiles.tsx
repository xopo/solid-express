import { For, createResource, onCleanup, onMount } from "solid-js"
import BASE_URL from "../../const";
import { Confirmed, Waiting, apiGetWaiting } from "../../api";
import { date2String } from "../../helpers/time";
import './waiting-files.scss'

export default function WaitingFiles() {
    let serverEvent: EventSource;
    const [files, {refetch: refetchWaiting}] = createResource(apiGetWaiting)

    onMount(() => {
        serverEvent = new EventSource(`${BASE_URL}api/newMedia`)
        serverEvent.onmessage = (msg: any) =>  {
            console.log('[SSE Event message]:', msg)
            refetchWaiting();
        }
        serverEvent.onerror = e => console.error(e.toString());
        serverEvent.onopen = e => console.info('Server Event is open for business', e)
    })

    onCleanup(() => {
        serverEvent?.close();
    })

    return  (
        <ul class='download'>
            <For each={files()?.data}>
                {file =>(
                    <>
                    { typeof file.title === 'string'
                        ? <ProcessingFile file={file} />
                        : <WaitingSkeleton file={file as Waiting} />
                    }
                    </>
                )}
            </For>
        </ul>
    ) ;
}

const WaitingSkeleton = ({file}: {file: Waiting}) => <li class='waiting'>
    <div class='name'>{file.name}</div>
    <div class="content">
        <div class="info">
            <div class='time'>{date2String(file.add_time, true)}</div>
            <div>{file.status || 'new'}</div>
            <div class='game'/>
        </div>
        <div class='image'/>
    </div>
</li>

const statusIndicator = (status: string) => {
    if (status === 'waiting') return '⌛';
    if (status === 'download') return <img width='40' src='/spinner.gif' alt="download now"/>
    return null;
}

const ProcessingFile = ({file}: {file: Confirmed}) => <li class="waiting ready">
    <div class='name'>{file.title}</div>
    <div class="content">
        <div class="info">
            <div class='id'>{date2String(file.add_time, true)}</div>
            <div>{file.status || 'new'}</div>
            <div class='game'>
                {statusIndicator(file.status)}
            </div>
        </div>
        <div class='image'>
            {/* <img src={`${BASE_URL}vite.svg`} alt={file.title} /> */}
            <img src={`${BASE_URL}media/${file.name}_small.webp`} alt={file.title} />
        </div>
    </div>
</li>

