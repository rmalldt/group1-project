const { Pool } = require('pg');
require('dotenv').config();

const db =
  process.env.NODE_ENV === 'dev' || 'test'
    ? new Pool({
        connectionString: process.env.SUPABASE_URL,
      })
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      });

console.log(
  `DB connection established for ${
    process.env.NODE_ENV ?? 'production'
  } environment.`
);

module.exports = db;
