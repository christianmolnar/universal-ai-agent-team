#!/bin/bash
# Cleanup script for Real Estate Analysis V2
# Clears all batch analysis data from the database

set -e

echo "🧹 Real Estate Analysis V2 Cleanup Script"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL not found in .env"
  exit 1
fi

echo "📊 Database: $(echo $DATABASE_URL | sed 's/:[^:@]*@/:***@/g')"
echo ""

# Confirm before deletion
read -p "⚠️  This will DELETE ALL batch analysis data. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "🗑️  Deleting all property analyses..."
psql $DATABASE_URL -c "DELETE FROM property_analyses;" 2>&1 | grep -E "(DELETE|ERROR)" || true

echo "🗑️  Deleting all analysis batches..."
psql $DATABASE_URL -c "DELETE FROM analysis_batches;" 2>&1 | grep -E "(DELETE|ERROR)" || true

echo "🗑️  Resetting sequences..."
psql $DATABASE_URL -c "ALTER SEQUENCE IF EXISTS property_analyses_id_seq RESTART WITH 1;" 2>&1 | grep -E "(ALTER|ERROR)" || true
psql $DATABASE_URL -c "ALTER SEQUENCE IF EXISTS analysis_batches_id_seq RESTART WITH 1;" 2>&1 | grep -E "(ALTER|ERROR)" || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📈 Current row counts:"
psql $DATABASE_URL -c "SELECT 
  (SELECT COUNT(*) FROM analysis_batches) as batches,
  (SELECT COUNT(*) FROM property_analyses) as properties;" 2>&1 | tail -n 4
