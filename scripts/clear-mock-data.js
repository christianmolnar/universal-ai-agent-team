#!/usr/bin/env node
/**
 * Clear all mock/test property data from database
 * Run: node scripts/clear-mock-data.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function clearMockData() {
  try {
    console.log('🗑️  Clearing mock data from database...\n');
    
    // Delete in correct order due to foreign key constraints
    const analyses = await pool.query('DELETE FROM property_analyses RETURNING *');
    console.log(`✅ Deleted ${analyses.rowCount} property analyses`);
    
    const batches = await pool.query('DELETE FROM analysis_batches RETURNING *');
    console.log(`✅ Deleted ${batches.rowCount} analysis batches`);
    
    const userProps = await pool.query('DELETE FROM user_properties RETURNING *');
    console.log(`✅ Deleted ${userProps.rowCount} user properties`);
    
    const properties = await pool.query('DELETE FROM properties RETURNING *');
    console.log(`✅ Deleted ${properties.rowCount} properties`);
    
    // Verify
    const count = await pool.query('SELECT COUNT(*) FROM properties');
    console.log(`\n✅ Database cleaned - ${count.rows[0].count} properties remaining`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

clearMockData();
