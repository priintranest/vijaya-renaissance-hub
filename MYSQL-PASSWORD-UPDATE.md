# MySQL Password Update Guide

This guide explains how to update the MySQL password for your Vijaya Renaissance Hub waitlist application in both development and production environments.

## Why Update MySQL Passwords?

1. **Security**: Regularly updating passwords is a good security practice
2. **Production deployment**: Before deploying to production, you should set a strong, unique password
3. **Credentials rotation**: If you're concerned about potential unauthorized access

## Option 1: Using the Automated Script (Production Server)

The easiest way to update your MySQL password on your production server is to use the provided script.

1. **Upload the script to your server**:
   ```bash
   scp server/update-mysql-password.sh user@your-server:/var/www/vvf-waitlist/server/
   ```

2. **Make the script executable**:
   ```bash
   ssh user@your-server
   cd /var/www/vvf-waitlist/server
   chmod +x update-mysql-password.sh
   ```

3. **Edit the script to set your desired new password**:
   ```bash
   nano update-mysql-password.sh
   ```
   Change the `NEW_PASSWORD` variable at the top of the file.

4. **Run the script**:
   ```bash
   ./update-mysql-password.sh
   ```

5. **Follow the prompts** to update your MySQL passwords.

## Option 2: Manual Update (Development or Production)

If you prefer to update the password manually or are working in your development environment, follow these steps:

### Step 1: Update the MySQL User Password

1. **Connect to MySQL as root**:
   ```bash
   mysql -u root -p
   ```

2. **Change the password for the vvf_user**:
   ```sql
   ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY 'your_new_secure_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Step 2: Update Configuration Files

1. **Update the server configuration**:
   ```bash
   # In development (local)
   cd path/to/vijaya-renaissance-hub/server
   
   # Edit server-mysql.js
   # Find this section:
   const dbConfig = {
     host: 'localhost',
     user: 'vvf_user',
     password: 'old_password', // Change this line
     database: 'vvf_waitlist',
     ...
   };
   ```

2. **Update the backup script** (if applicable):
   ```bash
   # Edit backup.sh or any other scripts that use the MySQL password
   # Change MYSQL_PASSWORD="old_password" to MYSQL_PASSWORD="your_new_secure_password"
   ```

### Step 3: Restart Services

1. **In development**, restart your local server:
   ```bash
   # Stop your current server (Ctrl+C) and restart it
   node server-mysql.js
   ```

2. **In production**, restart using PM2:
   ```bash
   pm2 restart vvf-waitlist
   ```

## Password Guidelines

When choosing a new MySQL password, follow these security best practices:

1. Use at least 12 characters
2. Include uppercase and lowercase letters, numbers, and special characters
3. Avoid common words or easily guessable information
4. Don't reuse passwords from other services
5. Store the password securely (e.g., password manager)

## Testing After Password Update

After updating the password, verify that:

1. The server can connect to MySQL
2. Waitlist form submissions work correctly
3. Admin interface can retrieve entries
4. Backup scripts work properly

If anything fails, you can roll back to the previous password using the same steps.

## Local Development Setup

For your local development environment, you can update the MySQL password in the setup script as well:

1. **Update setup-local-mysql.sql**:
   ```sql
   -- Find this line:
   CREATE USER IF NOT EXISTS 'vvf_user'@'localhost' IDENTIFIED BY 'old_password';
   
   -- Change to:
   CREATE USER IF NOT EXISTS 'vvf_user'@'localhost' IDENTIFIED BY 'your_new_secure_password';
   ```

2. **Run the updated script**:
   ```bash
   mysql -u root -p < setup-local-mysql.sql
   ```
