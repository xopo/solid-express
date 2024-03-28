import knex from 'knex';
import {dirname,  join } from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const dbFile = join(__dirname, './mp3db.sqlite');

export const connection = knex({
    client: 'better-sqlite3',
    connection: {
        filename: dbFile,
    },
    useNullAsDefault: true,
});

const cache = {last: ''};
connection.on('start', function (builder) {
    // only show new queries
    const {sql, bindings} = builder.toSQL()
    const query = `${sql}  ${JSON.stringify(bindings)}`;
    if (cache.last === query || query === '' || query.includes('waiting_media')) return;
    cache.last = query;
    console.log('[sql]: ', query);
})