#!/bin/bash

# Fix API configuration script
echo "🔧 Fixing API configuration for VVF Waitlist application..."

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
  echo "❌ This script must be run as root. Please use sudo."
  exit 1
fi

# Get the app directory
APP_DIR="/var/www/thevvf.org/app"
if [ ! -d "$APP_DIR" ]; then
  echo "❌ App directory not found: $APP_DIR"
  echo "Please enter the correct app directory path:"
  read APP_DIR
fi

# 1. Fix Nginx configuration
echo "1️⃣ Setting up Nginx configuration..."
NGINX_CONFIG="/etc/nginx/sites-available/vvf-waitlist"
cp nginx-config.conf "$NGINX_CONFIG"

# Check if the site is enabled and create symbolic link if it doesn't exist
if [ ! -f "/etc/nginx/sites-enabled/vvf-waitlist" ]; then
  echo "Creating symbolic link for Nginx site configuration..."
  ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
else
  echo "Nginx site configuration already enabled."
fi

# Make sure the default site is disabled if it's conflicting with our site
if [ -f "/etc/nginx/sites-enabled/default" ]; then
  echo "Disabling default Nginx site to prevent conflicts..."
  rm /etc/nginx/sites-enabled/default
fi

# Test and reload nginx
echo "Testing Nginx configuration..."
if nginx -t; then
  systemctl reload nginx
  echo "✅ Nginx configuration reloaded successfully."
else
  echo "❌ Nginx configuration test failed. Please check the errors above."
  exit 1
fi

# 2. Check if PM2 is installed
echo "2️⃣ Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# 3. Start the backend if needed
echo "3️⃣ Setting up backend server..."
cd "$APP_DIR/server" || { echo "❌ Failed to find server directory"; exit 1; }

# Create logs and backups directories if they don't exist
mkdir -p logs backups

# Check if backend is running
if ! pm2 list | grep -q "vvf-backend"; then
  echo "Starting backend server..."
  pm2 start server.js --name vvf-backend
  pm2 save
else
  echo "Restarting backend server..."
  pm2 restart vvf-backend
fi

# 4. Check MySQL connection
echo "4️⃣ Checking MySQL connection..."
cd "$APP_DIR/server" || { echo "❌ Failed to find server directory"; exit 1; }

# Make a copy of the actual server file to avoid modifying it
cp server.js check-mysql.js

# Create a small test script for MySQL connection
cat > test-db-connection.js << 'EOF'
const mysql = require('mysql2');
const dbConfig = {
  host: 'localhost',
  user: 'vvf_user',
  password: 'your_secure_password_here', 
  database: 'vvf_waitlist'
};

const connection = mysql.createConnection(dbConfig);

connection.connect(function(err) {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database successfully');
  
  connection.query('SELECT 1', function (err, results) {
    if (err) {
      console.error('❌ Query error:', err);
      process.exit(1);
    }
    console.log('✅ Query successful:', results);
    connection.end();
    process.exit(0);
  });
});
EOF

# Run the test script
node test-db-connection.js || {
  echo "❌ MySQL connection failed. Please check your MySQL configuration."
  echo "Ensure vvf_user exists and has access to vvf_waitlist database."
  echo ""
  echo "You can create the user and database with these commands:"
  echo "mysql -u root -p"
  echo "CREATE DATABASE vvf_waitlist;"
  echo "CREATE USER 'vvf_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';"
  echo "GRANT ALL PRIVILEGES ON vvf_waitlist.* TO 'vvf_user'@'localhost';"
  echo "FLUSH PRIVILEGES;"
  exit 1
}

# 5. Test API health endpoint
echo "5️⃣ Testing API health endpoint..."
HEALTH_RESULT=$(curl -s http://localhost:3001/api/health)
echo "API Health Check Result: $HEALTH_RESULT"

# 6. Test API endpoint directly
echo "6️⃣ Testing API endpoint directly..."
echo "Sending test submission to API directly..."
TIMESTAMP=$(date +%s)
DIRECT_RESULT=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"TestFix","email":"testfix-'$TIMESTAMP'@example.com"}' http://localhost:3001/api/waitlist)
echo "API Direct Test Result: $DIRECT_RESULT"

# 7. Test API endpoint through Nginx
echo "7️⃣ Testing API endpoint through Nginx..."
echo "Sending test submission through Nginx..."
TIMESTAMP=$(date +%s)
NGINX_RESULT=$(curl -v -X POST -H "Content-Type: application/json" -d '{"name":"TestNginx","email":"testnginx-'$TIMESTAMP'@example.com"}' http://localhost/api/waitlist 2>&1)
echo "API Through Nginx Test Result (Headers + Body):"
echo "$NGINX_RESULT"

# 8. Test CORS with preflight
echo "8️⃣ Testing CORS preflight..."
echo "Sending OPTIONS request to test CORS headers..."
CORS_RESULT=$(curl -v -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" http://localhost/api/waitlist 2>&1)
echo "CORS Preflight Test Result:"
echo "$CORS_RESULT"

echo "✅ Setup complete. Your API should now be working correctly."
echo "If you're still having issues, please check the logs:"
echo "- PM2 logs: pm2 logs vvf-backend"
echo "- Nginx error logs: cat /var/log/nginx/vvf-error.log"
echo "- API debug logs: cat /var/log/nginx/api-debug.log"
