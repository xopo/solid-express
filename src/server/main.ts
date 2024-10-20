import server from "./server";
import nodeCron from "node-cron";
import ViteExpress from "vite-express";
import { downloadOrphanMedia, mediaCleanUp } from "./cron/backgroundjobs";

//@ts-ignore
import { port } from "../../vite.config.mts";
import { now } from "./helper";

nodeCron.schedule("0 */2 * * * *", () => {
    mediaCleanUp();
    downloadOrphanMedia();
    console.log("[cron job]: ", now());
});

ViteExpress.listen(server, port, () =>
    console.log(`Server is listening on port ${port}...`),
);

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);
