import {Router} from 'express';
import { isAuthorized } from './auth';
import { dbGetUserRoles } from '../db/queries';

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

export default contentRoute;