import {Router} from 'express';
import { isAuthorized } from './auth';
import { dbCheckFileExists, dbCheckWaitingMedia, dbGetUserRoles, dbGetWaitingMedia, dbInsertWaitingMedia } from '../db/queries';
import validate from './validate';
import { uriSchema } from '../../common/validate/schema';
import { extractMediaMetaFromUrl } from './mediaHelper';
import { grabWaiting } from '../grabber/grab';

const contentRoute = Router();

contentRoute.get('/', isAuthorized, (_req, res) => {
    console.log('this is content route get /') 
    res.json({success: true, data: JSON.stringify([])})
})

contentRoute.get('/roles', isAuthorized, async (req, res) => {
    const {user} = req.session;
    const roles = await dbGetUserRoles(user.id)
    res.json({success: true, data: roles})
})

contentRoute.post('/add', isAuthorized, validate(uriSchema), async (req, res) => {
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
            console.log('insert stuff result', result)
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
    res.json({success: true, data: await dbGetWaitingMedia()})
})

export default contentRoute;


