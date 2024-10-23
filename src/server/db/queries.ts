import { Payload } from "youtube-dl-exec";
import { now } from "../helper";
import { connection } from "./connection";
import { Knex } from "knex";

export type User = {
    id: number;
    name: string;
    pass: string;
};

export type File = {
    id: number;
    media_id: string;
    name: string;
    add_time: string;
    completed: boolean;
};

export type Description = {
    media_id: string;
    title: string;
    categories: string;
    description: string;
    epoch: number;
    thumbnail: string;
    duration_string: string;
    channel_url: string;
    url: string;
    uploader: string;
    upload_date: string;
    upload_url: string;
};

export type WaitingMedia = {
    id: number;
    media_id: string;
    url: string;
    status: string | null;
    acknowledge: string;
    user_id: number;
};

export type WaitingFile = {
    id: number;
    media_id: string;
    name: string;
    url: string;
};

export type TagsUsers = {
    user_id: number;
    tag_id: number;
};

export type TagsMedia = TagsUsers & {
    enabled: number;
    media_id: string;
};

const getUsersTable = () => connection<User>("users as u");
const getUserRoleTable = () =>
    connection<Array<"admin" | "user" | "guest">>("user_role as ur");
const getFilesTable = () => connection<File>("files as f");
const getWaitingTable = () => connection<WaitingMedia>("waiting_media as wm");
const getDescriptionTable = () => connection<Description>("description as d");
const getUserMediaTable = () => connection("user_media as um");
const getTagsTable = () =>
    connection<{ id: number; name: string }>("tags as t");
const getTagsUsersTable = () => connection<TagsUsers>("tags_users as ti");
const getTagsMediaTable = () => connection<TagsMedia>("tags_media as tm");

export const dbGetUserByName = async (name: string) =>
    getUsersTable().where({ name }).first();

export const dbGetUserRoles = async (user_id: number) =>
    getUserRoleTable()
        .leftJoin("roles as r", "ur.role_id", "r.id")
        .where<Array<{ name: "admin" | "user" }>>("ur.user_id", user_id)
        .then((result) => result.map((r) => r.name));

export const dbCheckFileExists = async (media_id: string, url: string) =>
    getFilesTable()
        .where("f.media_id", media_id)
        .orWhere("d.url", url)
        .leftJoin<Description>("description as d", "d.media_id", "f.media_id")
        .first();

/** Waiting Media */
export const dbCheckWaitingMedia = async (media_id: string, url: string) =>
    getWaitingTable().where({ media_id }).orWhere({ url }).first();

export const dbInsertNewMedia = async (
    media_id: string,
    url: string,
    user_id: number,
) => getWaitingTable().insert({ media_id, url, user_id });

export const dbGetWaitingMedia = async (user_id: number, limit = 100) =>
    getWaitingTable()
        .select(
            "wm.media_id",
            "wm.url as waiting_url",
            "wm.status",
            "wm.acknowledge",
            "f.name",
            "f.add_time",
            "d.title",
            "d.thumbnail",
            "d.description",
            "d.epoch",
            "d.duration_string",
            "d.channel_url",
            "d.uploader",
            "d.upload_date",
            "d.upload_url",
        )
        .leftJoin("files as f", "f.media_id", "wm.media_id")
        .leftJoin("description as d", "d.media_id", "wm.media_id")
        .where("wm.user_id", user_id)
        .limit(limit);

export const dbRemoveWaitingMedia = async (media_id: string) => {
    return getWaitingTable().where("media_id", media_id).delete();
};

export const dbUpdateRetryCount = async (media_id: string, retry: number) =>
    getWaitingTable()
        .where("media_id", media_id)
        .update("retry", retry + 1);

export const dbGetFirstWaitingMedia = async () =>
    getWaitingTable()
        .select<
            WaitingMedia & { name: string; add_time: string; retry: number }
        >("wm.id", "wm.url", "wm.media_id", "f.name", "f.add_time", "wm.retry", "um.user_id")
        .leftJoin("files as f", "f.media_id", "wm.media_id")
        .leftJoin("user_media as um", "f.id", "um.file_id")
        .orderBy("wm.id", "asc")
        .where("status", "waiting")
        .orWhere("status", "details")
        .orWhereNull("status")
        .first();

export const dbGetDownloadingMedia = async (status = "download") =>
    getWaitingTable().orderBy("id", "asc").where({ status }).first();

export const dbGetUnAcknowledged = (user_id: number) =>
    getWaitingTable().where({ user_id }).andWhere("acknowledge", "0").first();

export const dbSetAcknowledged = () =>
    getWaitingTable().where("acknowledge", "0").update("acknowledge", "1");

export const dbRemoveAcknowledge = () =>
    getWaitingTable().where("acknowledge", "1").delete();

