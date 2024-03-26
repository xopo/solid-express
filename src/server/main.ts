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

// ViteExpress.config({
//     ignorePaths: /events/,
// })

ViteExpress.listen(app, port, () =>
    console.log(`Server is listening on port ${port}...`),
);

app.get(`api/events`, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const interval = setInterval(() => {
        const message = `data: {"message": "${new Date().toLocaleTimeString()}"}`;
        console.log('- server send', message);
        res.write(message);
    }, 1000);
    
    req.on('close', () => {
        clearInterval(interval); 
    });
});

export default app;