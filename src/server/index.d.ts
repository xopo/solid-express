import express from express;

declare module 'express-session' {
    interface SessionData {
        safeName: string;
        user: User;
        authorized: boolean;
        role: ('admin' | 'user' | 'guest')[];
    }
}

declare global {
    namespace Express {
        interface Request {
            blabla: () => boolean,
            url: string,
        }
    }
}