# VVF Waitlist - Database Deployment Guide

## 🚀 Complete MySQL Database Setup for Digital Ocean Droplet

### **Database Architecture**
- **Database**: MySQL
- **Table**: `waitlist_entries`
- **Fields**: id, name, email, phone, interest, submitted_at
- **Location**: MySQL Server running on the same host
- **Backups**: Automatic daily backups to `/var/www/vvf-waitlist/server/backups/`

---

## 📋 Step-by-Step Deployment

### **Step 1: Prepare Your Files**
```bash
# From your local machine, upload the entire project
scp -r vijaya-renaissance-hub/ root@your-server-ip:/tmp/
```

### **Step 2: Initial Server Setup**
```bash
# Connect to your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install MySQL
apt install -y mysql-server
```

### **Step 3: Setup Project Directory**
```bash
# Move project to web directory
mv /tmp/vijaya-renaissance-hub /var/www/vvf-waitlist
cd /var/www/vvf-waitlist

# Set proper permissions
chown -R www-data:www-data /var/www/vvf-waitlist
chmod -R 755 /var/www/vvf-waitlist
```

### **Step 4: Install Dependencies & Build**
```bash
# Install frontend dependencies
cd /var/www/vvf-waitlist
npm install

# Build frontend
npm run build

# Install backend dependencies
cd server
npm install

# Create required directories
mkdir -p backups logs
chmod 755 backups logs
```

### **Step 5: Setup MySQL Database**
```bash
# Secure MySQL installation
mysql_secure_installation

# Log in to MySQL
mysql -u root

# Create database and user
CREATE DATABASE vvf_waitlist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vvf_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON vvf_waitlist.* TO 'vvf_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Test connection
mysql -u vvf_user -p'your_secure_password_here' -e "SHOW DATABASES;"
```

