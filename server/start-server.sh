#!/bin/bash
# This script starts the server on an available port

echo "Starting VVF Waitlist server..."

# Define an array of ports to try
PORTS=(3001 3002 3003 3004 3005)

for PORT in "${PORTS[@]}"; do
    echo "Attempting to start server on port $PORT"
    
    # Check if port is in use
    if netstat -tuln | grep -q ":$PORT "; then
        echo "Port $PORT is already in use, trying next port"
        continue
    fi
    
    # Start the server with the specified port
    PORT=$PORT node server-mysql.js &
    
    # Get the PID
    SERVER_PID=$!
    
    # Wait briefly to see if server starts successfully
    sleep 2
    
    # Check if process is still running
    if ps -p $SERVER_PID > /dev/null; then
        echo "✅ Server started successfully on port $PORT with PID $SERVER_PID"
        echo "To stop the server, run: kill $SERVER_PID"
        exit 0
    else
        echo "❌ Server failed to start on port $PORT"
    fi
done

echo "❌ Failed to start server on any available port"
exit 1
