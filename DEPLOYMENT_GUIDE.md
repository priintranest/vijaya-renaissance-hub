# VVF Waitlist Server Deployment Guide

## 🚀 Complete Setup Instructions for Digital Ocean Ubuntu Droplet

### Prerequisites
- Ubuntu 20.04+ droplet with sudo access
- At least 1GB RAM and 20GB storage
- SSH access to your server

---

## 📋 Step-by-Step Server Setup

### 1. Initial Server Setup
```bash
# Connect to your server via SSH
ssh root@your-server-ip

# Or if using a non-root user:
ssh your-username@your-server-ip
```

### 2. Upload Setup Files
Upload these files to your server's `/root/` or `/home/your-username/` directory:
- `setup-server.sh`
- Your entire project folder

```bash
# Using SCP from your local machine:
scp -r vijaya-renaissance-hub/ root@your-server-ip:/var/www/
scp setup-server.sh root@your-server-ip:/root/

# Or using rsync:
rsync -avz vijaya-renaissance-hub/ root@your-server-ip:/var/www/
```

### 3. Run Server Setup
```bash
# Make the setup script executable
chmod +x /root/setup-server.sh

# Run the server setup (installs Node.js, PM2, Nginx, SQLite)
sudo bash /root/setup-server.sh
```

### 4. Upload Project Files
```bash
# Move your project to the correct location
mv /var/www/vijaya-renaissance-hub /var/www/vvf-waitlist

# Make deployment script executable
chmod +x /var/www/vvf-waitlist/server/deploy.sh
```

### 5. Deploy Application
```bash
# Run the deployment script
cd /var/www/vvf-waitlist
sudo bash server/deploy.sh
```

### 6. Configure Domain (Optional)
```bash
# Edit the nginx configuration with your domain
sudo nano /etc/nginx/sites-available/vvf-waitlist

# Replace 'your-domain.com' with your actual domain
# Then reload nginx
sudo systemctl reload nginx
```

---

## 🔧 Frontend API Integration

After the backend is deployed, update your frontend to use the production API:

### Update Waitlist Service (`src/lib/waitlist.ts`)
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thevvf.org/api' 
  : 'http://localhost:3001/api';

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
