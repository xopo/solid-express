import { Router } from "express";
import { isAuthorized } from "./auth";
import {
    getTagIdsFromName,
    dbAddMediaToUser,
    dbCheckFileExists,
    dbCountUsersWithMedia,
    dbCreateDummyWaitingMedia,
    dbGetDetailsByMediaId,
    dbGetUserContent,
    dbGetUserContentByTags,
    dbGetUserRoles,
    dbGetWaitingMedia,
    dbInsertNewMedia,
    dbRemoveDetailsByMediaId,
    dbRemoveFileByMediaId,
    dbRemoveMediaFromUser,
    dbUpdateWaitingMediaStatusByMediaId,
} from "../db/queries";
import validate from "./validate";
import { uriSchema } from "../../common/validate/schema";
import { extractMediaMetaFromUrl } from "./mediaHelper";
import { removeFilesIfExists } from "../grabber/grab";
import { getWorker, terminateWorker } from "../workers";
import eventEmitter, { EventTypes } from "../event";
import lazyCatch from "../lib/lazyCatch";

const contentRoute = Router();

contentRoute.get(
    "/",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const { id } = req.session.user;
        const { page } = req.query;
        const content = id
            ? await dbGetUserContent(
                req.session.user.id,
                parseInt(page as `${number}`, 10),
            )
            : [];
        res.json({ success: true, data: content });
    }),
);

contentRoute.post<any, any, any, { tags: string }>(
    "/",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const { tags } = req.body;
        const { page } = req.query;
        const cleanTags = tags.map((t: string) =>
            t.trim().replace(/[^a-zA-Z\s0-9_-]/gi, ""),
        );
        const { id } = req.session.user;
        const content = id
            ? await dbGetUserContentByTags(
                req.session.user.id,
                cleanTags,
                parseInt((page as `${number}`) || "0"),
            )
            : [];
        res.json({ success: true, data: content });
    }),
);

contentRoute.get(
    "/roles",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const { user } = req.session;
        const roles = await dbGetUserRoles(user.id);
        res.json({ success: true, data: roles });
    }),
);

contentRoute.post<any, any, any, { url: string }>(
    "/add",
    isAuthorized,
    validate(uriSchema),
    lazyCatch(async (req, res) => {
        const { url, tags } = req.body;
        const cleanTags = tags.map((tag: string) =>
            tag.replace(/[^a-z0-9]/gi, ""),
        );
        let tagIds: number[] = [];
        if (cleanTags.length) {
            tagIds = await getTagIdsFromName(tags);
        }
        try {
            const { id, type } = extractMediaMetaFromUrl(url);
            if (!id || !type) {
                res.status(400).json({ error: "cannot get file data" });
                return;
            }
            const fileInDb = await dbCheckFileExists(id, url);
            if (!fileInDb) {
                const result = await dbInsertNewMedia(
                    id,
                    url,
                    req.session.user.id,
                    JSON.stringify(tagIds),
                );

                const response = {
                    success: true,
                    data: { waiting: { id, url, status: "new" } },
                };

                if (!result) {
                    console.log("error adding to db");
                    return res
                        .status(500)
                        .json({ error: true, message: "add to db problem" });
                }

                const worker = getWorker(id, {
                    id: result[0],
                    media_id: id,
                    url,
                    user_id: req.session.user.id,
                    tags: tagIds,
                });

                if (worker) {
                    worker?.on("message", (data: { type: string }) => {
                        console.log("router got data from worker", data);
                        eventEmitter?.emit(EventTypes.WORKER, data);
                    });

                    worker?.on("exit", () => {
                        console.log("Worker exited, make cleanup");
                        worker.removeAllListeners();
                        terminateWorker(id);
                    });

                    response.data.waiting.status = "new";
                } else {
                    response.data.waiting.status = "waiting";
                }
                return res.json(response);
            } else {
                await dbAddMediaToUser(fileInDb.id, req.session.user.id);
                await dbCreateDummyWaitingMedia(
                    fileInDb.media_id,
                    url,
                    "dummy",
                );
            }
            res.json({ success: true, data: fileInDb });
        } catch (e) {
            console.error(e)
            res.status(400).json({
                error:
                    e instanceof Error
                        ? e.message
                        : "Problem with adding new media",
            });
        }
    }),
);

contentRoute.post(
    "/getWaiting",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const data = await dbGetWaitingMedia(req.session.user.id);
        res.json({ success: true, data });
    }),
);

contentRoute.post<any, any, any, { media_id: string }>(
    "/delete",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const { media_id } = req.body;
        if (!media_id) {
            res.status(400).json({ error: "media_id is required" });
        }
        const count = await dbCountUsersWithMedia(media_id);
        await dbRemoveMediaFromUser(media_id, req.session.user.id);
        if (count <= 1) {
            await dbUpdateWaitingMediaStatusByMediaId(media_id, "delete");
            await dbRemoveDetailsByMediaId(media_id);
            await dbRemoveFileByMediaId(media_id);
            await removeFilesIfExists(media_id);
        }
        res.json({ success: true });
    }),
);

contentRoute.post<any, any, any, { media_id: string; existing: boolean }>(
    "/reset",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const { media_id, existing } = req.body;
        if (!existing) {
            await dbUpdateWaitingMediaStatusByMediaId(media_id, null);
        } else {
            const media = await dbGetDetailsByMediaId(media_id);
            await dbRemoveDetailsByMediaId(media_id);
            await dbRemoveFileByMediaId(media_id);
            await removeFilesIfExists(media_id);
            if (media) {
                await dbInsertNewMedia(
                    media_id,
                    media.url,
                    req.session.user.id,
                    "[]",
                );
            }
        }
        res.json({ success: true });
    }),
);

export default contentRoute;