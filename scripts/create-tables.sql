-- Create batch analysis tables

CREATE TABLE IF NOT EXISTS analysis_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  property_types VARCHAR(50) NOT NULL,
  total_properties INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
);

CREATE INDEX IF NOT EXISTS idx_batches_user ON analysis_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON analysis_batches(status);
CREATE INDEX IF NOT EXISTS idx_property_analyses_batch ON property_analyses(batch_id);
CREATE INDEX IF NOT EXISTS idx_property_analyses_user ON property_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_property_analyses_score ON property_analyses(quality_score DESC) WHERE quality_score IS NOT NULL;
