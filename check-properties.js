const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function checkProperties() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query(`
      SELECT 
        id,
        zpid,
        property_data->>'address' as address,
        property_data->>'city' as city,
        property_data->>'state' as state,
        property_type,
        created_at
      FROM user_properties
      ORDER BY created_at DESC;
    `);
    
    console.log(`\n📊 Total properties in database: ${result.rows.length}\n`);
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProperties();
