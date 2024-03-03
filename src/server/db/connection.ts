import knex from 'knex';
import {dirname,  join } from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const dbFile = join(__dirname, './ping_pong_db.sqlite');
console.log('sqlite file at', dbFile)

export const connection = knex({
    client: 'better-sqlite3',
    connection: {
        filename: dbFile,
    },
    useNullAsDefault: true,
});
