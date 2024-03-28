// Update with your config settings.
const path = require('path')

const getAbsPath = partial => path.join(__dirname, partial)

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {

    client: 'better-sqlite3',
    connection: {
      filename: getAbsPath('src/server/db/mp3db.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: getAbsPath('src/server/db/migrations')
    },
    seeds: {
      directory: getAbsPath('src/server/db/seeds')
    }

};

module.exports = config;


/*
  ** to make new migration:
  npx knex migrate:make

  ** to list migrations:
  npx knex migrate:list

  ** to apply all/remaining migrations
  npx knex migrate:latest

  ** to make new seed:
  npx knex seed:make
  
  ** to run all seeds:
  npx knex seed: run

*/