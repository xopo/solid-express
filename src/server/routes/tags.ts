import { Router } from "express";
import { isAuthorized } from "./auth";
import validate from "./validate";
import { tagsSchema, tagsToggleSchema } from "../../common/validate/schema";
import lazyCatch from "../lib/lazyCatch";
import {
    dbAddLabel2UserIfNotExist,
    dbAddLabelIfNotExists,
    dbGetMediaTagsForUser,
    dbGetUsersTags,
    dbToggleLabelOnMedia,
} from "../db/queries";

const tagsRoute = Router();

tagsRoute.get(
    "/",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const { user } = req.session;
        res.json({ data: await dbGetUsersTags(user.id) });
    }),
);

tagsRoute.get<{ id: string }, any, any, any>(
    "/media/:id",
    isAuthorized,
    lazyCatch(async (req, res) => {
        const { user } = req.session;
        const { id } = req.params;
        const sanitizedId = atob(id).replace(/[^a-zA-Z\s0-9_]/gi, "");
        res.json({ data: await dbGetMediaTagsForUser(sanitizedId, user.id) });
    }),
);

tagsRoute.post<any, any, any, { label: string }>(
    "/add",
    isAuthorized,
    validate(tagsSchema),
    lazyCatch(async (req, res) => {
        const { label } = req.body;
        const { user } = req.session;
        await dbAddLabelIfNotExists(label);
        await dbAddLabel2UserIfNotExist(label, user.id);
        res.json({ success: true });
    }),
);

tagsRoute.post(
    "/media/toggle",
    isAuthorized,
    validate(tagsToggleSchema),
    lazyCatch(async (req, res) => {
        const { label_id, media_id } = req.body;
        const { user } = req.session;
        await dbToggleLabelOnMedia(label_id, media_id, user.id);
        res.json({ success: true });
    }),
);

export default tagsRoute;