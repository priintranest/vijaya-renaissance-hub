#!/bin/bash
# Enhanced deployment script for Vijaya Renaissance Hub waitlist application
# To be run on your production server

# Exit on error
set -e

# Configuration - MODIFY THESE VARIABLES
DOMAIN="thevvf.org"  # Your domain
MYSQL_USER="vvf_user"
MYSQL_PASSWORD="your_production_password_here"  # Change this!
MYSQL_DATABASE="vvf_waitlist"
ADMIN_TOKEN="your_secure_admin_token_here"  # Change this!
APP_DIR="/var/www/vvf-waitlist"
BACKUP_DIR="/var/backups/vvf-waitlist"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Show banner
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Vijaya Renaissance Hub Deployment Tool   ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Check if running as root/sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root or with sudo${NC}"
   exit 1
fi

echo -e "${YELLOW}Starting deployment process...${NC}"

# Create directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/server
mkdir -p $APP_DIR/public
mkdir -p $BACKUP_DIR

# Set up MySQL
echo -e "${YELLOW}Setting up MySQL database...${NC}"
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE;
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'localhost';
FLUSH PRIVILEGES;

USE $MYSQL_DATABASE;
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  interest TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_submitted_at (submitted_at)
);
EOF

echo -e "${GREEN}✅ Database setup complete${NC}"

# Update server-mysql.js with production settings
echo -e "${YELLOW}Updating server configuration...${NC}"
cat > $APP_DIR/server/server-mysql.js << EOF
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../public')));

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: '$MYSQL_USER',
  password: '$MYSQL_PASSWORD',
  database: '$MYSQL_DATABASE',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    // Ensure table exists
    await pool.execute(\`
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        interest TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_submitted_at (submitted_at)
      )
    \`);
    console.log('✅ Database table ready');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Run the connection test
testConnection();

// API Routes
// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Public waitlist submission
app.post('/api/waitlist', async (req, res) => {
  const { name, email, phone, interest } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name and email are required' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please enter a valid email address' 
    });
  }

  try {
    // Insert new waitlist entry
    const [result] = await pool.execute(
      'INSERT INTO waitlist_entries (name, email, phone, interest) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, interest || null]
    );

    console.log(\`✅ New waitlist entry: \${email} (ID: \${result.insertId})\`);

    res.status(201).json({
      success: true,
      message: 'Successfully added to waitlist!',
      id: result.insertId
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'This email is already registered on our waitlist.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process your request. Please try again.'
    });
  }
});

// Admin waitlist data endpoint - secured by secret token
app.get('/api/admin/waitlist', async (req, res) => {
  // Simple token-based security
  const adminToken = req.headers['admin-token'];
  const validToken = '$ADMIN_TOKEN'; // Secure admin token
  
  if (!adminToken || adminToken !== validToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  
  try {
    // Get all waitlist entries
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, interest, submitted_at FROM waitlist_entries ORDER BY submitted_at DESC'
    );
    
    res.json({
      success: true,
      entries: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching waitlist entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch waitlist data'
    });
  }
});

// Catch-all route to return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`💼 VVF Waitlist server running on port \${PORT}\`);
  console.log(\`📊 Database: MySQL (\${dbConfig.database})\`);
  console.log(\`🏥 Health check: http://localhost:\${PORT}/api/health\`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\n💤 Gracefully shutting down...');
  
  try {
    // Close the connection pool
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
  
  process.exit(0);
});
EOF
echo -e "${GREEN}✅ Server configuration updated${NC}"

# Create backup script
echo -e "${YELLOW}Creating database backup script...${NC}"
cat > $APP_DIR/server/backup.sh << EOF
#!/bin/bash
TIMESTAMP=\$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="$BACKUP_DIR"
MYSQL_USER="$MYSQL_USER"
MYSQL_PASSWORD="$MYSQL_PASSWORD"
DATABASE="$MYSQL_DATABASE"

# Create backup directory if it doesn't exist
mkdir -p \$BACKUP_DIR

# Create MySQL backup
mysqldump -u\$MYSQL_USER -p\$MYSQL_PASSWORD \$DATABASE > \$BACKUP_DIR/vvf_waitlist_\$TIMESTAMP.sql

# Compress the backup
gzip \$BACKUP_DIR/vvf_waitlist_\$TIMESTAMP.sql

# Keep only the last 30 backups
find \$BACKUP_DIR -name "vvf_waitlist_*.sql.gz" -type f -mtime +30 -delete

echo "Backup completed: \$BACKUP_DIR/vvf_waitlist_\$TIMESTAMP.sql.gz"
EOF
chmod +x $APP_DIR/server/backup.sh

# Setup cron job for daily backups
echo -e "${YELLOW}Setting up daily backups...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/server/backup.sh") | crontab -

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root $APP_DIR/public;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo -e "${GREEN}✅ Nginx configured${NC}"

# Install PM2 if not already installed
echo -e "${YELLOW}Setting up PM2 process manager...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Setup PM2 for the server
cd $APP_DIR/server
npm install express cors mysql2
pm2 start server-mysql.js --name "vvf-waitlist"
pm2 save
pm2 startup

# Setup SSL with Let's Encrypt
echo -e "${YELLOW}Setting up SSL with Let's Encrypt...${NC}"
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi
certbot --nginx -d $DOMAIN -d www.$DOMAIN

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo "Admin Token: $ADMIN_TOKEN"
echo ""
echo "Website: https://$DOMAIN"
echo "Admin Panel: https://$DOMAIN/admin"
echo "API Health Check: https://$DOMAIN/api/health"
echo ""
echo -e "${YELLOW}Server Management:${NC}"
echo "View server logs: pm2 logs vvf-waitlist"
echo "Monitor server: pm2 monit"
echo "Restart server: pm2 restart vvf-waitlist"
echo ""
echo -e "${RED}IMPORTANT: Save your admin token securely!${NC}"
echo -e "${RED}You'll need it to access the admin panel.${NC}"
