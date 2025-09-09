#!/bin/bash
# Deployment script for VVF Waitlist Frontend

# Configuration - CHANGE THESE VALUES
SERVER_USER="your-username"
SERVER_IP="your-server-ip"
SERVER_PATH="/var/www/vvf-waitlist/public"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Building React application for production...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Build successful!${NC}"
echo -e "${YELLOW}Deploying to production server...${NC}"

# Upload the build to the production server
echo -e "${YELLOW}Uploading build files...${NC}"
scp -r dist/* $SERVER_USER@$SERVER_IP:$SERVER_PATH

if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${YELLOW}Your website is now live at https://thevvf.org${NC}"
