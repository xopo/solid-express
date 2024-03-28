import { Accessor, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { effect } from "solid-js/web";
import SvgIcon from "../../common/SvgIcon";
import { EntryData } from "../../../context/appContext";
import './player.scss';

type PlayerPops = {
    pick: Accessor<EntryData | undefined>;
    action: (direction: Direction) => void;
}

export type Direction = 'next'|'prev';

export type PlayerStatus = 'play' | 'pause';

const initialAudioControl: Record<string, number> = {
    total: 100,
    cursor: 0,
    step: .5,
};

export default function MediaPlayer({pick, action}: PlayerPops) {
    const [playing, setPlaying] = createSignal<EntryData>();
    const [audioStatus, setAudioStatus] = createSignal<PlayerStatus>();
    const [time, setTime] = createSignal({actual: 0, total: 0});
    const [changingMedia, setChangingMedia] = createSignal(false);
    const [lightTheme, toggleLightTheme] = createSignal(true);
    const [controlAudio, setControlAudio] = createSignal({...initialAudioControl});
    const [speed, setSpeed] = createSignal(1);
    const [mute, setMute] = createSignal(false)

    let interval: number;

    onMount(() => {
        interval = window.setInterval(() => {
            if (playRef) {
                setTime({
                    actual: playRef.currentTime,
                    total: playRef.duration
                })
                setControlAudio({...controlAudio, cursor: (playRef.currentTime * 100 / playRef.duration)})
                // console.log('-- curent time', playRef.currentTime, duration)
            }
        }, 250);
    })

    onCleanup(() => {
        clearInterval(interval);
    })

    let playRef: HTMLAudioElement | undefined = undefined;

    effect(() => {
        if (playRef?.played) {
            console.log(playRef?.played)
            setChangingMedia(true);
        }
        setPlaying(pick());
        playRef?.load();
        playRef?.play().finally(() =>{
            setAudioStatus('play')
            toggleMute(true)
            setTime({
                actual: 1,
                total: playRef!.duration
            })
            setTimeout(() => {
                setChangingMedia(false);
            }, 500);
        });
    })

    async function togglePlay() {
        playRef?.pause()
        if (audioStatus() === 'play') {
            playRef?.pause();
            setAudioStatus('pause')
        } else {
            await playRef?.play();
            setAudioStatus('play')
        }
    }

    function onSetSpeed() {
        const newSpeed = speed() >= 2 ? 1 : speed() + .25;
        setSpeed(newSpeed);
        playRef!.playbackRate = newSpeed;
    }

    function onChangeVolume(val: string) {
        playRef!.volume = Number(val) / 100;
    }

    function toggleMute(unmute = false) {
        if (playRef) {
            if (unmute === true && !playRef.muted) {
                return;
            }
            setMute(!playRef.muted);
            playRef!.muted = !playRef.muted;
        }
    }

    const formatTime = ({actual, total}: {actual: number, total: number}) => {
        function format(aTime: number) {
            const min = Math.floor(aTime/60);
            const sec = Math.floor(aTime % 60);
            const formatMin = min < 10 ? `0${min}` : min;
            const formatSec = sec < 10 ? `0${sec}` : sec;

            return `${formatMin}:${formatSec}`;
        }
        return (
            <>
                <span>{format(actual)}</span>
                <span>{format(total)}</span>
            </>
        );
    }

    const updateControlPosition = (newPosition: string) => {
        if (playRef) {
            playRef.currentTime = Number(newPosition) * playRef.duration / 100;
        }
        setControlAudio(prev => ({...prev, cursor: Number(newPosition)}));
    }
    let {total, step, cursor} = controlAudio();

    createEffect(() => {
        ({total, step, cursor} = controlAudio());
    })
    
    return (
        <>
            <Show when={playing()?.name}>
                <audio
                    class="hidden"
                    onPlay={() => setAudioStatus('play')}
                    onPause={() => setAudioStatus('pause')}
                    onChange={() => playRef?.pause() && setAudioStatus('pause')}
                    ref={el => playRef = el}
                    controls
                >
                    <source src={`/media/${playing()?.name}.mp3`} type="audio/mpeg"></source>
                </audio>
                <div class="custom-player" classList={{'light': lightTheme()}}>
                    <div class={`title ${audioStatus()}`}>
                        <div class="text">
                            {playing()?.title}
                        </div>
                    </div>
                    <div class="volume-time flex">
                        <div class="controls flex">
                            <button class='transparent prev' onclick={()=>action('prev')} disabled={changingMedia()}>
                                <SvgIcon name="circle_next" />
                            </button>
                            <button class='transparent' onClick={togglePlay}>
                                <Show when={audioStatus() === 'play'} fallback={<SvgIcon size={41} name='circle_pause'/> }>
                                    <SvgIcon size={41} name='circle_play'/>
                                </Show>
                            </button>
                            <button class='transparent next' onclick={()=>action('next')} disabled={changingMedia()}>
                                <SvgIcon name="circle_next" />
                            </button>
                            <button class="transparent" onClick={() => setPlaying(undefined)}>
                                <SvgIcon name='circle_stop' />
                            </button>
                        </div>
                        <p class="speed" onclick={onSetSpeed}>{speed()}x</p>
                        <button type='button' class='transparent icon' onclick={() => toggleMute()}>
                            <Show when={mute() === true} fallback={<SvgIcon name='volume_up'/>}>
                                <SvgIcon name='volume_mute' />
                            </Show>
                        </button>
                        <input type="range" min='0' max='100' onChange={e => onChangeVolume(e.target.value)}/>
                    </div>
                    <div class="track">
                        <div class="duration">{formatTime(time())}</div>
                        <input
                            type='range'
                            class='audio-controller'
                            min={0}
                            max={total}
                            step={step}
                            value={controlAudio().cursor}
                            onChange={ev => updateControlPosition(ev.target.value)}
                        />
                    </div>
                    <div class="theme">
                        <button type="button" class='transparent' onclick={() => toggleLightTheme(prev => !prev)}>
                            🌓
                        </button>
                    </div>
                </div>
            </Show>
        </>
    );
}