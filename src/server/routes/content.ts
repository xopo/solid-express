import {Router} from 'express';
import { isAuthorized } from './auth';
import { dbCheckFileExists, dbCheckWaitingMedia, dbGetDetailsByMediaId, dbGetUserContent, dbGetUserRoles,
    dbGetWaitingMedia, dbInsertWaitingMedia, dbRemoveDetailsByMediaId, dbRemoveFileByMediaId,
    dbUpdateWaitingMediaStatusByMediaId } from '../db/queries';
import validate from './validate';
import { uriSchema } from '../../common/validate/schema';
import { extractMediaMetaFromUrl } from './mediaHelper';
import { grabWaiting, removeFilesIfExists } from '../grabber/grab';

const contentRoute = Router();

contentRoute.get('/', isAuthorized, async (req, res) => {
    const content = await dbGetUserContent(req.session.user.id);
    res.json({success: true, data: content})
})

contentRoute.get('/roles', isAuthorized, async (req, res) => {
    const {user} = req.session;
    const roles = await dbGetUserRoles(user.id)
    res.json({success: true, data: roles})
})

contentRoute.post<any, any, any, {url: string}>
('/add', isAuthorized, validate(uriSchema), async (req, res) => {
    const {url} = req.body;
    const {id, type} = extractMediaMetaFromUrl(url);
    if (!id || !type) {
        res.status(400).json({error: 'cannot get file data'})
    }
    const fileInDb = await dbCheckFileExists(id);
    if (!fileInDb) {
        const fileWaiting = await dbCheckWaitingMedia(id, url);
        if (!fileWaiting) {
            const result = await dbInsertWaitingMedia(id, url);
            if (result) {
                grabWaiting();
            }
        }
        const status = fileWaiting && fileWaiting.status
            ? fileWaiting.status
            : 'new'
        res.json({success: true, data: { waiting: {id, url, status}}})
        return;
    }
    res.json({success: true, data: fileInDb})
})

contentRoute.post('/getWaiting', isAuthorized, async (_req, res) => {
    const data = await dbGetWaitingMedia();
    // console.log({data})
    res.json({success: true, data})
})

contentRoute.post<any, any, any, {media_id: string}>
('/delete', isAuthorized, async(req, res) => {
    const {media_id} = req.body;
    await dbUpdateWaitingMediaStatusByMediaId(media_id, 'delete');
    await dbRemoveDetailsByMediaId(media_id);
    await dbRemoveFileByMediaId(media_id)
    await removeFilesIfExists(media_id);

    res.json({success: true})
})

contentRoute.post<any, any, any, {media_id: string, existing: boolean}>
('/reset', isAuthorized, async(req, res) => {
    const {media_id, existing} = req.body;
    if (!existing) {
        await dbUpdateWaitingMediaStatusByMediaId(media_id, null);
    } else {
        const media = await dbGetDetailsByMediaId(media_id);
        await dbRemoveDetailsByMediaId(media_id);
        await dbRemoveFileByMediaId(media_id)
        await removeFilesIfExists(media_id);
        if (media) {
            await dbInsertWaitingMedia(media_id, media.url);
        }
    }
    res.json({success: true})
})

export default contentRoute;


