#!/bin/bash

# VVF Waitlist Server Setup Script for Ubuntu/Digital Ocean
# Run this script as root or with sudo privileges

set -e  # Exit on any error

echo "🚀 Starting VVF Waitlist Server Setup..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install SQLite (if not already installed)
echo "📦 Installing SQLite..."
apt install -y sqlite3

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/vvf-waitlist
chown -R $SUDO_USER:$SUDO_USER /var/www/vvf-waitlist

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your project files to /var/www/vvf-waitlist/"
echo "2. Run the deployment script: bash /var/www/vvf-waitlist/deploy.sh"
echo "3. Configure your domain in nginx.conf"
echo ""
echo "🔧 Useful commands:"
echo "  - Check PM2 status: pm2 status"
echo "  - View backend logs: pm2 logs vvf-backend"
echo "  - Restart backend: pm2 restart vvf-backend"
echo "  - Check nginx status: systemctl status nginx"
echo "  - Reload nginx: systemctl reload nginx"
