import { createSignal } from "solid-js";
import { useMp3Context } from "../../../context/appContext";
import SvgIcon from "../../common/SvgIcon";
import { HeadScrollList } from "../../common/scroll-list/ScrollList";
import "./head.scss";

export default function Head() {
    const { onSearch } = useMp3Context();
    const [show, setShow] = createSignal(false);
    const toggleShow = () => {
        if (!show()) {
            setTimeout(() => {
                iRef.focus();
            }, 0);
        }
        setShow(!show());
    };
    let iRef: HTMLInputElement;
    let myTime: number;
    const updateTag = () => {
        if (myTime) clearTimeout(myTime);
        const clean = iRef.value.replace(/[^a-zA-Z\s0-9]/gi, "");
        myTime = window.setTimeout(() => {
            onSearch(clean);
            iRef.value = clean;
        }, 500);
    };
    return (
        <div class="head">
            <HeadScrollList />
            <nav>
                <input
                    classList={{ hidden: !show() }}
                    ref={(e) => (iRef = e)}
                    type="search"
                    onkeyup={updateTag}
                    placeholder="search"
                />
                <div onclick={() => toggleShow()}>
                    <SvgIcon name="search" />
                </div>
            </nav>
        </div>
    );
}
