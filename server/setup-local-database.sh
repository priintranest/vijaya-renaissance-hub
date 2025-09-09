#!/bin/bash
# Local MySQL setup and test script

echo "===== Setting up local MySQL for Vijaya Renaissance Hub ====="

# Check if MySQL is installed and running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    echo "Please install MySQL first. On Windows, you can install XAMPP or MySQL Community Edition."
    exit 1
fi

# Prompt for MySQL root password
echo "Enter your MySQL root password (or press Enter if no password):"
read -s MYSQL_ROOT_PASSWORD

# Set password argument based on input
PASS_ARG=""
if [ -n "$MYSQL_ROOT_PASSWORD" ]; then
    PASS_ARG="-p$MYSQL_ROOT_PASSWORD"
fi

# Run the SQL setup script
echo "Creating database and tables..."
if mysql -u root $PASS_ARG < setup-local-mysql.sql; then
    echo "✅ Database setup completed successfully!"
else
    echo "❌ Database setup failed! Check your MySQL root password and try again."
    exit 1
fi

# Check if necessary Node packages are installed
echo "Checking for required Node.js packages..."
if ! npm list mysql2 &> /dev/null; then
    echo "Installing mysql2 package..."
    cd ..
    npm install mysql2
    cd server
fi

# Run the Node.js test script
echo "Running test script..."
node test-local-mysql.js

echo "===== All done! ====="
echo "If there were no errors, your local MySQL setup is working correctly."
echo "You can now test the waitlist form with your local database."
