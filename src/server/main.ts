import server from './server'
import nodeCron from 'node-cron';
import ViteExpress from "vite-express";

import { port } from '../../vite.config.mts';
import { grabMedia, grabWaiting } from './grabber/grab';

nodeCron.schedule('0 * * * * *', () => {
    grabWaiting();
    grabMedia();
})

ViteExpress.listen(server, port, () =>
    console.log(`Server is listening on port ${port}...`),
);
