#!/bin/bash
# Local test script for Vijaya Renaissance Hub API

echo "=== Setting up local test environment for VVF API ==="

# Create a directory for testing
TEST_DIR="./local-test-api"
mkdir -p $TEST_DIR

# Copy the necessary files
echo "Copying files to test directory..."
cp server/server-mysql.js $TEST_DIR/server.js
cp server/nginx-config.conf $TEST_DIR/
cp server/test-waitlist-api.sh $TEST_DIR/
cp server/fix-api.sh $TEST_DIR/

# Prepare a simple guide for recovering server access
cat > "$TEST_DIR/SERVER-ACCESS-RECOVERY.md" << 'EOF'
# Server Access Recovery Guide

If you've lost access to your server (64.227.167.190), here are your options:

## Option 1: Digital Ocean Control Panel
1. Log in to your Digital Ocean account
2. Find your droplet (64.227.167.190)
3. Click on "Access" in the left sidebar
4. Choose "Reset root password"
5. Check your email for the new password
6. Try logging in with the new password: `ssh root@64.227.167.190`

## Option 2: Contact your hosting provider
If you don't have access to the Digital Ocean account or it's hosted elsewhere:
1. Contact your hosting provider's support
2. Verify your identity as the server owner
3. Request password reset for the root user

## Option 3: If you have another admin user
If you created another user with sudo privileges:
```bash
ssh your-username@64.227.167.190
sudo -i  # This will give you root access
```

## After regaining access:
Run these commands to fix your API:
```bash
# Copy files from your local machine
scp server/nginx-config.conf server/fix-api.sh root@64.227.167.190:/root/
scp server/server-mysql.js root@64.227.167.190:/var/www/thevvf.org/app/server/

# Run the fix script
ssh root@64.227.167.190 "cd /root && chmod +x fix-api.sh && ./fix-api.sh"
```

## Testing the API
After fixing, test with:
```bash
ssh root@64.227.167.190 "cd /root && ./test-waitlist-api.sh"
```
EOF

echo "=== Local environment setup complete ==="
echo "Please check the $TEST_DIR directory for files and recovery instructions"
echo "Once you regain server access, follow the instructions in SERVER-ACCESS-RECOVERY.md"
