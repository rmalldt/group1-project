const { Pool } = require('pg');
require('dotenv').config();

let db;

function setDb() {
  switch (process.env.NODE_ENV) {
    case 'development':
    case 'test':
      db = new Pool({
        connectionString: process.env.SUPABASE_URL,
      });
      break;
    case 'production':
      db = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
      });
      break;

    default:
      throw new Error(
        'Database connection error: process.env.NODE_ENV not defined!'
      );
  }
  console.log(`DB connection established for ${process.env.NODE_ENV}`);
}

setDb();

module.exports = db;
