#!/bin/bash

# Debug script for VVF Waitlist application
echo "🔍 Debugging VVF Waitlist application..."

# Check MySQL status
echo -e "\n📊 MySQL Status:"
systemctl status mysql | grep -E "Active:|Status:"

# Check if MySQL user and database exist
echo -e "\n📊 MySQL Database:"
mysql -e "SHOW DATABASES LIKE 'vvf_waitlist';"
mysql -e "SELECT user FROM mysql.user WHERE user='vvf_user';"

# Check backend status
echo -e "\n🚀 Backend Status:"
if command -v pm2 &> /dev/null; then
    pm2 list | grep vvf-backend
    echo "Latest logs:"
    pm2 logs vvf-backend --lines 10
else
    echo "❌ PM2 is not installed"
fi

# Check Nginx configuration
echo -e "\n🌐 Nginx Configuration:"
if [ -f /etc/nginx/sites-available/vvf-waitlist ]; then
    echo "✅ Nginx config file exists"
    nginx -t 2>&1
else
    echo "❌ Nginx config file is missing"
fi

# Check port 3001
echo -e "\n🔌 Port 3001 Status:"
netstat -tuln | grep 3001 || echo "❌ No service running on port 3001"

# Test API directly
echo -e "\n🔌 Testing API directly:"
curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com"}' http://localhost:3001/api/waitlist
echo " (Expected: 200 OK)"

# Test API through Nginx
echo -e "\n🌐 Testing API through Nginx:"
curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com"}' http://localhost/api/waitlist
echo " (Expected: 200 OK)"

echo -e "\n✅ Debug complete. If any issues were found, refer to the deployment guide to fix them."
