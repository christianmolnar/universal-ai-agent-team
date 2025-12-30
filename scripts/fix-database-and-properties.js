// Fix database schema and property data issues
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function fixDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Fixing database issues...\n');
    
    // 1. Add property_type column if it doesn't exist
    console.log('1. Adding property_type column...');
    try {
      await pool.query(`
        ALTER TABLE user_properties 
        ADD COLUMN IF NOT EXISTS property_type VARCHAR(20) DEFAULT 'rental';
      `);
      console.log('✅ property_type column added\n');
    } catch (err) {
      console.log('⚠️  Column may already exist:', err.message, '\n');
    }
    
    // 2. Update Ravensdale to be primary residence
    console.log('2. Setting Ravensdale as Primary Residence...');
    const ravensdale = await pool.query(`
      UPDATE user_properties 
      SET property_type = 'primary'
      WHERE property_data->>'address' LIKE '%Ravensdale%'
      RETURNING id, property_data->>'address' as address;
    `);
    if (ravensdale.rows.length > 0) {
      console.log(`✅ Updated: ${ravensdale.rows[0].address}\n`);
    }
    
    // 3. Update Maple Valley to be rental
    console.log('3. Setting Maple Valley as Rental...');
    const mapleValley = await pool.query(`
      UPDATE user_properties 
      SET property_type = 'rental'
      WHERE property_data->>'address' LIKE '%Maple Valley%'
      RETURNING id, property_data->>'address' as address;
    `);
    if (mapleValley.rows.length > 0) {
      console.log(`✅ Updated: ${mapleValley.rows[0].address}\n`);
    }
    
    // 4. Check and display current state
    console.log('4. Current property types:');
    const properties = await pool.query(`
      SELECT 
        id,
        property_data->>'address' as address,
        property_data->>'city' as city,
        property_type
      FROM user_properties
      ORDER BY created_at;
    `);
    console.table(properties.rows);
    
    console.log('\n✅ Database fixes complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabase();
