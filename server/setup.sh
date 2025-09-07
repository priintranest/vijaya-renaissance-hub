#!/bin/bash

# Setup script for VVF Waitlist application
echo "🚀 Setting up VVF Waitlist application..."

# Step 1: Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Step 2: Navigate to server directory
cd /var/www/thevvf.org/app/server

# Step 3: Install server dependencies
echo "Installing server dependencies..."
npm install

# Step 4: Create a PM2 ecosystem file
echo "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vvf-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
}
EOF

# Step 5: Create required directories
mkdir -p logs backups

# Step 6: Start the backend
echo "Starting backend server..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Step 7: Setup Nginx configuration
echo "Setting up Nginx configuration..."
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
        root /var/www/thevvf.org/app/dist;
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

# Step 8: Enable site and restart Nginx
ln -sf /etc/nginx/sites-available/vvf-waitlist /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo "✅ Setup complete! Testing backend..."
curl -X POST -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com"}' http://localhost:3001/api/waitlist
echo ""
echo "To check the backend logs, run: pm2 logs vvf-backend"
