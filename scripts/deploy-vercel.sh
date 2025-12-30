#!/bin/bash

# Vercel Deployment Script
# Run this to deploy to Vercel after setting up environment variables

echo "🚀 Universal AI Agent Team - Vercel Deployment"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env with Railway database credentials first."
    exit 1
fi

# Source the .env file
set -a
source .env
set +a

echo "✅ Found .env file with Railway credentials"
echo ""

# Check if logged into Vercel
echo "Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged into Vercel. Running 'vercel login'..."
    vercel login
else
    echo "✅ Logged into Vercel as: $(vercel whoami)"
fi

echo ""
echo "📦 Starting deployment process..."
echo ""

# Deploy to Vercel
echo "Running 'vercel --yes'..."
vercel --yes

# Get the deployment URL
DEPLOYMENT_URL=$(vercel ls --token $VERCEL_TOKEN | grep "universal-ai-agent-team" | head -1 | awk '{print $2}')

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Go to: https://vercel.com/[your-account]/universal-ai-agent-team/settings/environment-variables"
echo "3. Add these variables:"
echo "   - PGHOST = $PGHOST"
echo "   - PGDATABASE = $PGDATABASE"
echo "   - PGUSER = $PGUSER"
echo "   - PGPASSWORD = [your password]"
echo "   - PGPORT = $PGPORT"
echo ""
echo "4. After adding variables, redeploy:"
echo "   vercel --prod"
echo ""
echo "📖 Full guide: documentation/deployment/VERCEL-DEPLOYMENT-GUIDE.md"
