# Production Deployment Guide for Vijaya Renaissance Hub Waitlist

This guide walks through the steps to deploy the Vijaya Renaissance Hub waitlist application to your production server.

## Prerequisites

- A server running Ubuntu (Digital Ocean droplet or similar)
- Domain name configured to point to your server (e.g., thevvf.org)
- Root or sudo access to the server
- MySQL installed on your server
- Node.js and npm installed on your server
- Nginx installed on your server

## Deployment Steps

### 1. Prepare the Local Build

```bash
# Build the React application locally
cd /path/to/vijaya-renaissance-hub
npm run build
```

### 2. Upload Files to Server

Use SCP or SFTP to upload the following to your server:

```bash
# Upload the built frontend files
scp -r ./dist/* user@your-server:/var/www/thevvf.org/

# Upload the server files
scp -r ./server/* user@your-server:/opt/vvf-waitlist/
```

### 3. Configure MySQL on Production Server

Connect to your server and set up the MySQL database:

```bash
# SSH into your server
ssh user@your-server

# Log in to MySQL as root
mysql -u root -p

# Create the database, user, and tables
CREATE DATABASE vvf_waitlist;
CREATE USER 'vvf_user'@'localhost' IDENTIFIED BY 'your-secure-production-password';
GRANT ALL PRIVILEGES ON vvf_waitlist.* TO 'vvf_user'@'localhost';
FLUSH PRIVILEGES;
USE vvf_waitlist;
CREATE TABLE waitlist_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  interest TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_submitted_at (submitted_at)
);
EXIT;
```

#### Updating MySQL Password

If you need to update the MySQL password later, you can use the provided script:

```bash
# Upload the script to your server
scp server/update-mysql-password.sh user@your-server:/var/www/vvf-waitlist/server/

# SSH into your server
ssh user@your-server

# Make the script executable
cd /var/www/vvf-waitlist/server
chmod +x update-mysql-password.sh

# Edit the script to set your desired new password
nano update-mysql-password.sh
# Change the NEW_PASSWORD variable at the top of the file

# Run the script
./update-mysql-password.sh
```

The script will:
1. Update the MySQL user password
2. Update all configuration files with the new password
3. Restart the application server
4. Create backups of all modified files

#### Resetting a Forgotten MySQL Password

If you've forgotten your MySQL password on the production server, use the dedicated password reset script:

```bash
# Upload the reset script to your server
scp server/reset-mysql-password.sh user@your-server:/tmp/

# SSH into your server
ssh user@your-server

# Make the script executable and run it
cd /tmp
chmod +x reset-mysql-password.sh
sudo ./reset-mysql-password.sh
```

The reset script will:
1. Reset the MySQL root password using the safe mode method
2. Update the application user password
3. Update all configuration files
4. Restart services
5. Create backups of modified files

For more detailed instructions, see the `RESET-MYSQL-PASSWORD.md` guide.

### 4. Configure the Server Application

Edit the server-mysql.js file to use production settings:

```bash
# Edit the server configuration
cd /opt/vvf-waitlist
nano server-mysql.js
```

Update the database configuration section:

```javascript
// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'vvf_user',
  password: 'your-secure-production-password', // Your secure production password
  database: 'vvf_waitlist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
```

Update the admin token for production:

```javascript
// Change this to a secure random string
const validToken = 'your-secure-random-admin-token';
```

### 5. Install Node.js Dependencies on Server

```bash
# Install dependencies
cd /opt/vvf-waitlist
npm install express cors mysql2
```

### 6. Configure Nginx

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/thevvf.org
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name thevvf.org www.thevvf.org;

    # Frontend static files
    location / {
        root /var/www/thevvf.org;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/thevvf.org /etc/nginx/sites-enabled/
sudo nginx -t  # Test the configuration
sudo systemctl reload nginx
```

### 7. Set Up PM2 for Process Management

Install PM2 and set up the server to run as a service:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the server with PM2
cd /opt/vvf-waitlist
pm2 start server-mysql.js --name "vvf-waitlist"

# Make PM2 start on system boot
pm2 startup
# Copy and run the command it gives you
pm2 save
```

### 8. Set Up SSL with Let's Encrypt

Install Certbot and obtain an SSL certificate:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d thevvf.org -d www.thevvf.org
```

### 9. Test Your Deployment

Navigate to your website in a browser:
- Frontend: https://thevvf.org
- Admin page: https://thevvf.org/admin
- Health check: https://thevvf.org/api/health

### 10. Set Up Automated Backups

Create a script to back up the MySQL database:

```bash
# Create a backup script
sudo nano /opt/vvf-waitlist/backup.sh
```

Add the following content:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/opt/vvf-waitlist/backups"
MYSQL_USER="vvf_user"
MYSQL_PASSWORD="your-secure-production-password"
DATABASE="vvf_waitlist"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create MySQL backup
mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $DATABASE > $BACKUP_DIR/vvf_waitlist_$TIMESTAMP.sql

# Compress the backup
gzip $BACKUP_DIR/vvf_waitlist_$TIMESTAMP.sql

# Keep only the last 30 backups
find $BACKUP_DIR -name "vvf_waitlist_*.sql.gz" -type f -mtime +30 -delete
```

Make the script executable:

```bash
chmod +x /opt/vvf-waitlist/backup.sh
```

Add it to cron to run daily:

```bash
sudo crontab -e
```

Add the following line:

```
0 2 * * * /opt/vvf-waitlist/backup.sh
```

### 11. Monitoring and Logging

Set up PM2 monitoring:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Troubleshooting

### If the API is not accessible:
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs vvf-waitlist`
3. Verify Nginx configuration: `sudo nginx -t`
4. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### If database connections fail:
1. Check MySQL service: `sudo systemctl status mysql`
2. Verify database user: `mysql -u vvf_user -p`
3. Check server logs: `pm2 logs vvf-waitlist`

## Security Notes

1. The admin token should be a secure random string, not the default value.
2. Set strong passwords for the MySQL user.
3. Keep your server updated with security patches.
4. Consider adding rate limiting to the API endpoints.
5. Regularly back up your database.