### **Step 6: Start Backend Service**
```bash
# Create PM2 ecosystem file
cat > /var/www/vvf-waitlist/server/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vvf-backend',
    script: 'server.js',
    cwd: '/var/www/vvf-waitlist/server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/www/vvf-waitlist/server/logs/error.log',
    out_file: '/var/www/vvf-waitlist/server/logs/output.log',
    log_file: '/var/www/vvf-waitlist/server/logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
}
EOF

# Start the backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Step 7: Configure Nginx**
```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/vvf-waitlist << 'EOF'
server {
    listen 80;
    server_name thevvf.org www.thevvf.org;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API routes - proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files
    location / {
        root /var/www/vvf-waitlist/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Logs
    access_log /var/log/nginx/vvf-access.log;
    error_log /var/log/nginx/vvf-error.log;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/vvf-waitlist /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### **Step 8: Setup SSL Certificate**
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (make sure DNS is pointed to your server first)
certbot --nginx -d thevvf.org -d www.thevvf.org
```

### **Step 9: Setup Automatic Backups**
```bash
# Create backup script
cat > /var/www/vvf-waitlist/server/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/vvf-waitlist/server/backups"
DB_NAME="vvf_waitlist"
DB_USER="vvf_user"
DB_PASS="your_secure_password_here"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/waitlist_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Keep only last 30 backups
find "$BACKUP_DIR" -name "waitlist_backup_*.sql.gz" -mtime +30 -delete

echo "✅ Database backup completed: ${BACKUP_FILE}.gz"
EOF

chmod +x /var/www/vvf-waitlist/server/backup-db.sh

# Add to crontab for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/vvf-waitlist/server/backup-db.sh") | crontab -
```

---

## 🔧 **API Endpoints Available**

### **Public Endpoints:**
- `POST /api/waitlist` - Submit waitlist entry
- `GET /api/health` - Health check

### **Admin Endpoints:**
- `GET /api/waitlist` - Get all entries
- `GET /api/waitlist/export` - Export as CSV
- `DELETE /api/waitlist` - Clear all entries
- `GET /api/admin/stats` - Get statistics

---

## ✅ **Verification Steps**

### **Test Database Connection:**
```bash
# Check if database exists and has correct structure
mysql -u vvf_user -p'your_secure_password_here' -e "DESCRIBE vvf_waitlist.waitlist_entries;"

# Test API endpoints
curl -X GET https://thevvf.org/api/health
curl -X POST https://thevvf.org/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"123456789","interest":"General"}'
```

### **Check Services:**
```bash
# Check backend status
pm2 status
pm2 logs vvf-backend

# Check Nginx status
systemctl status nginx

# Check MySQL status
systemctl status mysql
```

---

## �️ **Database Management**

### **View Database Contents:**
```bash
# Connect to database
mysql -u vvf_user -p'your_secure_password_here' vvf_waitlist

# View all entries
SELECT * FROM waitlist_entries ORDER BY submitted_at DESC;

# Count entries
SELECT COUNT(*) FROM waitlist_entries;

# Exit
EXIT;
```

### **Manual Backup:**
```bash
# Create immediate backup
/var/www/vvf-waitlist/server/backup-db.sh

# List backups
ls -la /var/www/vvf-waitlist/server/backups/
```

### **Restore from Backup:**
```bash
# Stop backend service
pm2 stop vvf-backend

# Restore database (replace TIMESTAMP with actual backup date)
gunzip -c /var/www/vvf-waitlist/server/backups/waitlist_backup_TIMESTAMP.sql.gz > /tmp/restore.sql
mysql -u vvf_user -p'your_secure_password_here' vvf_waitlist < /tmp/restore.sql
rm /tmp/restore.sql

# Restart backend
pm2 start vvf-backend
```

### **MySQL Performance Tuning**

For optimal performance, you may need to adjust MySQL configuration:

```bash
# Edit MySQL configuration
nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add or modify these settings for a small server:

```
# MySQL Performance Settings
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 64M
```

Restart MySQL after changes:

```bash
systemctl restart mysql
```

---

## 🔒 **Security Best Practices**

1. **Secure MySQL:**
   - Keep MySQL password in environment variables instead of hardcoding it
   - Regularly update MySQL password

2. **Enable Firewall:**
```bash
# Set up basic firewall rules
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

3. **Secure Nginx:**
```bash
# Add stronger security headers
nano /etc/nginx/sites-available/vvf-waitlist
```

Add these security headers:
```
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

4. **Setup fail2ban:**
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 🛠️ **Maintenance Tasks**

### **Server Updates:**
```bash
# Regular system updates
apt update && apt upgrade -y

# Restart services when needed
systemctl restart nginx
systemctl restart mysql
pm2 restart vvf-backend
```

### **Log Rotation:**
```bash
# Install logrotate if not installed
apt install -y logrotate

# Configure logrotate for your logs
cat > /etc/logrotate.d/vvf-waitlist << 'EOF'
/var/www/vvf-waitlist/server/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### **Monitor Disk Space:**
```bash
# Check disk usage
df -h

# Check database size
mysql -u vvf_user -p'your_secure_password_here' -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'vvf_waitlist' GROUP BY table_schema;"
```

---

## 📋 **Migration from SQLite to MySQL**

If you've previously been using SQLite and are migrating to MySQL, follow these steps to transfer your existing data:

1. **Export SQLite data to CSV:**
```bash
cd /var/www/vvf-waitlist/server
sqlite3 -header -csv data/waitlist.db "SELECT name, email, phone, interest, submitted_at FROM waitlist_entries;" > export.csv
```

2. **Import to MySQL:**
```bash
# Create a loading SQL file
cat > import.sql << 'EOF'
LOAD DATA LOCAL INFILE '/var/www/vvf-waitlist/server/export.csv'
INTO TABLE waitlist_entries
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(name, email, phone, interest, submitted_at);
EOF

# Enable local infile
mysql -u vvf_user -p'your_secure_password_here' --local-infile=1 vvf_waitlist < import.sql

# Verify data
mysql -u vvf_user -p'your_secure_password_here' -e "SELECT COUNT(*) FROM vvf_waitlist.waitlist_entries;"
```

3. **Clean up:**
```bash
rm export.csv import.sql
```
```

---

## 🎯 **Your Site is Now Live!**

✅ **Frontend**: https://thevvf.org/  
✅ **API**: https://thevvf.org/api/  
✅ **Admin Dashboard**: https://thevvf.org/admin  
✅ **Database**: SQLite with automatic backups  
✅ **SSL**: HTTPS enabled  

### **Maintenance URLs:**
- **Enable maintenance**: `https://thevvf.org/secret-maintenance-enable-vvf2025`
- **Disable maintenance**: `https://thevvf.org/secret-maintenance-disable-vvf2025`

Your VVF Waitlist application is now running with a proper database on Digital Ocean! 🎉

export const submitWaitlist = async (data: WaitlistData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit');
    }

    return { success: true, message: 'Successfully joined the waitlist!' };
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to submit. Please try again.' 
    };
  }
};
```

### Update Database Service (`src/lib/database.ts`)
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thevvf.org/api' 
  : 'http://localhost:3001/api';

export const getWaitlistEntries = async (): Promise<WaitlistEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`);
    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return [];
  }
};

