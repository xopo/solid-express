import express from "express";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import { config } from 'dotenv';

import session from 'express-session';
import sqlite from "better-sqlite3";
import login, { checkIsAuthenticated } from "./routes/login";
import content from "./routes/content";
const SqliteStore = require("better-sqlite3-session-store")(session);
const db = new sqlite("sessions.db");// , {

export type User = {
    id: number;
    name: string;
    pass: string;
    token: string;
}
declare module 'express-session' {
    interface SessionData {
        user: User;
        authorized: boolean;
    }
}

config()
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw Error('JWT_SECRET is missing in your .env file')
}
const port = 3088;

const production = process.env.NODE_ENV === 'production';
export const base =  production ?  '/video/' : '/';

const app = express();

app.use(
  session({
    store: new SqliteStore({
      client: db,
      expired: {
        clear: true,
        intervalMs: 900000 //ms = 15min
      }
    }),
    secret: JWT_SECRET,
    resave: false,
  })
)

app.use(session({secret: JWT_SECRET}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(`${base}api/login`, login)
app.use(`${base}api/content`, content)

app.use(checkIsAuthenticated);


ViteExpress.listen(app, port, () =>
    console.log(`Server is listening on port ${port}...`),
);
