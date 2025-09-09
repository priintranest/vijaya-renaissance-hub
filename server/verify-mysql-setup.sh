#!/bin/bash
# This script verifies and sets up the MySQL database and user for VVF Waitlist

echo "Verifying MySQL setup for VVF Waitlist..."

# MySQL user details
DB_NAME="vvf_waitlist"
DB_USER="vvf_user"
DB_PASS="1001"

# Check if MySQL is accessible
echo "Testing MySQL access..."
mysql --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ MySQL client not found or not accessible. Please install MySQL client."
    exit 1
fi

# Try to connect to MySQL as root (the MySQL admin)
echo "Enter your MySQL root password (or press Enter if no password):"
read -s MYSQL_ROOT_PASSWORD

# Create a temporary SQL file
TMP_SQL=$(mktemp)
echo "CREATE DATABASE IF NOT EXISTS $DB_NAME;" > $TMP_SQL
echo "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';" >> $TMP_SQL
echo "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';" >> $TMP_SQL
echo "FLUSH PRIVILEGES;" >> $TMP_SQL
echo "USE $DB_NAME;" >> $TMP_SQL
echo "CREATE TABLE IF NOT EXISTS waitlist_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  interest VARCHAR(100),
  source VARCHAR(100),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);" >> $TMP_SQL

# Run the SQL commands
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    mysql < $TMP_SQL
else
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" < $TMP_SQL
fi

# Check if it worked
if [ $? -eq 0 ]; then
    echo "✅ Database and user setup complete"
else
    echo "❌ Failed to set up database and user"
    echo "Trying an alternative approach with a more explicit MySQL command..."
    
    # Try a more direct approach
    if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
        mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
        mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
        mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
        mysql -e "FLUSH PRIVILEGES;"
    else
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "FLUSH PRIVILEGES;"
    fi
fi

# Test connection with the vvf_user account
echo "Testing connection with vvf_user account..."
mysql -u $DB_USER -p"$DB_PASS" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Successfully connected with vvf_user account"
else
    echo "❌ Failed to connect with vvf_user account"
    echo "Please check your MySQL configuration and ensure the user and database exist."
fi

# Clean up temporary file
rm -f $TMP_SQL

echo "MySQL verification complete."
