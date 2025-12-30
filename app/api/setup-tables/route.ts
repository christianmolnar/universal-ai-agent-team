import { NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET() {
  try {
    const pool = DatabaseManager.getPool();
    
    console.log('Creating analysis_batches table...');
    // Create analysis_batches table first
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analysis_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        property_types VARCHAR(50) NOT NULL,
        total_properties INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ analysis_batches table created');
    
    console.log('Creating property_analyses table...');
    // Create property_analyses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        batch_id UUID REFERENCES analysis_batches(id) ON DELETE CASCADE,
        zpid VARCHAR(50),
        zillow_url TEXT NOT NULL,
        property_type VARCHAR(50) NOT NULL,
        property_data JSONB,
        primary_analysis JSONB,
        quality_review JSONB,
        final_validation JSONB,
        quality_score INTEGER,
        recommendation VARCHAR(50),
        confidence DECIMAL(3,2),
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ property_analyses table created');
    
    console.log('Creating indexes...');
    // Create indexes (with individual error handling)
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_batches_user ON analysis_batches(user_id)`);
      console.log('✅ idx_batches_user created');
    } catch (e: any) {
      console.log('⚠️  idx_batches_user skipped:', e.message);
    }
    
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_batches_status ON analysis_batches(status)`);
      console.log('✅ idx_batches_status created');
    } catch (e: any) {
      console.log('⚠️  idx_batches_status skipped:', e.message);
    }
    
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_property_analyses_batch ON property_analyses(batch_id)`);
      console.log('✅ idx_property_analyses_batch created');
    } catch (e: any) {
      console.log('⚠️  idx_property_analyses_batch skipped:', e.message);
    }
    
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_property_analyses_user ON property_analyses(user_id)`);
      console.log('✅ idx_property_analyses_user created');
    } catch (e: any) {
      console.log('⚠️  idx_property_analyses_user skipped:', e.message);
    }
    
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_property_analyses_score ON property_analyses(quality_score DESC) WHERE quality_score IS NOT NULL`);
      console.log('✅ idx_property_analyses_score created');
    } catch (e: any) {
      console.log('⚠️  idx_property_analyses_score skipped:', e.message);
    }
    
    console.log('✅ Setup complete!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tables created successfully!' 
    });
  } catch (error) {
    console.error('Setup tables error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
