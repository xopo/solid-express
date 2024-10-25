import {
    Accessor,
    Show,
    createEffect,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import SvgIcon from "../../common/SvgIcon";
import { EntryData } from "../../../context/appContext";
import {
    getLocalStoragePreferences,
    removeFromHistory,
    setLocalStorageMedia,
    setLocalStorageVolume,
} from "../../../helpers/storage";
import { effect } from "solid-js/web";
import { getMp3Link } from "../../common/helpers/media";

import "./player.scss";

type PlayerPops = {
    pick: Accessor<EntryData | undefined>;
    action: (direction: Direction) => void;
};

const delay = (ms: 100) => new Promise((resolve) => setTimeout(resolve, ms));

export type Direction = "next" | "prev" | "stop";

export type PlayerStatus = "play" | "pause";

const { volume, history } = getLocalStoragePreferences();

// duration ex [1:34:32 - 1hour 34 min 32 sec]
const durationFromTxt = (duration?: string): number => {
    if (typeof duration === "string") {
        const expanded = duration.split(":").reverse();
        return (
            Number(expanded[0]) +
            Number(expanded[1] || 0) * 60 +
            Number(expanded[2] || 0) * 3600
        );
    }
    console.log("bad duration string");
    return 100;
};

export default function MediaPlayer({ pick, action }: PlayerPops) {
    const [playing, setPlaying] = createSignal<EntryData>();
    const [hoverSeekBar, setHoverSeekBar] = createSignal<boolean>(false);
    const [audioStatus, setAudioStatus] = createSignal<PlayerStatus>();
    const [duration, setDuration] = createSignal(100);
    const [actualTime, setActualTime] = createSignal<number>(0);
    const [total, setTotal] = createSignal<number>(100);
    const [changingMedia, setChangingMedia] = createSignal(false);
    const [lightTheme, toggleLightTheme] = createSignal(true);
    const media = history.find((item) => item.id === pick()?.media_id);
    // audio cursor
    const [cursor, setCursor] = createSignal<number>(media?.cursor || 0);
    const [speed, setSpeed] = createSignal(1);
    const [mute, setMute] = createSignal(volume < 0.5 ? true : false);

    let interval: number;
    let seekRef: HTMLInputElement;

    effect(() => {
        const bodyEl = document.querySelector("body");
        if (playing()) {
            bodyEl?.classList.add("playing");
        } else {
            bodyEl?.classList.remove("playing");
        }
    });

    const startInterval = () =>
        window.setInterval(() => {
            if (playRef && !playRef.paused && !hoverSeekBar()) {
                setCursor((playRef.currentTime * 100) / playRef.duration);
                setActualTime(playRef.currentTime);
                setLocalStorageMedia(pick()!.media_id, cursor());
                if (seekRef?.value) {
                    seekRef.value = `${cursor()}`;
                }
            }
        }, 1000);

    onMount(() => {
        if (!interval) {
            interval = startInterval();
        }
    });

    onCleanup(() => {
        clearInterval(interval);
        if (playRef) {
            playRef!.pause();
        }
        console.info("pause");
    });

    let playRef: HTMLAudioElement | undefined = undefined;

    createEffect(async () => {
        if (playRef?.played) {
            playRef?.load();
            setChangingMedia(true);
        }
        setPlaying(pick());
        setDuration(durationFromTxt(pick()?.duration_string));
        let retry = 20;
        while (retry-- > 0) {
            await delay(100);
            if (playRef?.readyState === 4) {
                retry = 0;
                playRef?.play().finally(() => {
                    if (!pick()) return;

                    const playHistory =
                        getLocalStoragePreferences().history.find(
                            (item) => item.id === pick()!.media_id,
                        );
                    if (playHistory && !isNaN(playRef!.duration)) {
                        playRef!.currentTime =
                            (playRef!.duration / 100) * playHistory.cursor;
                        setCursor(playHistory.cursor);
                    }
                    setAudioStatus("play");
                    toggleMute(true);
                    // setTime({
                    //     actual: 1,
                    //     total: playRef!.duration,
                    // });
                    setActualTime(0);
                    setTotal(playRef!.duration);
                    setTimeout(() => {
                        setChangingMedia(false);
                    }, 300);
                });
            }
        }
    });
    // TODO bibi
    async function onEnded() {
        removeFromHistory(pick()!.media_id);
        action("next");
        setAudioStatus("pause");
    }

    async function togglePlay() {
        if (playRef) {
            playRef.pause();
            if (audioStatus() === "play") {
                playRef.pause();
                setAudioStatus("pause");
            } else {
                await playRef.play();
                setAudioStatus("play");
            }
        }
    }

    async function onStop() {
        if (playRef) {
            playRef!.pause();
            playRef!.src = "";
            action("stop");
            setPlaying(undefined);
        }
    }

    function onSetSpeed() {
        const newSpeed = speed() >= 2 ? 1 : speed() + 0.25;
        setSpeed(newSpeed);
        playRef!.playbackRate = newSpeed;
    }

    let volumeTimeout: number;
    function onChangeVolume(val: string) {
        const volumeVal = Number(val);
        playRef!.volume = volumeVal / 100;
        if (volumeTimeout) {
            window.clearTimeout(volumeTimeout);
        }
        volumeTimeout = window.setTimeout(() => {
            setLocalStorageVolume(volumeVal);
        }, 200);
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

    function format(aTime: number) {
        const min = Math.floor(aTime / 60);
        const sec = Math.floor(aTime % 60);
        const formatMin = min < 10 ? `0${min}` : min;
        const formatSec = sec < 10 ? `0${sec}` : sec;

        return `${formatMin}:${formatSec}`;
    }

    const updateControlPosition = (newPosition: string) => {
        const numberPosition = Number(newPosition);
        setCursor(numberPosition);
        setLocalStorageMedia(pick()!.media_id, numberPosition);
        if (playRef) {
            playRef.currentTime = (numberPosition / 100) * duration();
            setActualTime(playRef.currentTime);
            seekRef.value = newPosition;
        }
    };

    return (
        <>
            <Show when={playing()?.name}>
                <audio
                    class="hidden"
                    onEnded={() => onEnded()}
                    ref={(el) => (playRef = el)}
                    controls
                >
                    <source
                        src={getMp3Link(playing()!.name)}
                        type="audio/mpeg"
                    ></source>
                </audio>
                <div class="custom-player" classList={{ light: lightTheme() }}>
                    <div class={`title ${audioStatus()}`}>
                        <div class="text">{playing()?.title}</div>
                    </div>
                    <div class="volume-time flex">
                        <div class="controls flex">
                            <button
                                class="transparent prev"
                                onclick={() => action("prev")}
                                disabled={changingMedia()}
                            >
                                <SvgIcon name="circle_next" />
                            </button>
                            <button class="transparent" onClick={togglePlay}>
                                <Show
                                    when={audioStatus() === "play"}
                                    fallback={
                                        <SvgIcon
                                            size={41}
                                            name="circle_pause"
                                        />
                                    }
                                >
                                    <SvgIcon size={41} name="circle_play" />
                                </Show>
                            </button>
                            <button
                                class="transparent next"
                                onclick={() => action("next")}
                                disabled={changingMedia()}
                            >
                                <SvgIcon name="circle_next" />
                            </button>
                            <button class="transparent" onClick={onStop}>
                                <SvgIcon name="circle_stop" />
                            </button>
                        </div>
                        <p class="speed" onclick={onSetSpeed}>
                            {speed()}x
                        </p>
                        <button
                            type="button"
                            class="transparent icon mute"
                            onclick={() => toggleMute()}
                        >
                            <Show
                                when={mute() === true}
                                fallback={<SvgIcon name="volume_up" />}
                            >
                                <SvgIcon name="volume_mute" />
                            </Show>
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => onChangeVolume(e.target.value)}
                        />
                    </div>
                    <div class="track">
                        <div class="duration">
                            <span>{format(actualTime())}</span>
                            <span>{format(total())}</span>
                        </div>
                        <input
                            ref={(el) => (seekRef = el)}
                            type="range"
                            class="audio-controller"
                            min={0}
                            max={100}
                            onmouseenter={() => setHoverSeekBar(true)}
                            onmouseleave={() => setHoverSeekBar(false)}
                            step={0.2}
                            value={cursor()}
                            onChange={(ev) =>
                                updateControlPosition(ev.target.value)
                            }
                        />
                    </div>
                    <div class="theme">
                        <button
                            type="button"
                            class="transparent"
                            onclick={() => toggleLightTheme((prev) => !prev)}
                        >
                            🌓
                        </button>
                    </div>
                </div>
            </Show>
        </>
    );
}