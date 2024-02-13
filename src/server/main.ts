import ViteExpress from "vite-express";

import createServer from "./server";

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

const port = 3088;

const app = createServer();

ViteExpress.listen(app, port, () =>
    console.log(`Server is listening on port ${port}...`),
);

export default app;