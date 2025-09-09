#!/bin/bash
# This script finds and optionally kills processes using port 3001

PORT=${1:-3001}
echo "Checking for processes using port $PORT..."

# Find processes using the port
if command -v lsof > /dev/null; then
    # If lsof is available (common on many systems)
    PIDS=$(lsof -ti:$PORT)
elif command -v netstat > /dev/null && command -v grep > /dev/null; then
    # Fallback to netstat
    PIDS=$(netstat -tulpn 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d/ -f1)
else
    echo "❌ Cannot check port usage: neither lsof nor netstat found"
    exit 1
fi

if [ -z "$PIDS" ]; then
    echo "✅ No process is using port $PORT"
    exit 0
fi

echo "Found processes using port $PORT:"
for PID in $PIDS; do
    # Get process details
    if command -v ps > /dev/null; then
        PROCESS_INFO=$(ps -p $PID -o pid,user,command | tail -n +2)
        echo "PID: $PID - $PROCESS_INFO"
    else
        echo "PID: $PID (cannot get process details)"
    fi
done

# Ask if the user wants to kill these processes
read -p "Do you want to kill these processes? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    for PID in $PIDS; do
        echo "Killing process $PID..."
        kill -9 $PID
    done
    echo "✅ Processes killed"
else
    echo "No action taken"
fi
