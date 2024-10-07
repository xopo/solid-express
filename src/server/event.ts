import EventEmitter from "node:events";

export type EmitterObject = {
    type: string;
    message: string;
    data: unknown;
};

function singleEventEmitter() {
    let eventEmitter: EventEmitter;
    return () => {
        if (!eventEmitter) {
            eventEmitter = new EventEmitter();
        }
        return eventEmitter;
    };
}

const eventEmitter = singleEventEmitter();

export const EventTypes = {
    WORKER: "worder_event",
};

console.log("_---here make event emitter", { eventEmitter });
export default eventEmitter();
