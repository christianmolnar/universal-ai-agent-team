const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT zpid, property_data FROM user_properties')
  .then(result => {
    console.log(`\nTotal properties: ${result.rows.length}\n`);
    result.rows.forEach((row, i) => {
      const data = row.property_data;
      console.log(`${i+1}. ${data.address}, ${data.city}, ${data.state} (zpid: ${row.zpid})`);
    });
    pool.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    pool.end();
  });
