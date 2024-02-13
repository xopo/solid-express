import { Request, Response, NextFunction, Router } from "express";
import bcrypt from 'bcrypt';
import { dbAddUser, dbCheckUserExists, dbGetUser, dbGetUsers } from "../db";

export function checkIsAuthenticated (req: Request, res: Response, next: NextFunction) {
    const {originalUrl} = req;
    if (originalUrl.includes('/api/')) {
        if(req.session.user && req.session.authorized) {
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
    console.log('--- here is post')
    const {name, pass} = req.body;
    console.log('login post', {name, pass})
    const trimName = name.trim();
    const trimPass = atob(pass).trim();
    if (trimName.length < 4) {
        res.status(400).json({error: true, message: 'nume are min 4 caractere'})
        return;
    }
    if (trimPass.length < 4) {
        res.status(400).json({error: true, message: 'pass are min 4 caractere'})
        return;
    }
    const user = dbGetUser(trimName) as {id: number, name: string, pass: string, token: string};
    console.log('-- post user', user)
    if (!user) {
        req.session.user = undefined;
        req.session.authorized = false;
        req.session.role = undefined;
        res.status(401).json({error: true, message: 'combinatia nume parola gresite'})
        return;
    }
    console.log('---', await bcrypt.hash(user.pass, 10))
    const isValid = await bcrypt.compare(trimPass, user.pass)
    console.log('--[, ', {isValid})
    if (isValid) {
        req.session.safeName = `${user.id}-${user.name}`;
        req.session.user = user;
        req.session.authorized = true;
        req.session.role = user.id === 1 && user.name === 'daniel' ? 'admin' : 'regular';
        console.log('set user auth', {user, authorized: true})
        res.json({success: true, message: 'all good'})
        return;
    }
    res.status(401).json({error: true, message: 'combinatia nume parola gresite'})
})

router.post('/register', async (req, res) => {
    const {name, pass} = req.body;
    const trimName = name.trim();
    const trimPass = atob(pass).trim();
    try {
        const result = dbAddUser({name: trimName, pass: bcrypt.hashSync(trimPass, 10)})
        res.json({success: true, message: result})
    } catch (er) {
        if (er instanceof Error) {
            res.status(400).json(er.message)
        }
    }
})

router.get('/users', async (req, res) => {
    if (req.session.role === 'admin') {
        const users = dbGetUsers();
        res.json({success: true, users})
    } else {
        res.json({'error': 'redirect'})
    }
})

router.post('/logout', async (req, res) => {
    req.session.safeName = '';
    req.session.authorized = false;
    req.session.user = undefined;
    res.clearCookie('connect.sid')
    res.status(401).send();
})

router.get<any, any, any, any, {name: string}>('/checkUser', async (req, res) => {
    const {name} = req.query;
    if (name.trim().length < 4) {
        res.json({error: 'marimea minima 4 caractere'})
    }
    const result = dbCheckUserExists(name.trim())
    if (result?.id) {
        res.json({error: 'exista un utilizator cu acest nume'})
        return;
    }
    res.json({success: true});// , users})
})

router.get('/getSelf', (req, res) => {
    const {id, name} = req.session.user!;
    const safeName = `${id}-${name}`;
    res.json({id, name, safeName})
})

router.post<any, any, any, {user: {name: string, pass: string}}>('/newUser', async (req, res) => {
    const { user: {name, pass} } = req.body;
    const data = dbAddUser({name, pass: bcrypt.hashSync(pass, 10)});
    res.json({success: true, data})
})
export default router;