export const clearAllEntries = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to clear entries:', error);
    return false;
  }
};

export const exportToCSV = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist/export`);
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return '';
  }
};
```

---

## 🌟 Post-Deployment Checklist

### ✅ Verify Everything is Working
```bash
# Check backend service status
pm2 status

# Check nginx status
sudo systemctl status nginx

# Test API endpoints
curl https://thevvf.org/api/waitlist
curl https://thevvf.org/api/health

# Check logs
pm2 logs vvf-backend
sudo tail -f /var/log/nginx/vvf-waitlist-access.log
```

### ✅ Security & Performance
```bash
# Set up SSL with Let's Encrypt (optional but recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d thevvf.org

# Set up firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### ✅ Monitoring & Maintenance
```bash
# View database entries
sqlite3 /var/www/vvf-waitlist/server/data/waitlist.db "SELECT * FROM waitlist_entries;"

# Manual backup
curl http://localhost:3001/api/backup

# Check backup files
ls -la /var/backups/vvf-waitlist/

# Restart services if needed
pm2 restart vvf-backend
sudo systemctl restart nginx
```

---

## 📊 Available API Endpoints

- `GET /api/health` - Health check
- `POST /api/waitlist` - Submit waitlist entry
- `GET /api/waitlist` - Get all entries (admin)
- `DELETE /api/waitlist` - Clear all entries (admin)
- `GET /api/waitlist/export` - Export entries as CSV
- `POST /api/backup` - Manual database backup

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
pm2 logs vvf-backend
# Check for port conflicts or missing dependencies
```

### Frontend not loading?
```bash
sudo nginx -t
sudo systemctl status nginx
# Check nginx configuration and file permissions
```

### Database issues?
```bash
ls -la /var/www/vvf-waitlist/server/data/
# Ensure directory exists and has proper permissions
```

### Can't access from browser?
```bash
# Check firewall settings
sudo ufw status
# Ensure ports 80 and 443 are open
```

---

## 🔄 Updating Your Application

```bash
# 1. Upload new files
rsync -avz --exclude=node_modules --exclude=dist your-local-project/ root@your-server-ip:/var/www/vvf-waitlist/

# 2. Rebuild and restart
cd /var/www/vvf-waitlist
npm run build
pm2 restart vvf-backend

# 3. Reload nginx if config changed
sudo systemctl reload nginx
```

---

## 📞 Support

If you encounter any issues:
1. Check the logs: `pm2 logs vvf-backend`
2. Verify nginx config: `sudo nginx -t`
3. Check service status: `pm2 status` and `sudo systemctl status nginx`
4. Ensure all file permissions are correct
5. Verify your domain DNS settings (if using a domain)

Your VVF Waitlist application should now be running successfully on your Digital Ocean droplet! 🎉
