import express from "express";
import bodyParser from "body-parser";
import session from 'express-session';
import sqlite from "better-sqlite3";
// import compression from 'compression';
import content from "./routes/content";
import login from './routes/login';
import stats from "./routes/stats";
import { config } from 'dotenv';
config()
const production = process.env.NODE_ENV === 'production';
export const base =  production ?  '/pingpong/' : '/';

//@ts-ignore
import Store from "better-sqlite3-session-store";
// import BASE_URL from "../client/const";

export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw Error('JWT_SECRET is missing in your .env file')
}

const SqliteStore =  Store(session);

const db = new sqlite("sessions.db");// , {

export default function getServer() {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // app.use(compression());
    app.use(
        session({
            resave: true,
            saveUninitialized: false,
            store: new SqliteStore({
            client: db,
            expired: {
                clear: true,
                intervalMs: 900000 //ms = 15min
            },
        }),
        secret: JWT_SECRET!,
    }))

    // app.use(session({secret: JWT_SECRET!}));
    
    app.use(`${base}api/login`, login)
    
    app.use(`${base}api/content`, content)
    
    app.use(`${base}api/stats`, stats);
    
    return app;
}