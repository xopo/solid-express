import {join} from 'node:path';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const config = {
    database: {
        client: 'better-sqlite3',
        connection: { 
            filename: join(__dirname, '../pingpong.db')
        },
        useNullAsDefault: true,
        // migrations: {
        //     directory: './data/migraitons',
        // }
        // seeds: {
        //     directory: './data/seeds',
        // }
    }
};

console.log({config: config.database.connection})

export default config
