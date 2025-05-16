const { Pool } = require('pg');
require('dotenv').config();

let db;

function setDb() {
  if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
    db = new Pool({
      connectionString: process.env.SUPABASE_URL,
    });
    console.log(`DB connection established for ${process.env.NODE_ENV}`);
  } else {
    db = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    });

    db.connect(err => {
      if (err) {
        console.log('Database connection error', err.stack);
      } else {
        console.log('Database connected: ', db);
      }
    });
    console.log('DB connection established for production');
  }
}

setDb();

module.exports = db;
