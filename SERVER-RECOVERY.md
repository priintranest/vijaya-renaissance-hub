# Server Password Recovery and API Fix Guide

## Server Access Recovery Options

Since you've forgotten the root password for your server (64.227.167.190), here are the steps to regain access:

### Option 1: Reset password via Digital Ocean control panel
1. Log in to your Digital Ocean account
2. Find your droplet with IP 64.227.167.190
3. Click on "Access" in the left sidebar
4. Choose "Reset root password"
5. Check your email for the new password
6. Use the new password to log in: `ssh root@64.227.167.190`

### Option 2: Use recovery console
Digital Ocean provides a recovery console that you can access from their control panel:
1. Log in to Digital Ocean
2. Select your droplet
3. Go to "Access" > "Launch Recovery Console"
4. This gives you a browser-based terminal with root access
5. Use `passwd` command to set a new root password

### Option 3: If you have another user with sudo access
If you created another user account with sudo privileges, you can:
```bash
ssh your-alternate-username@64.227.167.190
sudo -i  # To get root privileges
# Then set a new root password
passwd
```

## After Regaining Access: API Fix Steps

Once you've regained access to your server, follow these steps to fix the API:

1. From your local machine, copy the necessary files to your server:
   ```bash
   scp server/nginx-config.conf server/fix-api.sh root@64.227.167.190:/root/
   scp server/server-mysql.js root@64.227.167.190:/var/www/thevvf.org/app/server/
   ```

2. SSH into your server and run the fix script:
   ```bash
   ssh root@64.227.167.190
   cd /root
   chmod +x fix-api.sh
   ./fix-api.sh
   ```

3. Upload and run the test script:
   ```bash
   scp server/test-waitlist-api.sh root@64.227.167.190:/root/
   ssh root@64.227.167.190 "cd /root && chmod +x test-waitlist-api.sh && ./test-waitlist-api.sh"
   ```

## Alternative: Deploy without SSH Access

If you can't regain SSH access but have control panel access (like cPanel, Plesk, etc.):

1. Upload files through the file manager in your control panel
2. Use the web terminal or command execution feature if available
3. If your hosting provides Git integration, you could push changes to a repository and pull them on the server

## Contact Your Hosting Provider

As a last resort, contact your hosting provider's support team. They can:
1. Verify your identity as the server owner
2. Reset the root password for you
3. Help troubleshoot any other access issues

Remember to store your new password securely once you've reset it!
