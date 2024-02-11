import express from "express";
import bodyParser from "body-parser";

import session from 'express-session';
import sqlite from "better-sqlite3";

import login, { checkIsAuthenticated } from "./routes/login";
import content from "./routes/content";

const production = process.env.NODE_ENV === 'production';
export const base =  production ?  '/pingpong/' : '/';

//@ts-ignore
import Store from "better-sqlite3-session-store";
import { JWT_SECRET } from "./main";
const SqliteStore =  Store(session);

const db = new sqlite("sessions.db");// , {

export default function getServer() {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(
        session({
            store: new SqliteStore({
            client: db,
            expired: {
                clear: true,
                intervalMs: 900000 //ms = 15min
            }
            }),
            secret: JWT_SECRET!,
        })
        )

        app.use(session({secret: JWT_SECRET!}));
    app.use(`${base}api/login`, login)

    app.use(checkIsAuthenticated);
    app.use(`${base}api/content`, content)

    return app;
}