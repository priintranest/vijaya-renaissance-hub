#!/bin/bash
# Script to upload the fix files to the server

# Check if server IP is provided
if [ -z "$1" ]; then
  echo "Please provide the server IP address."
  echo "Usage: ./upload-fix.sh your-server-ip"
  exit 1
fi

SERVER_IP=$1
echo "Uploading files to $SERVER_IP..."

# Copy the files to the server
echo "Copying Nginx config and fix script..."
scp server/nginx-config.conf server/fix-api.sh root@$SERVER_IP:/root/

# Upload the updated server-mysql.js file with admin API endpoints
echo "Copying server-mysql.js with admin endpoints..."
scp server/server-mysql.js root@$SERVER_IP:/var/www/thevvf.org/app/server/

# SSH into the server and execute the fix script
echo "Executing fix script on server..."
ssh root@$SERVER_IP "cd /root && chmod +x fix-api.sh && ./fix-api.sh"

echo "Done! Check the output above for any errors."
echo ""
echo "Admin dashboard can be accessed at: https://thevvf.org/admin/database"
echo "Use the admin token: vvf-admin-secret-2024"
