import { Payload } from "youtube-dl-exec";
import { now } from "../helper";
import { connection } from "./connection";

export type User = {
    id: number;
    name: string;
    pass: string;
}

export type File = {
    id: number;
    media_id: string;
    name: string;
    add_time: string
}

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
}

export type WaitingMedia = {
    id: number;
    media_id: string;
    url: string;
    status: string|null;
    acknowledge: string;
}


const getUsersTable = () => connection<User>('users as u');
const getUserRoleTable = () => connection<Array<'admin'|'user'|'guest'>>('user_role as ur')
const getFilesTable = () => connection<File>('files as f')
const getWaitingTable = () => connection<WaitingMedia>('waiting_media as wm')
const getDescriptionTable = () => connection<Description>('description as d');

export const dbGetUserByName = async (name: string) =>
    getUsersTable()
        .where({name})
        .first()

export const dbGetUserRoles = async (user_id: number) =>
    getUserRoleTable()
        .leftJoin('roles as r','ur.role_id', 'r.id')
        .where<Array<{name: 'admin'|'user'}>>('ur.user_id', user_id)
        .then(result => result.map(r => r.name))

export const dbCheckFileExists =  async (media_id: string) => getFilesTable()
        .where('f.media_id', media_id)
        .leftJoin<Description>('description as d', 'd.media_id', 'f.media_id')
        .first();


/** Waiting Media */
export const dbCheckWaitingMedia = async (media_id: string, url: string) =>  getWaitingTable()
    .where({media_id}) 
    .orWhere({url})
    .first();

export const dbInsertWaitingMedia = async (media_id: string, url: string) =>  getWaitingTable()
    .insert({media_id, url})

export const dbGetWaitingMedia = async (limit = 100) =>
    getWaitingTable()
        .select('wm.media_id', 'wm.url as waiting_url', 'wm.status', 'wm.acknowledge', 'f.name', 'f.add_time', 'd.*')
        .leftJoin('files as f', 'f.media_id', 'wm.media_id')
        .leftJoin('description as d', 'd.media_id', 'wm.media_id')
        .limit(limit)


export const dbGetFirstWaitingMedia = async () => getWaitingTable()
    .select<WaitingMedia & {name: string}>('wm.id', 'wm.url', 'wm.media_id', 'f.name')
    .leftJoin('files as f', 'f.media_id', 'wm.media_id')
    .orderBy('wm.id', 'asc')
    .where('status', 'waiting')
    .first();

export const dbGetDownloadingMedia = async () => getWaitingTable()
    .orderBy('id', 'asc')
    .where('status', 'downloading')
    .first();

export const dbGetUnAcknowledged = () => getWaitingTable()
    .where('acknowledge', '0')
    .first();

export const dbSetAcknowledged = () => getWaitingTable()
    .where('acknowledge', '0')
    .update('acknowledge', '1');

export const dbRemoveAcknowledge = () => getWaitingTable()
    .where('acknowledge', '1')
    .delete();

export const dbGetNewWaitingMedia = async (limit =20) => getWaitingTable()
    .where('status', null)
    .limit(limit);

type Status = 'download' | 'waiting' | 'details' | 'ready'| 'done'| null;
export const dbUpdateWaitingMediaStatus = async (id: number, status: Status) => {
    await getWaitingTable()
        .where({id})
        .update({status, acknowledge: '0'})
}

export const dbGetCompleteMedia = async () => getWaitingTable().where({status: 'done'}).first();

export const dbRemoveCompletedMedia = async () => getWaitingTable().where({status: 'done'}).delete();

export const dbGetWaitingByMediaId = async (media_id: string) => {
    return  await getWaitingTable()
        .select<File>('wm.id' , 'f.name')
        .where('wm.media_id', media_id)
        .andWhere({status:'download'})
        .leftJoin('files as f', 'f.media_id', 'wm.media_id')
        .first();
}

// FILES Table
export const dbFileExists = async (media_id: string) => {
    return getFilesTable().where({media_id}).first();
}

export const dbAddNewFile = async (media_id: string, name: string) => {
    return getFilesTable().insert({
        name,
        media_id,
        add_time: now()
    });
}



// Description Table
export const descriptionInDb = (media_id: string) => {
    return getDescriptionTable().where({media_id}).first();
}

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
        upload_url: description.uploader_url
    })
}