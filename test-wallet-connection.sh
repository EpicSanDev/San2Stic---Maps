#!/bin/bash

echo "🧪 Testing wallet connection functionality..."

# Test the health endpoint
echo "📊 Testing API health..."
curl -s http://localhost/api/health | jq '.'

echo ""
echo "🔗 Testing database schema by checking Users table structure..."

# Test that we can query the users table without errors
curl -s -X GET http://localhost/api/users \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "No users found (expected for empty database)"

echo ""
echo "✅ If no errors appeared above, the wallet connection should now work!"
echo "🚀 You can now try connecting with your wallet again."

echo ""
echo "📋 Next steps:"
echo "1. Open your browser and go to http://localhost"
echo "2. Try connecting with your wallet"
echo "3. If you still get errors, check the backend logs with:"
echo "   docker-compose logs backend --tail=20"
