#!/bin/bash

# Test MySQL Connection Script
echo "Testing MySQL connection..."

# Database configuration
DB_HOST="localhost"
DB_NAME="vvf_waitlist"
DB_USER="vvf_user"
DB_PASS="your_secure_password_here"

# Try to connect
if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; SELECT 'Connection successful!' AS message;" 2>/dev/null; then
    echo "✅ MySQL connection successful!"
else
    echo "❌ MySQL connection failed. Please check your credentials and ensure MySQL is running."
    exit 1
fi

# Test table existence
if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME; DESCRIBE waitlist_entries;" 2>/dev/null; then
    echo "✅ Table 'waitlist_entries' exists!"
    
    # Count entries
    COUNT=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -N -e "USE $DB_NAME; SELECT COUNT(*) FROM waitlist_entries;")
    echo "📊 Current entry count: $COUNT"
else
    echo "❓ Table 'waitlist_entries' doesn't exist. You may need to run 'npm run init-mysql'."
    exit 1
fi

echo "✨ All tests completed!"
