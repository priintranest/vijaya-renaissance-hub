# MySQL Server Deployment Debug Guide

The production site is returning a 405 (Not Allowed) error and HTML content instead of JSON. Here are troubleshooting steps to fix this issue:

## 1. Check Server Status

```bash
# SSH into your server
ssh root@your-server-ip

# Check if MySQL is running
systemctl status mysql

# Check if the Node.js backend is running
pm2 list
pm2 logs vvf-backend
```

## 2. Check Nginx Configuration

The 405 error suggests the API endpoint might not be properly configured in Nginx. Check the Nginx configuration:

```bash
# Check Nginx config
cat /etc/nginx/sites-available/vvf-waitlist

# Verify that the API proxy location is correct:
# location /api/ {
#     proxy_pass http://localhost:3001;
#     proxy_http_version 1.1;
#     ...
# }

# Test Nginx config
nginx -t

# Restart Nginx if needed
systemctl restart nginx
```

## 3. Test API Directly on Server

Bypass Nginx and test the API directly on the server:

```bash
# Test direct access to the API on the server
curl -X POST -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com"}' http://localhost:3001/api/waitlist
```

## 4. Check Server Logs

```bash
# Check Node.js logs
pm2 logs vvf-backend

# Check Nginx access and error logs
tail -n 100 /var/log/nginx/vvf-access.log
tail -n 100 /var/log/nginx/vvf-error.log
```

## 5. Common Issues & Solutions

### API 405 Error (Method Not Allowed)

1. **Nginx not properly proxying to Node.js:**
   - Make sure the proxy_pass directive is correct
   - Ensure Node.js server is running on port 3001
   
2. **CORS issues:**
   - Verify the CORS middleware is correctly set up in server.js

3. **Node.js server not accepting POST requests:**
   - Check if the POST route is correctly defined in server.js

### Fix Nginx Configuration

If the issue is with Nginx, update the configuration:

```bash
# Edit Nginx config
nano /etc/nginx/sites-available/vvf-waitlist
```

Make sure the API location block looks like this:

```
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
    
    # Add this to help debug
    error_log /var/log/nginx/api-error.log debug;
}
```

After making changes:

```bash
nginx -t
systemctl restart nginx
```

## 6. MySQL Connection Test

```bash
# Run the MySQL connection test script
cd /var/www/vvf-waitlist/server
bash test-mysql.sh
```

## 7. Restarting Services

If needed, restart all services:

```bash
systemctl restart mysql
pm2 restart vvf-backend
systemctl restart nginx
```

## 8. Check Frontend Configuration

Make sure your frontend API_BASE_URL in production is pointing to the correct endpoint:
- Should be: `https://thevvf.org/api`

## 9. Temporary Solution

If you still can't resolve the server-side issues, you can temporarily modify the frontend to prioritize localStorage storage until the server is fixed.
