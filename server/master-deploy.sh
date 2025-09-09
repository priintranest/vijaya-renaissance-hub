#!/bin/bash
# Master deployment script for VVF Waitlist application

echo "================================================"
echo "VVF Waitlist - Production Deployment Script"
echo "================================================"
echo ""

# Step 1: Verify and setup MySQL
echo "Step 1: Verifying MySQL setup..."
./verify-mysql-setup.sh

if [ $? -ne 0 ]; then
    echo "❌ MySQL setup failed. Please fix the issues before continuing."
    echo "You may need to manually run: ./verify-mysql-setup.sh"
    exit 1
fi

# Step 2: Configure Nginx
echo ""
echo "Step 2: Setting up Nginx configuration..."
./setup-nginx.sh

if [ $? -ne 0 ]; then
    echo "❌ Nginx setup failed. Please fix the issues before continuing."
    echo "You may need to manually run: ./setup-nginx.sh"
    exit 1
fi

# Step 3: Start or restart the Node.js server
echo ""
echo "Step 3: Starting the Node.js server..."

# Check if PM2 is installed
pm2 --version > /dev/null 2>&1

if [ $? -eq 0 ]; then
    # PM2 is installed, use it to manage the server
    echo "Using PM2 to manage the server process..."
    
    # Check if the app is already registered with PM2
    pm2 list | grep "vvf-waitlist" > /dev/null
    
    if [ $? -eq 0 ]; then
        # App exists, restart it
        echo "Restarting existing PM2 process..."
        pm2 restart vvf-waitlist
    else
        # App doesn't exist, start a new one
        echo "Starting new PM2 process..."
        pm2 start server-mysql.js --name vvf-waitlist
        
        # Save the PM2 configuration
        pm2 save
    fi
    
    # Setup PM2 to start on system boot if not already done
    pm2 startup | grep -q "sudo"
    
    if [ $? -eq 0 ]; then
        echo "Setting up PM2 to start on system boot..."
        pm2 startup
        pm2 save
    fi
    
    # Show status
    pm2 status vvf-waitlist
else
    # PM2 not installed, use the start-server-safe.sh script
    echo "PM2 not found. Using standard Node.js process management..."
    ./start-server-safe.sh
fi

echo ""
echo "================================================"
echo "Deployment complete!"
echo "================================================"
echo ""
echo "Your VVF Waitlist application should now be running at:"
echo "https://thevvf.org"
echo ""
echo "Admin interface: https://thevvf.org/admin/database"
echo "Admin token: vvf-admin-secret-2024"
echo ""
echo "To check server status:"
if command -v pm2 > /dev/null; then
    echo "  pm2 status vvf-waitlist"
else
    echo "  ps aux | grep server-mysql"
fi
echo ""
echo "To check logs:"
if command -v pm2 > /dev/null; then
    echo "  pm2 logs vvf-waitlist"
else
    echo "  tail -f ../logs/server.log"
fi
echo ""
echo "Thank you for using the VVF Waitlist application!"
