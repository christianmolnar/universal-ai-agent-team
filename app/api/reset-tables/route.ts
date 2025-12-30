import { NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/database';

export async function GET() {
  try {
    const pool = DatabaseManager.getPool();
    
    // Drop existing tables if they exist
    console.log('Dropping existing tables...');
    await pool.query(`DROP TABLE IF EXISTS property_analyses CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS analysis_batches CASCADE`);
    console.log('✅ Old tables dropped');
    
    // Create analysis_batches table
    console.log('Creating analysis_batches table...');
    await pool.query(`
      CREATE TABLE analysis_batches (
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
    
    // Create property_analyses table
    console.log('Creating property_analyses table...');
    await pool.query(`
      CREATE TABLE property_analyses (
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
        quality_score DECIMAL(5,2),
        recommendation VARCHAR(50),
        confidence DECIMAL(5,2),
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ property_analyses table created');
    
    // Create indexes
    await pool.query(`CREATE INDEX idx_batches_user ON analysis_batches(user_id)`);
    await pool.query(`CREATE INDEX idx_batches_status ON analysis_batches(status)`);
    await pool.query(`CREATE INDEX idx_property_analyses_batch ON property_analyses(batch_id)`);
    await pool.query(`CREATE INDEX idx_property_analyses_user ON property_analyses(user_id)`);
    await pool.query(`CREATE INDEX idx_property_analyses_score ON property_analyses(quality_score DESC) WHERE quality_score IS NOT NULL`);
    console.log('✅ Indexes created');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tables recreated successfully!' 
    });
  } catch (error) {
    console.error('Reset tables error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
