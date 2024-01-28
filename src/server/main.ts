import express from "express";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
// import content from "./routes/content.js";
// import { mediaLocation } from "./helper/fsUtils.js";
import { port } from '../../vite.config';

const production = process.env.NODE_ENV === 'production';
export const base =  production ?  '/video/' : '/';

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(`${base}media/`, express.static(mediaLocation))

// app.use(`${base}api/content`, content);

app.get("/hello", (_, res) => {
    console.log('get --- hello')
    res.json("Hello Vite + React + TypeScript!");
});

ViteExpress.listen(app, port, () =>
    console.log(`Server is listening on port ${port}...`),
);
