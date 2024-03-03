import server from './server'

import ViteExpress from "vite-express";

import { port } from '../../vite.config.mts';


ViteExpress.listen(server, port, () =>
    console.log(`Server is listening on port ${port}...`),
);
