#!/bin/bash
# This script tests if the backend API is working correctly

echo "Testing backend API connectivity..."

# Test the API server is running
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)

if [ "$response" = "200" ]; then
  echo "✅ API server is running locally"
else
  echo "❌ API server is NOT running locally (got HTTP $response)"
  echo "   You need to start the server with: node server-mysql.js"
fi

# Test the API through Nginx
response=$(curl -s -o /dev/null -w "%{http_code}" https://thevvf.org/api/health)

if [ "$response" = "200" ]; then
  echo "✅ API server is accessible through Nginx"
else
  echo "❌ API server is NOT accessible through Nginx (got HTTP $response)"
  echo "   Check your Nginx configuration and make sure the server is running"
fi

# Test admin API (without token, should return 401)
response=$(curl -s -o /dev/null -w "%{http_code}" https://thevvf.org/api/admin/waitlist)

if [ "$response" = "401" ]; then
  echo "✅ Admin API returns proper 401 unauthorized"
else
  echo "❌ Admin API not working as expected (got HTTP $response)"
  echo "   Check your server configuration"
fi

echo ""
echo "Now testing with the admin token..."
echo "Enter the admin token (it will be hidden):"
read -s ADMIN_TOKEN

# Test admin API with token
response=$(curl -s -H "Admin-Token: $ADMIN_TOKEN" https://thevvf.org/api/admin/waitlist)

if [[ "$response" == *"success"* ]]; then
  echo "✅ Admin API works correctly with token"
else
  echo "❌ Admin API not returning proper JSON with token"
  echo "   Response: ${response:0:100}..."
  echo "   Check your server-mysql.js file and server logs"
fi

echo ""
echo "Test completed."
