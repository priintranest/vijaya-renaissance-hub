#!/bin/bash
# Run the local server with MySQL connection

echo "Starting local server with MySQL connection..."
echo "Press Ctrl+C to stop the server"

# Navigate to the server directory if needed
cd "$(dirname "$0")"

# Set environment variables if needed
# export PORT=3001

# Start the server
node server-mysql.js
