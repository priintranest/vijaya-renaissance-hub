#!/bin/bash
# This script updates the Nginx configuration to use the new port

NGINX_CONFIG_PATH="/etc/nginx/sites-available/thevvf.org"
NEW_PORT=3003

# Check if the Nginx config file exists
if [ ! -f "$NGINX_CONFIG_PATH" ]; then
    echo "❌ Nginx config file not found at $NGINX_CONFIG_PATH"
    echo "Please provide the correct path to your Nginx configuration file:"
    read NGINX_CONFIG_PATH
    
    if [ ! -f "$NGINX_CONFIG_PATH" ]; then
        echo "❌ Config file still not found. Exiting."
        exit 1
    fi
fi

echo "Updating Nginx configuration to use port $NEW_PORT..."

# Backup the original config
cp $NGINX_CONFIG_PATH ${NGINX_CONFIG_PATH}.backup

# Update the port in the proxy_pass directive
sed -i "s/proxy_pass http:\/\/localhost:[0-9]\+/proxy_pass http:\/\/localhost:$NEW_PORT/" $NGINX_CONFIG_PATH

# Check if the update was successful
if grep -q "proxy_pass http://localhost:$NEW_PORT" $NGINX_CONFIG_PATH; then
    echo "✅ Successfully updated Nginx configuration to use port $NEW_PORT"
else
    echo "❌ Failed to update Nginx configuration"
    echo "Please manually edit $NGINX_CONFIG_PATH and change the proxy_pass directive to use port $NEW_PORT"
fi

# Test the Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration test passed"
    
    # Reload Nginx
    echo "Reloading Nginx..."
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "❌ Failed to reload Nginx"
    fi
else
    echo "❌ Nginx configuration test failed"
    echo "Please fix the configuration errors before reloading Nginx"
fi
