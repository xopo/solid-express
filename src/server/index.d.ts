import express from express;

declare module 'express-session' {
    interface SessionData {
        safeName: string;
        user: User;
        authorized: boolean;
        role: ('admin' | 'user' | 'guest')[];
    }
}

type ErrorResponse = {
    error: true;
    message?: string;
}

type SuccessResponse<T> = {
    error: false;
    data: T;
}

declare global {
    namespace Express {
        interface Request {
            body: {
                url?: string;
                media_id?: string;
            }
        }
        interface Response extends ErrorResponse, SuccessResponse<any> {}
    }
}