import express from "express";
import bodyParser from "body-parser";
import loginRoute from "./routes/login";
import sqlite from "better-sqlite3";
import session from 'express-session';

//@ts-ignore
import Store from "better-sqlite3-session-store";
import { config } from 'dotenv';
import contentRoute from "./routes/content";
import serverPushEvents from "./routes/serverPushEvents";
import { STATIC_FILES } from "./routes/apihelper";
config()

const production = process.env.NODE_ENV === 'production';
export const base =  production ?  '/mp3/' : '/';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

export const JWT_SECRET = process.env.JWT_SECRET;

const SqliteStore =  Store(session);

const db = new sqlite("sessions.db")

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

// app.use(session({
//     secret: JWT_SECRET!,
//     resave: true,
//     saveUninitialized: false,
// }));
console.log({base, STATIC_FILES})
app.use(`${base}media/`, express.static(STATIC_FILES))

// app.use(`${base}api/content`, content);

app.use(`${base}api/login`, loginRoute );
app.use(`${base}api/content`, contentRoute );
app.use(`${base}api/newMedia`, serverPushEvents);

app.get("/hello", (_, res) => {
    res.json("Hello Vite + React + TypeScript!");
});

export default app;