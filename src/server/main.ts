
import ViteExpress from "vite-express";
import { config } from 'dotenv';

import getServer from "./server";




export type User = {
    id: number;
    name: string;
    pass: string;
    token: string;
}
declare module 'express-session' { 
    interface SessionData {
        safeName: string;
        user: User;
        authorized: boolean;
        role: 'admin' | 'regular';
    }
}

config()

export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw Error('JWT_SECRET is missing in your .env file')
}
const port = 3088;

const app = getServer();



ViteExpress.listen(app, port, () =>
    console.log(`Server is listening on port ${port}...`),
);

export default app;