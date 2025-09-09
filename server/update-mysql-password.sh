#!/bin/bash
# Script to update MySQL password on your server

# Set the new password
NEW_PASSWORD="your_new_secure_password"  # CHANGE THIS to your desired password

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}MySQL Password Update Script${NC}"
echo -e "${YELLOW}===========================${NC}"

# 1. Update root password (if needed)
echo -e "${YELLOW}Do you want to update the MySQL root password? (y/n)${NC}"
read -p "Enter choice: " UPDATE_ROOT

if [[ $UPDATE_ROOT == "y" || $UPDATE_ROOT == "Y" ]]; then
    echo -e "${YELLOW}Enter current MySQL root password:${NC}"
    read -s CURRENT_ROOT_PASSWORD
    
    echo -e "${YELLOW}Enter new MySQL root password:${NC}"
    read -s NEW_ROOT_PASSWORD
    
    echo -e "${YELLOW}Updating root password...${NC}"
    mysql -u root -p"$CURRENT_ROOT_PASSWORD" <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_ROOT_PASSWORD';
FLUSH PRIVILEGES;
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Root password updated successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to update root password. Check your current password and try again.${NC}"
        exit 1
    fi
    
    # Use the new root password for the next steps
    ROOT_PASSWORD=$NEW_ROOT_PASSWORD
else
    echo -e "${YELLOW}Enter your MySQL root password:${NC}"
    read -s ROOT_PASSWORD
fi

# 2. Update the application database user password
echo -e "${YELLOW}Updating vvf_user password...${NC}"
mysql -u root -p"$ROOT_PASSWORD" <<EOF
ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ vvf_user password updated successfully!${NC}"
else
    echo -e "${RED}❌ Failed to update vvf_user password. Check your root password and try again.${NC}"
    exit 1
fi

# 3. Update the server configuration files
echo -e "${YELLOW}Updating server configuration files...${NC}"

# Update server-mysql.js
if [ -f "/var/www/vvf-waitlist/server/server-mysql.js" ]; then
    echo -e "${YELLOW}Updating server-mysql.js...${NC}"
    # Create a backup
    cp /var/www/vvf-waitlist/server/server-mysql.js /var/www/vvf-waitlist/server/server-mysql.js.bak
    
    # Replace the password
    sed -i "s/password: '.*',/password: '$NEW_PASSWORD',/" /var/www/vvf-waitlist/server/server-mysql.js
    
    echo -e "${GREEN}✅ Updated server-mysql.js and created backup${NC}"
else
    echo -e "${RED}❌ server-mysql.js not found in the expected location.${NC}"
fi

# Update config.js if it exists
if [ -f "/var/www/vvf-waitlist/server/config.js" ]; then
    echo -e "${YELLOW}Updating config.js...${NC}"
    # Create a backup
    cp /var/www/vvf-waitlist/server/config.js /var/www/vvf-waitlist/server/config.js.bak
    
    # Replace the password
    sed -i "s/password: '.*',/password: '$NEW_PASSWORD',/" /var/www/vvf-waitlist/server/config.js
    
    echo -e "${GREEN}✅ Updated config.js and created backup${NC}"
fi

# Update backup script
if [ -f "/var/www/vvf-waitlist/server/backup.sh" ]; then
    echo -e "${YELLOW}Updating backup.sh...${NC}"
    # Create a backup
    cp /var/www/vvf-waitlist/server/backup.sh /var/www/vvf-waitlist/server/backup.sh.bak
    
    # Replace the password
    sed -i "s/MYSQL_PASSWORD=\".*\"/MYSQL_PASSWORD=\"$NEW_PASSWORD\"/" /var/www/vvf-waitlist/server/backup.sh
    
    echo -e "${GREEN}✅ Updated backup.sh and created backup${NC}"
else
    echo -e "${RED}❌ backup.sh not found in the expected location.${NC}"
fi

# 4. Restart the application server
echo -e "${YELLOW}Restarting the application server...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart vvf-waitlist
    echo -e "${GREEN}✅ Application server restarted${NC}"
else
    echo -e "${RED}❌ PM2 not found. Please restart your application server manually.${NC}"
fi

echo -e "${GREEN}✅ Password update complete!${NC}"
echo -e "${YELLOW}New password for vvf_user: $NEW_PASSWORD${NC}"
echo -e "${YELLOW}Please save this password securely.${NC}"
echo ""
echo -e "${YELLOW}Please test your application to ensure it's working correctly.${NC}"
echo -e "${YELLOW}If there are any issues, you can restore from the backups:${NC}"
echo "  - Server config: /var/www/vvf-waitlist/server/server-mysql.js.bak"
echo "  - Backup script: /var/www/vvf-waitlist/server/backup.sh.bak"
if [ -f "/var/www/vvf-waitlist/server/config.js" ]; then
    echo "  - Config file: /var/www/vvf-waitlist/server/config.js.bak"
fi
