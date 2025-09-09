# Local MySQL Setup Guide for Vijaya Renaissance Hub

This guide will help you set up a local MySQL database for testing the waitlist functionality.

## Prerequisites

1. **MySQL Server**: You need to have MySQL installed locally. You can use:
   - [MySQL Community Edition](https://dev.mysql.com/downloads/mysql/)
   - [XAMPP](https://www.apachefriends.org/) (includes MySQL)
   - [WAMP](https://www.wampserver.com/en/) (for Windows)
   - [MAMP](https://www.mamp.info/) (for Mac)

2. **Node.js**: Make sure you have Node.js installed to run the backend server.

## Setup Instructions

### Step 1: Set Up the Database

1. **Using the Script (Recommended)**

   **On Windows:**
   - Open Command Prompt and navigate to the server directory
   - Run `setup-local-database.bat`
   - Follow the prompts

   **On Mac/Linux:**
   - Open Terminal and navigate to the server directory
   - Run `bash setup-local-database.sh` or `chmod +x setup-local-database.sh && ./setup-local-database.sh`
   - Follow the prompts

2. **Manual Setup:**

   If the script doesn't work, you can set up the database manually:

   - Open MySQL command line or a tool like phpMyAdmin
   - Execute the SQL commands from `setup-local-mysql.sql`

### Step 2: Test the Database Connection

1. Make sure the `mysql2` package is installed:
   ```bash
   npm install mysql2
   ```

2. Run the test script:
   ```bash
   node server/test-local-mysql.js
   ```

3. Check if the connection is successful and entries can be added to the database.

### Step 3: Run the Local Server

1. **Start the server:**

   **On Windows:**
   ```bash
   server\run-local-server.bat
   ```

   **On Mac/Linux:**
   ```bash
   bash server/run-local-server.sh
   ```

2. The server should now be running at http://localhost:3001

### Step 4: Configure Frontend to Use Local API

The frontend is already set up to use the local API when in development mode. You can start the frontend development server:

```bash
npm run dev
```

This will start the development server, typically at http://localhost:5173 or another available port.

## Troubleshooting

### Database Connection Issues

1. **Error: "ER_ACCESS_DENIED_ERROR"**
   - Make sure the username and password in `test-local-mysql.js` match what you set in `setup-local-mysql.sql`
   - Default values are: username = `vvf_user`, password = `your_secure_password_here`

2. **Error: "ER_NOT_SUPPORTED_AUTH_MODE"**
   - This occurs with newer MySQL versions (8+). Run the following SQL command:
     ```sql
     ALTER USER 'vvf_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_secure_password_here';
     FLUSH PRIVILEGES;
     ```

3. **Error: "ECONNREFUSED"**
   - Ensure MySQL service is running
   - Verify that it's running on the default port (3306)

### API Connection Issues

1. Check if the server is running correctly with `node server/server-mysql.js`
2. Verify that the API endpoint is accessible at http://localhost:3001/api/health
3. Check browser console for any CORS errors

## Admin Interface

Once your local server is running, you can access the admin interface at:
http://localhost:5173/admin/database

Use the admin token: `vvf-admin-secret-2024`