export const dbGetNewWaitingMedia = async (limit = 20) =>
    getWaitingTable().where("status", null).limit(limit);

export const dbGetToDeleteMedia = async (user_id: number, status = "delete") =>
    getWaitingTable().where({ user_id }).where({ status });

export const dbRemoveDeletableFromDB = async () =>
    getWaitingTable().where("status", "delete").delete();

type Status =
    | "download"
    | "waiting"
    | "details"
    | "ready"
    | "done"
    | "live"
    | "delete"
    | "dummy"
    | null; // dummy = file exists, downloaded

export const dbUpdateWaitingMediaStatus = async (
    id: number,
    status: Status,
) => {
    await getWaitingTable().where({ id }).update({ status, acknowledge: "0" });
};

export const dbUpdateWaitingMediaId = async (id: number, media_id: string) => {
    await getWaitingTable().where({ id }).update({ media_id });
};

export const dbUpdateWaitingMediaStatusByMediaId = async (
    media_id: string,
    status: Status,
) => {
    await getWaitingTable()
        .where({ media_id })
        .update({ status, acknowledge: "0" });
};

export const dbGetCompleteMedia = async (user_id: number) =>
    getWaitingTable().where({ user_id }).andWhere({ status: "done" }).first();

export const dbRemoveCompletedMedia = async () =>
    getWaitingTable().where({ status: "done" }).delete();

export const dbSetDummyAsDone = async (id: number) =>
    getWaitingTable().where({ id }).update({ status: "done" });

export const dbGetWaitingByMediaId = async (media_id: string) => {
    return await getWaitingTable()
        .select<WaitingFile>("wm.id", "f.name", "wm.media_id")
        .where("wm.media_id", media_id)
        .whereIn("status", ["details", "new", "download"])
        .leftJoin("files as f", "f.media_id", "wm.media_id")
        .first();
};

export const dbCreateDummyWaitingMedia = async (
    media_id: string,
    url: string,
    status: Status,
) => getWaitingTable().insert({ media_id, url, status });

export const dbGetDummyMedia = async (user_id: number, status = "dummy") =>
    getWaitingTable().where({ user_id }).andWhere({ status }).first();

// FILES Table
export const dbFileExists = async (media_id: string) =>
    getFilesTable().where({ media_id }).first();

export const dbAddNewFile = async (media_id: string, name: string) =>
    getFilesTable().insert({
        name,
        media_id,
        add_time: now(),
        completed: false,
    });

export const dbRemoveFileByMediaId = async (media_id: string) => {
    return getFilesTable()
        .where({ media_id })
        .delete()
        .catch((e) => console.error("-- remove file from table", e));
};

// Description Table
export const descriptionInDb = (media_id: string) => {
    return getDescriptionTable().where({ media_id }).first();
};

export const dbAddNewDescription = (description: Payload) => {
    return getDescriptionTable().insert({
        media_id: description.id,
        title: description.title,
        categories: JSON.stringify(description.categories),
        description: description.description,
        epoch: description.epoch,
        thumbnail: description.thumbnail,
        duration_string: description.duration_string,
        channel_url: description.channel_url,
        url: description.original_url,
        uploader: description.uploader,
        upload_date: description.upload_date,
        upload_url: description.uploader_url,
    });
};

export const dbRemoveDetailsByMediaId = (media_id: string) => {
    return getDescriptionTable().where({ media_id }).delete();
};

export const dbGetDetailsByMediaId = (media_id: string) => {
    return getDescriptionTable().where({ media_id }).first();
};

// GET Content

export async function dbGetUserContent(user_id: number, tags?: string) {
    return await getFilesTable()
        .select("f.name", "f.add_time", "d.*")
        .leftJoin("user_media as um", "um.file_id", "f.id")
        .leftJoin("description as d", "d.media_id", "f.media_id")
        .where("um.user_id", user_id)
        .andWhere("f.completed", true)
        .modify(function (QueryBuilder) {
            if (tags?.length) {
                const listOfTags = tags.split(" ");
                for (let tag of listOfTags) {
                    QueryBuilder.where("f.name", "like", `%${tag}%`);
                }
            }
        })
        .orderBy("f.add_time", "desc");
}

