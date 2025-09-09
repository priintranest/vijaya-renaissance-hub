#!/bin/bash
# Script to change MySQL password to "1001" on production server

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# The specific password you want to set
NEW_PASSWORD="1001"

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}  Change MySQL Password to '1001'  ${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""

# Prompt for current MySQL root password
echo -e "${YELLOW}Do you know the current MySQL root password? (y/n)${NC}"
read -p "Enter (y/n): " KNOW_PASSWORD

if [[ "$KNOW_PASSWORD" == "y" || "$KNOW_PASSWORD" == "Y" ]]; then
    # User knows the current password
    echo -e "${YELLOW}Enter current MySQL root password:${NC}"
    read -s CURRENT_PASSWORD
    echo ""
    
    # Try to access MySQL with the provided password
    if mysql -u root -p"$CURRENT_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ MySQL root password is correct.${NC}"
        
        # Change MySQL user passwords
        echo -e "${YELLOW}Changing passwords to '1001'...${NC}"
        mysql -u root -p"$CURRENT_PASSWORD" <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ MySQL passwords changed successfully!${NC}"
        else
            echo -e "${RED}❌ Failed to change MySQL passwords.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Incorrect MySQL root password.${NC}"
        echo -e "${YELLOW}Switching to password reset method...${NC}"
        KNOW_PASSWORD="n"
    fi
fi

# If user doesn't know the password or entered it incorrectly
if [[ "$KNOW_PASSWORD" == "n" || "$KNOW_PASSWORD" == "N" ]]; then
    # Reset MySQL root password using the sudo method
    echo -e "${YELLOW}Resetting MySQL password using sudo method...${NC}"
    
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
    echo "Updating root password to '1001'..."
    sudo mysql -u root <<EOF
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
    
    # Update vvf_user password
    echo "Updating vvf_user password to '1001'..."
    mysql -u root -p"$NEW_PASSWORD" <<EOF
ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF
    
    echo -e "${GREEN}✅ MySQL passwords reset to '1001' successfully!${NC}"
fi

# Update configuration files
echo -e "${YELLOW}Updating configuration files with the new password...${NC}"

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
  fi
done

if [ "$SERVER_FILE_UPDATED" = false ]; then
  echo -e "${RED}⚠️ Could not find server-mysql.js file.${NC}"
  echo -e "${YELLOW}Please manually update these locations with password '$NEW_PASSWORD':${NC}"
  for SERVER_PATH in "${SERVER_PATHS[@]}"; do
    echo "  - $SERVER_PATH"
  done
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

# Restart the application server
echo -e "${YELLOW}Restarting the application server...${NC}"

# Check for PM2
if command -v pm2 &> /dev/null; then
  echo "Restarting all PM2 processes..."
  pm2 restart all
  echo -e "${GREEN}✅ Application server restarted${NC}"
else
  echo -e "${RED}⚠️ PM2 not found.${NC}"
  echo -e "${YELLOW}Please manually restart your application server.${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ MySQL password changed to '1001' successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Remember to use this password for future MySQL access.${NC}"
echo ""
echo -e "${YELLOW}To test the connection:${NC}"
echo "  - Connect to MySQL: mysql -u root -p1001"
echo "  - Check application logs: pm2 logs"
echo "  - Monitor application: pm2 monit"
