// Local MySQL test script
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration - change password to match setup-local-mysql.sql
const dbConfig = {
  host: 'localhost',
  user: 'vvf_user',
  password: '1001', // Updated to match MySQL password
  database: 'vvf_waitlist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create log directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log to console and file
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  fs.appendFileSync(
    path.join(logsDir, 'mysql-test.log'),
    logMessage + '\n',
    'utf8'
  );
};

// Test function to insert a waitlist entry
async function insertTestEntry(pool) {
  try {
    // Generate a unique email using timestamp
    const timestamp = Date.now();
    const testData = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      phone: '555-123-4567',
      interest: 'Testing the local MySQL connection'
    };
    
    log(`Inserting test entry: ${testData.name} (${testData.email})`);
    
    // Insert the data
    const [result] = await pool.execute(
      'INSERT INTO waitlist_entries (name, email, phone, interest) VALUES (?, ?, ?, ?)',
      [testData.name, testData.email, testData.phone, testData.interest]
    );
    
    log(`✅ Test entry inserted with ID: ${result.insertId}`);
    return result.insertId;
  } catch (error) {
    log(`❌ Error inserting test entry: ${error.message}`);
    throw error;
  }
}

// Test function to retrieve waitlist entries
async function getEntries(pool) {
  try {
    log('Retrieving waitlist entries...');
    
    const [rows] = await pool.execute(
      'SELECT * FROM waitlist_entries ORDER BY submitted_at DESC LIMIT 10'
    );
    
    log(`✅ Retrieved ${rows.length} entries`);
    return rows;
  } catch (error) {
    log(`❌ Error retrieving entries: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  log('Starting MySQL connection test...');
  
  try {
    // Create connection pool
    const pool = mysql.createPool(dbConfig);
    log('Connecting to MySQL...');
    
    // Test the connection
    const connection = await pool.getConnection();
    log('✅ Connected to MySQL database');
    connection.release();
    
    // Insert a test entry
    const insertId = await insertTestEntry(pool);
    
    // Get all entries
    const entries = await getEntries(pool);
    log(`Latest entries in database:`);
    console.table(entries.map(entry => ({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      submitted_at: entry.submitted_at
    })));
    
    log('✅ All tests completed successfully!');
    
    // End the pool
    await pool.end();
    log('MySQL connection pool closed');
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