export async function dbGetUserContentByTags(user_id: number, tags?: string) {
    return await getFilesTable()
        .select(
            "f.name",
            "f.add_time",
            "d.*",
            connection.raw(
                "group_concat(case when tm.enabled = 1 then t.name else '' end) as tags",
            ),
        )
        .leftJoin("user_media as um", "um.file_id", "f.id")
        .leftJoin("description as d", "d.media_id", "f.media_id")
        .leftJoin("tags_media as tm", "tm.media_id", "f.media_id")
        .leftJoin("tags as t", "t.id", "tm.tag_id")
        .where("um.user_id", user_id)
        .andWhere("f.completed", "1")
        .modify(function (QueryBuilder) {
            if (tags?.length) {
                // const listOfTags = tags.split(" ");
                for (let tag of tags) {
                    //listOfTags) {
                    QueryBuilder.where("f.name", "like", `%${tag}%`)
                        .orWhere("d.title", "like", `%${tag}%`)
                        .orWhere("d.description", "like", `%${tag}%`)
                        .orWhere("t.name", "like", "%keto%")
                        .orWhere("d.categories", "like", `%${tag}%`);
                    // .orWhere("d.uploader", "like", `%${tag}%`);
                }
            }
        })
        .orderBy("f.add_time", "desc")
        .orderByRaw("count(case when tm.enabled = 1 then 1 else 0 end) desc")
        .groupBy("f.id");
}

export async function dbUpdateFileStatus(media_id: string, completed: boolean) {
    return getFilesTable().update({ completed }).where({ media_id });
}

export async function dbSetMediaTags(
    media_id: string,
    user_id: number,
    tags: string[],
) {
    console.log({ tags }, "---**");
    const tagIds = await getTagsTable().select("id").whereIn("name", tags);
    console.log("-****-", tagIds);
    const insertTags = tagIds.map((tag) =>
        getTagsMediaTable().insert({ media_id, user_id, tag_id: tag.id }),
    );
    await Promise.all(insertTags).catch((er) => {
        console.log("promise all insert tags error", er);
        throw new Error(er);
    });
}

// user media
export async function dbAddMediaToUser(file_id: number, user_id: number) {
    return getUserMediaTable()
        .where({ file_id, user_id })
        .first()
        .then((result) => {
            if (!result) {
                return getUserMediaTable().insert({ file_id, user_id });
            }
        });
}

export async function dbCountUsersWithMedia(media_id: string) {
    return getUserMediaTable()
        .count("* as cnt")
        .from(function (this: Knex.QueryBuilder) {
            this.select("user_id")
                .from("files as f")
                .leftJoin("user_media as um", "um.file_id", "f.id")
                .where("f.media_id", media_id)
                .as("t");
        })
        .then((result) => {
            return Number(result[0].cnt);
        });
}

export async function dbRemoveMediaFromUser(media_id: string, user_id: number) {
    return getUserMediaTable()
        .where("file_id", function (this: Knex.QueryBuilder) {
            this.select("id").from("files").where({ media_id });
        })
        .andWhere({ user_id })
        .delete()
        .catch((e) => console.error("-- remove media from table", e));
}

export async function dbAddLabelIfNotExists(name: string) {
    await getTagsTable()
        .where({ name })
        .then(async (result) => {
            console.log("result", result);
            if (!result.length) {
                console.log("-- add new tag");
                await getTagsTable().insert({ name });
            }
        });
}

export async function dbGetUsersTags(user_id: number) {
    console.log("*** userid: ", user_id);
    return getTagsUsersTable()
        .select("ti.tag_id as id", "t.name")
        .leftJoin("tags as t", "t.id", "ti.tag_id")
        .where("ti.user_id", user_id);
}

export async function dbAddLabel2UserIfNotExist(name: string, user_id: number) {
    const tag = await getTagsTable().where({ name }).first();
    console.log("tag", tag);
    await getTagsUsersTable()
        .where({ tag_id: tag?.id, user_id })
        .then(async (result) => {
            if (!result.length && tag?.id) {
                await getTagsUsersTable().insert({ tag_id: tag.id, user_id });
            }
        });
}

export async function dbToggleLabelOnMedia(
    tag_id: number,
    media_id: string,
    user_id: number,
) {
    console.log("-------- ", { tag_id, media_id, user_id });
    await getTagsMediaTable()
        .where({ tag_id, media_id, user_id })
        .first()
        .then(async (response) => {
            console.log("**", { response, tag_id, media_id, user_id });
            if (!response) {
                await connection;
                await getTagsMediaTable()
                    .insert({
                        tag_id: tag_id,
                        media_id: media_id,
                        user_id: user_id,
                    })
                    .catch((er) => {
                        console.error("error add tag ", er);
                        throw new Error(er);
                    });
            } else {
                await getTagsMediaTable()
                    .where({ tag_id, user_id, media_id })
                    .update({
                        ...response,
                        enabled: response.enabled === 1 ? 0 : 1,
                    });
            }
        });
}

export async function dbGetMediaTagsForUser(media_id: string, user_id: number) {
    return getTagsMediaTable()
        .select("tag_id as id", "enabled")
        .where({ user_id })
        .andWhere({ media_id });
}
