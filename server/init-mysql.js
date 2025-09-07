/**
 * MySQL Database Initialization Script
 * This script creates the necessary tables for the VVF waitlist application
 */

const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'vvf_user',
  password: 'your_secure_password_here', 
  database: 'vvf_waitlist',
  connectionLimit: 10
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection and initialize tables
pool.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database successfully');
    
    // Initialize tables
    initializeDatabase();
  }
});

// Create table if not exists
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20),
      interest TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_submitted_at (submitted_at)
    )
  `;
  
  pool.query(createTableQuery, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err);
      process.exit(1);
    } else {
      console.log('✅ Database table ready');
      
      // Create optional test user
      if (process.env.CREATE_TEST_ENTRY) {
        const testQuery = `
          INSERT IGNORE INTO waitlist_entries (name, email, phone, interest) 
          VALUES ('Test User', 'test@example.com', '1234567890', 'Testing MySQL setup')
        `;
        
        pool.query(testQuery, (err) => {
          if (err) {
            console.log('ℹ️ Skipping test entry creation:', err.message);
          } else {
            console.log('✅ Created test entry');
          }
          pool.end();
        });
      } else {
        pool.end();
      }
    }
  });
}

console.log('🚀 Running MySQL initialization...');
