
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
var path = require('node:path')

//@ts-ignore
var getAbsPath = (partial) => path.join(__dirname, partial)

var config = {
    client: 'better-sqlite3',
    connection: {
      filename: getAbsPath('src/server/pingpong.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: getAbsPath('src/server/db/migrations')
    },
    seeds: {
      directory: getAbsPath('src/server/db/seeds')
    }

};

// console.info(config);

// /**
//  * @type { Object.<string, import("knex").Knex.Config> }
//  */
// const config = {
    
//     client: 'better-sqlite3',
//     connection: {
//       filename: getAbsPath('src/server/db/ping_pong_db.sqlite')
//     },
//     useNullAsDefault: true,
//     migrations: {
//       directory: getAbsPath('src/server/db/migrations')
//     },
//     seeds: {
//       directory: getAbsPath('src/server/db/seeds')
//     }

// };

module.exports = config;