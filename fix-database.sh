#!/bin/bash

echo "🔧 Fixing database schema for San2Stic Maps..."

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

echo "📍 Current directory: $(pwd)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the backend directory."
    exit 1
fi

# Check database schema
echo "🔍 Checking current database schema..."
node src/scripts/check-schema.js

echo ""
echo "🔄 Migrating database schema..."
node src/scripts/migrate-user-columns.js

echo ""
echo "✅ Database migration completed!"
echo "🚀 You can now try connecting with your wallet again."
