#!/bin/bash
# MySQL Password Reset Script for Production Server
# Use this script when you've forgotten your MySQL password

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}  MySQL Password Reset for Production Server ${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""

# Generate a new secure password or allow user to set one
echo -e "${YELLOW}Would you like to:${NC}"
echo "1) Generate a random secure password"
echo "2) Enter your own password"
read -p "Choose option (1/2): " PASSWORD_OPTION

if [ "$PASSWORD_OPTION" = "1" ]; then
  # Generate a random secure password
  NEW_PASSWORD=$(openssl rand -base64 12)
  echo -e "${GREEN}Generated new password: $NEW_PASSWORD${NC}"
  echo -e "${YELLOW}IMPORTANT: Save this password securely now!${NC}"
  echo ""
else
  # User sets their own password
  echo -e "${YELLOW}Enter your new MySQL password:${NC}"
  read -s NEW_PASSWORD
  echo -e "${YELLOW}Confirm your new MySQL password:${NC}"
  read -s CONFIRM_PASSWORD
  
  if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    echo -e "${RED}Error: Passwords do not match. Please run the script again.${NC}"
    exit 1
  fi
fi

# Confirm before proceeding
echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "1. Reset the MySQL root password using the sudo method"
echo "2. Update the vvf_user password"
echo "3. Update configuration files"
echo "4. Restart the application server"
echo ""
read -p "Do you want to continue? (y/n): " CONTINUE

if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
  echo -e "${RED}Password reset canceled.${NC}"
  exit 0
fi

# Step 1: Reset MySQL root password using the sudo method
echo ""
echo -e "${YELLOW}Step 1: Resetting MySQL root password...${NC}"

# Stop MySQL
echo "Stopping MySQL service..."
sudo systemctl stop mysql

# Start MySQL with skip-grant-tables
echo "Starting MySQL in safe mode..."
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
sudo mysqld_safe --skip-grant-tables --skip-networking &
sleep 5  # Give MySQL time to start

# Update root password
echo "Updating root password..."
sudo mysql -u root << EOF
USE mysql;
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF

# Restart MySQL normally
echo "Restarting MySQL service..."
sudo mysqladmin -u root -p"$NEW_PASSWORD" shutdown
sleep 2
sudo systemctl start mysql
sleep 2

echo -e "${GREEN}✅ MySQL root password reset successfully!${NC}"

# Step 2: Update vvf_user password
echo ""
echo -e "${YELLOW}Step 2: Updating vvf_user password...${NC}"

mysql -u root -p"$NEW_PASSWORD" << EOF
ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✅ vvf_user password updated successfully!${NC}"

# Step 3: Update configuration files
echo ""
echo -e "${YELLOW}Step 3: Updating configuration files...${NC}"

# Paths to check
SERVER_PATHS=(
  "/var/www/vvf-waitlist/server/server-mysql.js"
  "/var/www/thevvf.org/server/server-mysql.js"
  "/opt/vvf-waitlist/server-mysql.js"
  "/opt/vvf-waitlist/server/server-mysql.js"
)

# Backup and update the first server file found
SERVER_FILE_UPDATED=false
for SERVER_PATH in "${SERVER_PATHS[@]}"; do
  if [ -f "$SERVER_PATH" ]; then
    echo "Found server file at $SERVER_PATH"
    
    # Create backup
    cp "$SERVER_PATH" "$SERVER_PATH.bak.$(date +%Y%m%d%H%M%S)"
    
    # Update password in server file
    sed -i "s/password: '.*',/password: '$NEW_PASSWORD',/" "$SERVER_PATH"
    
    echo -e "${GREEN}✅ Updated $SERVER_PATH and created backup${NC}"
    SERVER_FILE_UPDATED=true
    break
  fi
done

if [ "$SERVER_FILE_UPDATED" = false ]; then
  echo -e "${RED}⚠️ Could not find server-mysql.js file.${NC}"
  echo -e "${YELLOW}You'll need to manually update the password in your server configuration file.${NC}"
fi

# Update backup scripts if they exist
BACKUP_PATHS=(
  "/var/www/vvf-waitlist/server/backup.sh"
  "/var/www/thevvf.org/server/backup.sh"
  "/opt/vvf-waitlist/backup.sh"
  "/opt/vvf-waitlist/server/backup.sh"
)

BACKUP_FILE_UPDATED=false
for BACKUP_PATH in "${BACKUP_PATHS[@]}"; do
  if [ -f "$BACKUP_PATH" ]; then
    echo "Found backup script at $BACKUP_PATH"
    
    # Create backup
    cp "$BACKUP_PATH" "$BACKUP_PATH.bak.$(date +%Y%m%d%H%M%S)"
    
    # Update password in backup script
    sed -i "s/MYSQL_PASSWORD=\".*\"/MYSQL_PASSWORD=\"$NEW_PASSWORD\"/" "$BACKUP_PATH"
    
    echo -e "${GREEN}✅ Updated $BACKUP_PATH and created backup${NC}"
    BACKUP_FILE_UPDATED=true
  fi
done

if [ "$BACKUP_FILE_UPDATED" = false ]; then
  echo -e "${YELLOW}No backup scripts found.${NC}"
fi

# Step 4: Restart the application
echo ""
echo -e "${YELLOW}Step 4: Restarting the application server...${NC}"

# Check for PM2
if command -v pm2 &> /dev/null; then
  PM2_PROCESSES=$(pm2 list | grep -E 'vvf|waitlist')
  
  if [ -n "$PM2_PROCESSES" ]; then
    echo "Restarting PM2 processes..."
    pm2 restart all
    echo -e "${GREEN}✅ Application server restarted${NC}"
  else
    echo -e "${RED}⚠️ No matching PM2 processes found.${NC}"
    echo -e "${YELLOW}You may need to manually restart your application server.${NC}"
  fi
else
  echo -e "${RED}⚠️ PM2 not found.${NC}"
  echo -e "${YELLOW}You'll need to manually restart your application server.${NC}"
fi

# Final instructions
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ MySQL Password Reset Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}New MySQL Password: $NEW_PASSWORD${NC}"
echo -e "${RED}IMPORTANT: Save this password securely!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test your application to ensure it's working correctly"
echo "2. If there are issues, you can find backups at:"
if [ "$SERVER_FILE_UPDATED" = true ]; then
  echo "   - Server config: $SERVER_PATH.bak.*"
fi
if [ "$BACKUP_FILE_UPDATED" = true ]; then
  echo "   - Backup script: $BACKUP_PATH.bak.*"
fi
echo ""
echo -e "${YELLOW}For additional troubleshooting, run:${NC}"
echo "  - Check MySQL status: sudo systemctl status mysql"
echo "  - Check application logs: pm2 logs"
echo "  - Test database connection: mysql -u vvf_user -p"
