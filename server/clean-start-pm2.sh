#!/bin/bash
# This script cleans up PM2 processes and starts the server on port 3003

echo "Cleaning up PM2 processes..."

# List current PM2 processes
echo "Current PM2 processes:"
pm2 list

# Delete all PM2 processes
echo "Deleting all PM2 processes..."
pm2 delete all

# Wait a moment
sleep 2

# Start the server on port 3003
echo "Starting server on port 3003..."
pm2 start server-mysql.js --name vvf-waitlist

# Save the PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Show status
echo "Current PM2 status:"
pm2 status

echo "Setup complete!"
echo "Your application should now be accessible at https://thevvf.org"
echo "Admin panel: https://thevvf.org/admin/database"
echo "Admin token: vvf-admin-secret-2024"
