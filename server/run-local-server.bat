@echo off
REM Run the local server with MySQL connection

echo Starting local server with MySQL connection...
echo Press Ctrl+C to stop the server

REM Start the server
node server-mysql.js
