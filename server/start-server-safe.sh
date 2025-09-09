#!/bin/bash
# This script starts the server with proper logging and handles common issues

# Directory for log files
LOG_DIR="../logs"
mkdir -p $LOG_DIR

# Log file paths
SERVER_LOG="$LOG_DIR/server.log"
ERROR_LOG="$LOG_DIR/error.log"

echo "Starting VVF Waitlist server..."
echo "$(date): Starting server" >> $SERVER_LOG

# Function to check if a port is in use
is_port_in_use() {
    netstat -tuln | grep -q ":$1 "
    return $?
}

# Get the port from the server file
PORT=$(grep "const PORT = process.env.PORT || " server-mysql.js | sed 's/.*|| \([0-9]\+\).*/\1/')
echo "Server configured to use port: $PORT"

# Check if the port is already in use
if is_port_in_use $PORT; then
    echo "⚠️ Warning: Port $PORT is already in use"
    echo "$(date): Port $PORT is already in use" >> $ERROR_LOG
    
    # Try to kill the process using the port
    echo "Attempting to free up port $PORT..."
    if command -v lsof > /dev/null; then
        PIDS=$(lsof -ti:$PORT)
        if [ -n "$PIDS" ]; then
            echo "Found processes: $PIDS"
            for PID in $PIDS; do
                echo "Killing process $PID..."
                kill -9 $PID
                echo "$(date): Killed process $PID using port $PORT" >> $SERVER_LOG
            done
        fi
    else
        echo "❌ lsof command not found, cannot automatically kill processes"
        echo "Please manually free up port $PORT before continuing"
        exit 1
    fi
    
    # Wait a moment for the port to be released
    echo "Waiting for port to be released..."
    sleep 5
    
    # Check if port is still in use
    if is_port_in_use $PORT; then
        echo "❌ Failed to free up port $PORT"
        echo "$(date): Failed to free up port $PORT" >> $ERROR_LOG
        echo "Please manually free up the port or edit server-mysql.js to use a different port."
        exit 1
    fi
fi

# Start the server with logging
echo "Starting server on port $PORT..."
node server-mysql.js > $SERVER_LOG 2> $ERROR_LOG &

# Save the PID
SERVER_PID=$!
echo $SERVER_PID > server.pid
echo "Server started with PID: $SERVER_PID"
echo "$(date): Server started with PID: $SERVER_PID" >> $SERVER_LOG

# Wait a moment to check if the server starts correctly
sleep 3

# Check if the process is still running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started successfully"
    echo "Logs are being written to:"
    echo "  - Server log: $SERVER_LOG"
    echo "  - Error log: $ERROR_LOG"
    echo ""
    echo "To check server status: ps -p $SERVER_PID"
    echo "To stop the server: kill $SERVER_PID"
else
    echo "❌ Server failed to start. Check the error log for details:"
    echo "$(date): Server failed to start" >> $ERROR_LOG
    cat $ERROR_LOG
fi
