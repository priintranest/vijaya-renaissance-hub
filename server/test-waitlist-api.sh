#!/bin/bash
# Comprehensive test script for waitlist API

# Configuration
API_HOST="localhost"  # Change to your domain in production
API_PATH="/api/waitlist"
API_URL="http://${API_HOST}${API_PATH}"
ADMIN_API_URL="http://${API_HOST}/api/admin/waitlist"
ADMIN_TOKEN="vvf-admin-secret-2024"  # This should match the token in server-mysql.js

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Vijaya Renaissance Hub Waitlist API Test ===${NC}"
echo "Testing API at: $API_URL"
echo ""

# 1. Test API health
echo -e "${BLUE}1. Testing API health...${NC}"
HEALTH_RESULT=$(curl -s "http://${API_HOST}/api/health")
echo "Health check result: $HEALTH_RESULT"

# Check if health response contains "healthy"
if echo "$HEALTH_RESULT" | grep -q "healthy"; then
  echo -e "${GREEN}✓ API health check passed${NC}"
else
  echo -e "${RED}✗ API health check failed${NC}"
fi
echo ""

# 2. Test form submission with valid data
echo -e "${BLUE}2. Testing form submission with valid data...${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-$TIMESTAMP@example.com"
TEST_NAME="Test User $TIMESTAMP"

echo "Submitting: $TEST_NAME / $TEST_EMAIL"
SUBMIT_RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"'"$TEST_NAME"'","email":"'"$TEST_EMAIL"'"}' \
  "$API_URL")

echo "Submission result: $SUBMIT_RESULT"

# Check if submission was successful
if echo "$SUBMIT_RESULT" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Submission successful${NC}"
else
  echo -e "${RED}✗ Submission failed${NC}"
fi
echo ""

# 3. Test duplicate submission
echo -e "${BLUE}3. Testing duplicate submission detection...${NC}"
DUPLICATE_RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"'"$TEST_NAME"'","email":"'"$TEST_EMAIL"'"}' \
  "$API_URL")

echo "Duplicate submission result: $DUPLICATE_RESULT"

# Check if duplicate was detected
if echo "$DUPLICATE_RESULT" | grep -q "duplicate\|already registered\|already exists"; then
  echo -e "${GREEN}✓ Duplicate detection working correctly${NC}"
else
  echo -e "${RED}✗ Duplicate detection failed${NC}"
fi
echo ""

# 4. Test admin API without token
echo -e "${BLUE}4. Testing admin API without token...${NC}"
UNAUTHORIZED_RESULT=$(curl -s "$ADMIN_API_URL")
echo "Unauthorized access result: $UNAUTHORIZED_RESULT"

# Check if unauthorized
if echo "$UNAUTHORIZED_RESULT" | grep -q "Unauthorized\|unauthorized\|401"; then
  echo -e "${GREEN}✓ Admin API security working correctly${NC}"
else
  echo -e "${RED}✗ Admin API security failed${NC}"
fi
echo ""

# 5. Test admin API with valid token
echo -e "${BLUE}5. Testing admin API with valid token...${NC}"
AUTH_RESULT=$(curl -s -H "Admin-Token: $ADMIN_TOKEN" "$ADMIN_API_URL")
echo "Admin API result: ${AUTH_RESULT:0:100}..." # Show just the beginning to avoid flooding the terminal

# Check if we got entries
if echo "$AUTH_RESULT" | grep -q "entries\|success.*true"; then
  echo -e "${GREEN}✓ Admin API returned data successfully${NC}"
else
  echo -e "${RED}✗ Admin API data retrieval failed${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo "API URL: $API_URL"
echo "Test email used: $TEST_EMAIL"
echo ""
echo -e "${YELLOW}To access the admin interface:${NC}"
echo "URL: http://${API_HOST}/admin/database"
echo "Admin token: $ADMIN_TOKEN"
echo ""
echo "If all tests passed, your waitlist form and admin interface should be working correctly!"
