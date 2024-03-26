import { Request, Response, NextFunction, Router } from "express";
import bcrypt from 'bcrypt';
import { dbAddUser, dbChangeUserPassword, dbCheckUserExists, dbGetUser, dbGetUsers, dbResetPassword } from "../db/db";
import validate from "../middleware/validate";
import { getCheckUser, loginSchema } from "../../common/validation/schema";


export function checkIsAuthenticated (req: Request, res: Response, next: NextFunction) {
    const {originalUrl} = req;
    if (originalUrl.includes('/api/')) {
        if(req.session.user && req.session.authorized) {
            return next();
        } else {
            return res.status(401).json('not authorized');
        }
    } else {
        console.info('next 1')
        next();
    }
}

const router = Router();

router.post('/', validate(loginSchema), async (req: Request, res: Response) => {
    const {name, pass} = req.body;
    const trimName = name.trim();
    const trimPass = atob(pass).trim();
    const user = await dbGetUser(trimName);
    if (!user) {
        req.session.user = undefined;
        req.session.authorized = false;
        req.session.role = undefined;
        res.status(401).json({error: true, message: 'combinatia nume parola gresite'})
        return;
    }
    const isValid = await bcrypt.compare(trimPass, user.pass)
    if (isValid) {
        req.session.safeName = `${user.id}-${user.name}`;
        req.session.user = user;
        req.session.authorized = true;
        req.session.role = user.id === 1 && user.name === 'daniel' ? 'admin' : 'regular';
        res.json({success: true, message: 'all good'})
        return;
    }
    res.status(401).json({error: true, message: 'combinatia nume parola gresite'})
})

router.post<any, any, any, {name: string, pass: string, id: number}>
('/register',validate(loginSchema), async (req, res) => {
    const {name, pass, id} = req.body;
    const trimName = name.trim();
    const trimPass = atob(pass).trim();
    try {
        if (!id) {
            const result = await dbAddUser({name: trimName, pass: bcrypt.hashSync(trimPass, 10)})
            res.json({success: true, message: result})
            return;
        }
        await dbChangeUserPassword(id, bcrypt.hashSync(trimPass, 10));
        res.json({success: true})
    } catch (er) {
        if (er instanceof Error) {
            res.status(400).json(er.message)
        }
    }
})

router.post<any, any, any, {id: number}>
('/resetPassword', checkIsAuthenticated, async (req, res) => {
    const {id} = req.body;
    if (req.session.role === 'admin') {
        const result = await dbResetPassword(id);
        res.json({success: true, result})
    } else {
        res.json({'error': 'redirect'})
    }

})

router.get('/users', checkIsAuthenticated,  async (req, res) => {
    if (req.session.role === 'admin') {
        const users = await dbGetUsers();
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

router.get<any, any, any, any, {name: string}>
('/checkUser', validate(getCheckUser), async (req, res) => {
    const {name} = req.query;
    const result = await dbCheckUserExists(name.trim())
    if (result?.id && result?.reset_password === 0) {
        res.status(400).json({error: 'exista un utilizator cu acest nume'})
        return;
    }
    const response = {success: true, data: { reset: result.reset_password === 1, id: result.id }};
    res.json(response);
})

router.get('/getSelf', checkIsAuthenticated, (req, res) => {
    const {id, name} = req.session.user!;
    const safeName = `${id}-${name}`;
    res.json({id, name, safeName})
})

router.post<any, any, any, {user: {name: string, pass: string}}>
('/newUser',checkIsAuthenticated, validate(loginSchema), async (req, res) => {
    const { user: {name, pass} } = req.body;
    const data = await dbAddUser({name, pass: bcrypt.hashSync(pass, 10)});
    res.json({success: true, data})
})
export default router;