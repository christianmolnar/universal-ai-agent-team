/**
 * Database Migration: Add Batch Analysis Tables
 * This adds new tables WITHOUT modifying existing user_properties table
 * 
 * Run this to add batch analysis capability while keeping existing features working
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function addBatchAnalysisTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding batch analysis tables (non-breaking migration)...\n');

    // Table 1: Analysis Batches (track batch jobs)
    await client.query(`
      CREATE TABLE IF NOT EXISTS analysis_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        property_types VARCHAR(50) NOT NULL,  -- 'primary', 'rental', 'both'
        total_properties INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed'
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created table: analysis_batches');

    // Table 2: Property Analyses (detailed analysis results)
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        batch_id UUID REFERENCES analysis_batches(id) ON DELETE CASCADE,
        zpid VARCHAR(50) NOT NULL,
        zillow_url TEXT NOT NULL,
        property_type VARCHAR(20) NOT NULL,  -- 'primary' or 'rental'
        
        -- Scraped property data
        property_data JSONB NOT NULL,
        
        -- Analysis stages (Universal Methodology)
        primary_analysis JSONB,      -- First analysis from Claude
        quality_review JSONB,         -- Quality check from secondary model
        final_validation JSONB,       -- Final validation from Claude
        
        -- Universal Methodology scores
        quality_score INTEGER,        -- 0-100
        recommendation VARCHAR(20),   -- 'PROCEED', 'CAUTION', 'REJECT'
        confidence DECIMAL(3,2),      -- 0.0-1.0
        
        -- Status tracking
        status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'analyzing', 'completed', 'failed'
        error_message TEXT,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created table: property_analyses');

    // Create indexes for performance
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_analysis_batches_user 
        ON analysis_batches(user_id, created_at DESC);
      `);
      console.log('✅ Created index: idx_analysis_batches_user');
    } catch (e) {
      console.log('⚠️  Index idx_analysis_batches_user already exists or failed');
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_property_analyses_batch 
        ON property_analyses(batch_id);
      `);
      console.log('✅ Created index: idx_property_analyses_batch');
    } catch (e) {
      console.log('⚠️  Index idx_property_analyses_batch already exists or failed');
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_property_analyses_user 
        ON property_analyses(user_id, created_at DESC);
      `);
      console.log('✅ Created index: idx_property_analyses_user');
    } catch (e) {
      console.log('⚠️  Index idx_property_analyses_user already exists or failed');
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_property_analyses_score 
        ON property_analyses(quality_score DESC) WHERE quality_score IS NOT NULL;
      `);
      console.log('✅ Created index: idx_property_analyses_score');
    } catch (e) {
      console.log('⚠️  Index idx_property_analyses_score already exists or failed');
    }

    console.log('\n✅ Migration complete! New tables added without affecting existing data.');
    console.log('\n📊 Database now has:');
    console.log('   - user_properties (existing, unchanged)');
    console.log('   - analysis_batches (new)');
    console.log('   - property_analyses (new)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
addBatchAnalysisTables()
  .then(() => {
    console.log('\n✅ Database ready for batch analysis!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
