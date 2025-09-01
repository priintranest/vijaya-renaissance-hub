#!/bin/bash

# VVF Waitlist Deployment Script
# Run this script after uploading your project files

set -e  # Exit on any error

PROJECT_DIR="/var/www/vvf-waitlist"
BACKUP_DIR="/var/backups/vvf-waitlist"

echo "🚀 Starting VVF Waitlist Deployment..."

# Navigate to project directory
cd $PROJECT_DIR

# Create backup directory
echo "📁 Creating backup directory..."
mkdir -p $BACKUP_DIR

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd $PROJECT_DIR/server
npm install --production

# Build frontend
echo "🔨 Building frontend..."
cd $PROJECT_DIR
npm install
npm run build

# Set up database directory with proper permissions
echo "🗄️ Setting up database..."
mkdir -p $PROJECT_DIR/server/data
chmod 755 $PROJECT_DIR/server/data

# Initialize database (create tables)
echo "🔧 Initializing database..."
cd $PROJECT_DIR/server
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/waitlist.db');
db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS waitlist_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    interest TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )\`);
});
db.close();
console.log('Database initialized successfully!');
"

# Configure PM2 ecosystem file
echo "⚙️ Configuring PM2..."
cat > $PROJECT_DIR/server/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vvf-backend',
    script: './server.js',
    cwd: '/var/www/vvf-waitlist/server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/vvf-backend-error.log',
    out_file: '/var/log/pm2/vvf-backend-out.log',
    log_file: '/var/log/pm2/vvf-backend.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M'
  }]
}
EOF

# Create PM2 log directory
mkdir -p /var/log/pm2

# Start the backend with PM2
echo "🚀 Starting backend service..."
pm2 start $PROJECT_DIR/server/ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cp $PROJECT_DIR/server/nginx.conf /etc/nginx/sites-available/vvf-waitlist
ln -sf /etc/nginx/sites-available/vvf-waitlist /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

# Set up log rotation for application logs
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/vvf-waitlist << 'EOF'
/var/log/pm2/vvf-backend*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Set up automatic database backup cron job
echo "⏰ Setting up automatic backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/curl -s http://localhost:3001/api/backup > /dev/null") | crontab -

# Set proper permissions
chown -R www-data:www-data $PROJECT_DIR/dist
chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR/server
chmod +x $PROJECT_DIR/server/ecosystem.config.js

echo "✅ Deployment completed successfully!"
echo ""
echo "🌟 Your VVF Waitlist application is now running!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🔗 Access your application:"
echo "  - Frontend: https://thevvf.org/"
echo "  - API: https://thevvf.org/api/"
echo ""
echo "📋 Important files and commands:"
echo "  - Frontend files: /var/www/vvf-waitlist/dist/"
echo "  - Backend files: /var/www/vvf-waitlist/server/"
echo "  - Database: /var/www/vvf-waitlist/server/data/waitlist.db"
echo "  - Nginx config: /etc/nginx/sites-available/vvf-waitlist"
echo "  - PM2 status: pm2 status"
echo "  - View logs: pm2 logs vvf-backend"
echo "  - Manual backup: curl http://localhost:3001/api/backup"
echo ""
echo "🔧 Next steps:"
echo "1. Point your domain's DNS to this server's IP address"
echo "2. Set up SSL with Let's Encrypt: sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d thevvf.org"
echo "3. Update your frontend API calls to use the production URL"
