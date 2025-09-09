# Reset Forgotten MySQL Password in Production

This guide will help you reset your MySQL password on your production server when you've forgotten it.

## Method 1: Using the Automated Script

We've created a script that automates the entire process of resetting your forgotten MySQL password. This is the recommended approach.

### Step 1: Upload the Script to Your Server

```bash
# From your local machine
scp server/reset-mysql-password.sh user@your-server-ip:/tmp/
```

### Step 2: Run the Script on Your Server

```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to the uploaded script
cd /tmp

# Make the script executable
chmod +x reset-mysql-password.sh

# Run the script
sudo ./reset-mysql-password.sh
```

### Step 3: Follow the Script Prompts

The script will:
1. Ask if you want to generate a random password or set your own
2. Reset the MySQL root password using the sudo method
3. Update the vvf_user password
4. Update all configuration files with the new password
5. Restart your application server
6. Create backups of all modified files

## Method 2: Manual Reset Process

If you prefer to manually reset your MySQL password, follow these steps:

### Step 1: Stop MySQL Service

```bash
sudo systemctl stop mysql
```

### Step 2: Start MySQL in Safe Mode

```bash
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

### Step 3: Reset Root Password

```bash
sudo mysql -u root
```

Once in the MySQL prompt:
```sql
USE mysql;
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Restart MySQL Normally

```bash
sudo mysqladmin -u root -p'your_new_password' shutdown
sudo systemctl start mysql
```

### Step 5: Update Application User Password

```bash
mysql -u root -p'your_new_password'
```

Once in the MySQL prompt:
```sql
ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Step 6: Update Application Configuration Files

Update your server configuration files with the new password:

```bash
# Find server configuration files
find /var/www -name "server-mysql.js" -o -name "config.js"

# Edit each file found to update the password
sudo nano /path/to/server-mysql.js
```

### Step 7: Restart Your Application

```bash
# If using PM2
pm2 restart all
```

## Important Notes

1. **Save your new password securely** in a password manager or secure location.
2. After resetting the password, verify that your application works correctly.
3. If you encounter issues, you can restore from the backup files created by the script.
4. This process requires sudo/root access to your server.

## Troubleshooting

If you encounter issues after resetting your MySQL password:

1. **Check MySQL status**:
   ```bash
   sudo systemctl status mysql
   ```

2. **Check application logs**:
   ```bash
   pm2 logs
   ```

3. **Test database connection**:
   ```bash
   mysql -u vvf_user -p
   ```

4. **Restore from backups** if needed:
   ```bash
   # Find backups
   find /var/www -name "*.bak.*"
   
   # Restore a backup
   cp /path/to/file.bak.20250909123456 /path/to/file
   ```
