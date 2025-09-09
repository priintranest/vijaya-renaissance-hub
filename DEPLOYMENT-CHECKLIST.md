# Production Deployment Checklist for VVF Waitlist

Use this checklist to ensure a smooth deployment of the Vijaya Renaissance Hub waitlist application to your production server.

## Pre-Deployment Preparation

- [ ] Build the frontend application locally:
```bash
cd /path/to/vijaya-renaissance-hub
npm run build
```

- [ ] Verify the build was successful by checking the `dist` directory.

## Server Setup

- [ ] Log in to your production server:
```bash
ssh user@your-server-ip
```

- [ ] Create the application directories:
```bash
sudo mkdir -p /var/www/vvf-waitlist
sudo mkdir -p /var/www/vvf-waitlist/public
sudo mkdir -p /var/www/vvf-waitlist/server
sudo mkdir -p /var/backups/vvf-waitlist
```

- [ ] Install required software if not already installed:
```bash
sudo apt update
sudo apt install -y nginx mysql-server nodejs npm
```

- [ ] Install PM2 globally:
```bash
sudo npm install -g pm2
```

## File Transfer

- [ ] Upload the built frontend files to the server:
```bash
# From your local machine
scp -r dist/* user@your-server-ip:/var/www/vvf-waitlist/public/
```

- [ ] Upload the server files to the server:
```bash
# From your local machine
scp -r server/* user@your-server-ip:/var/www/vvf-waitlist/server/
```

- [ ] Upload the production deployment script:
```bash
# From your local machine
scp server/production-deploy.sh user@your-server-ip:/var/www/vvf-waitlist/server/
```

## Database Setup

- [ ] Create the MySQL database and user:
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE vvf_waitlist;
CREATE USER 'vvf_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON vvf_waitlist.* TO 'vvf_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

- [ ] Create the database tables:
```bash
mysql -u vvf_user -p vvf_waitlist < /var/www/vvf-waitlist/server/setup-local-mysql.sql
```

## Server Configuration

- [ ] Edit the server-mysql.js file to use production settings:
```bash
sudo nano /var/www/vvf-waitlist/server/server-mysql.js
```

Update the following sections:
  - Database configuration: Set the correct MySQL password
  - Admin token: Choose a secure admin token
  - Remove any development-specific code

- [ ] Install server dependencies:
```bash
cd /var/www/vvf-waitlist/server
npm install
```

## Web Server Configuration

- [ ] Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/thevvf.org
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name thevvf.org www.thevvf.org;

    location / {
        root /var/www/vvf-waitlist/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

- [ ] Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/thevvf.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Process Management Setup

- [ ] Start the server with PM2:
```bash
cd /var/www/vvf-waitlist/server
pm2 start server-mysql.js --name "vvf-waitlist"
```

- [ ] Set up PM2 to start on boot:
```bash
pm2 startup
# Run the command it outputs
pm2 save
```

## SSL Configuration

- [ ] Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

- [ ] Obtain SSL certificate:
```bash
sudo certbot --nginx -d thevvf.org -d www.thevvf.org
```

## Backup Configuration

- [ ] Make the backup script executable:
```bash
chmod +x /var/www/vvf-waitlist/server/backup.sh
```

- [ ] Add backup script to crontab:
```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/vvf-waitlist/server/backup.sh") | crontab -
```

## Automated Deployment

- [ ] Use the production deployment script (optional):
```bash
cd /var/www/vvf-waitlist/server
sudo chmod +x production-deploy.sh
sudo ./production-deploy.sh
```

## Post-Deployment Verification

- [ ] Test the website frontend: https://thevvf.org
- [ ] Test the admin interface: https://thevvf.org/admin
- [ ] Test the API health endpoint: https://thevvf.org/api/health
- [ ] Test waitlist form submission
- [ ] Verify entries appear in the admin panel
- [ ] Check server logs for errors:
```bash
pm2 logs vvf-waitlist
```

## Security Follow-up

- [ ] Check server firewall settings:
```bash
sudo ufw status
```

- [ ] Ensure only necessary ports are open (80, 443, SSH)
- [ ] Consider setting up fail2ban to protect SSH
- [ ] Set up regular security updates
- [ ] Save the admin token securely

## Documentation

- [ ] Document the production admin token in a secure location
- [ ] Document the MySQL database credentials
- [ ] Document the deployment process for future reference
- [ ] Document how to restore from backups if needed

## Monitoring

- [ ] Set up PM2 monitoring:
```bash
pm2 monitor
```

- [ ] Set up log rotation:
```bash
pm2 install pm2-logrotate
```
