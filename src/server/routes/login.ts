import { Request, Response, NextFunction, Router } from "express";
import bcrypt from 'bcrypt';
import { dbGetUser } from "../db";

export function checkIsAuthenticated (req: Request, res: Response, next: NextFunction) {
    const {originalUrl} = req;
    if (originalUrl.includes('/api/')) {
        console.info('--- here check session');
        if(req.session.user && req.session.authorized) {
            console.info(originalUrl, 'is authorized', req.session.user)
            if (originalUrl.includes('login/getSelf')) {
                const {id, name} = req.session.user;
                res.json({id, name})
            } else {
                next();
            }
            return;
        } else {
            console.error('here 401')
            return res.status(401).json('not authorized');
        }
    } else {
        next(); 
    }
}

const router = Router();

router.post('/', async (req, res) => {
    const {name, pass} = req.body;
    const trimName = name.trim();
    const trimPass = atob(pass).trim();
    const user = dbGetUser(trimName) as {id: number, name: string, pass: string, token: string};
    const isValid = await bcrypt.compare(trimPass, user.pass)
    console.log({isValid, trimName, trimPass, hash: bcrypt.hashSync(trimPass, 10)})
    if (isValid) {
        req.session.user = user;
        req.session.authorized = true;
        console.log('set user auth', {user, authorized: true})
    }
    res.json({success: true, message: 'all good'})
})

export default router;