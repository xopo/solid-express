import { Router, Response, Request } from "express";
import validate from "./validate";
import bcrypt from 'bcrypt';

import { loginSchema } from "../../common/validate/schema";

import { dbGetUserByName, dbGetUserRoles } from "../db/queries";

export type LoginBody = { name: string, pass: string };

const loginRoute = Router();

loginRoute.post< any, any, any, LoginBody>(
'/', validate(loginSchema), async (req: Request, res: Response) => {
    const {name, pass } = req.body;
    if (!name || !pass) {
        return res.status(400).json({error: 'bad user/pass'})
    }
    const user = await dbGetUserByName(name);
    const valid = await bcrypt.compare(atob(pass).trim(), user?.pass)
    if (!user || !valid) {
        req.session.user = undefined;
        req.session.authorized = false;
        req.session.role = undefined;
        return res.status(400).json({error: 'bad user/pass'})
    }
    // console.log({user})
    req.session.user = {id: user.id, name: user.name};
    req.session.authorized = true;
    req.session.role =  await dbGetUserRoles(user.id)
    res.json({success: 'Good Job'})
})

export default loginRoute;