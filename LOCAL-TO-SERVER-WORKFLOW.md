# Local-to-Server Workflow Guide

This guide outlines the preferred workflow for making changes to the Vijaya Renaissance Hub application and deploying them to the production server.

## Benefits of Local-to-Server Workflow

- Better version control
- Easier testing before deployment
- Consistent deployment process
- Reduced risk of manual errors on the server
- Documentation of all changes in git history

## Prerequisites

- Git installed locally and on the server
- SSH access to your production server
- Proper permissions to the deployment directories on the server

## Workflow Steps

### 1. Make Changes Locally

Always make your changes in your local development environment first:

```bash
# Navigate to your local repository
cd /path/to/vijaya-renaissance-hub

# Create a new branch for your changes (optional but recommended)
git checkout -b feature/your-feature-name

# Make your code changes using your preferred editor
```

### 2. Test Changes Locally

Ensure all changes work correctly in your local environment:

```bash
# Start the local server
cd server
node server-mysql.js

# In a separate terminal, start the frontend dev server or build it
cd ..
npm run dev
# or
npm run build
```

### 3. Commit Changes

Once your changes are tested and working:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Description of changes made"

# Push to remote repository (if you're using a central repository)
git push origin feature/your-feature-name
```

### 4. Deploy to Production

Deploy your changes to the production server:

#### Option A: Using Git on the Server

If your server has git access to your repository:

```bash
# SSH into your server
ssh user@your-server

# Navigate to the application directory
cd /path/to/app/on/server

# Pull the latest changes
git pull

# Build if necessary
npm run build

# Restart the server
pm2 restart server-mysql
# or
systemctl restart your-service-name
```

#### Option B: Manual Upload

If your server doesn't have git access to your repository:

```bash
# Build locally
npm run build

# Upload the built frontend files
scp -r ./dist/* user@your-server:/var/www/thevvf.org/

# Upload the server files
scp -r ./server/* user@your-server:/opt/vvf-waitlist/

# SSH into the server to restart
ssh user@your-server
cd /opt/vvf-waitlist
pm2 restart server-mysql
# or
systemctl restart your-service-name
```

### 5. Verify Deployment

After deployment, verify that the application is working correctly:

1. Test the frontend by visiting your domain
2. Check server logs for any errors
3. Verify database connections and functionality

## Managing Database Password Changes

When updating database passwords:

1. Update all password references in code files locally:
   - server-mysql.js
   - server.js
   - init-mysql.js
   - test-local-mysql.js
   - Any other files that reference the database password

2. Update the MySQL password on the server (if needed):
   ```bash
   # SSH into the server
   ssh user@your-server
   
   # Connect to MySQL as root
   sudo mysql -u root -p
   
   # Update the password for the user
   ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY '1001';
   FLUSH PRIVILEGES;
   ```

3. Deploy the updated code files following the steps above

## Important Notes

- Always backup database and code before major changes
- Test thoroughly in a local environment before deploying to production
- Document all configuration changes
- Keep consistent passwords across all configuration files
