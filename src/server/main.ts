import server from './server'
import nodeCron from 'node-cron';
import ViteExpress from "vite-express";

import { port } from '../../vite.config.mts';
import { grabMedia, grabWaiting } from './grabber/grab';
import { now } from './helper';

nodeCron.schedule('0,30 * * * * *', () => {
    console.log('[cron job]: ', now());
    grabWaiting();
    grabMedia();
})

ViteExpress.listen(server, port, () =>
    console.log(`Server is listening on port ${port}...`),
);
