import { useMp3Context } from "../../../context/appContext";
import { HeadScrollList } from "../../common/scroll-list/ScrollList";
import "./head.scss";

export default function Head() {
    const { setTags } = useMp3Context();
    let iRef: HTMLInputElement;
    let myTime: number;
    const updateTag = () => {
        if (myTime) clearTimeout(myTime);
        const clean = iRef.value.replace(/[^a-zA-Z\s0-9]/gi, "");
        myTime = window.setTimeout(() => {
            setTags(clean);
            iRef.value = clean;
        }, 500);
    };
    return (
        <div class="head">
            <HeadScrollList />
            <nav>
                <input
                    ref={(e) => (iRef = e)}
                    type="search"
                    onkeyup={updateTag}
                    placeholder="search"
                ></input>
            </nav>
        </div>
    );
}
