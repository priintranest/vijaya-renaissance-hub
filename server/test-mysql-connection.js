const mysql = require('mysql2/promise');

async function testConnection() {
  // Get password from command line arguments
  const password = process.argv[2] || '';
  
  try {
    // Create a connection using the provided password
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      database: 'vvf_waitlist'
    });
    
    console.log('✅ Connection successful!');
    
    // Test a query
    const [rows] = await connection.execute('SELECT * FROM waitlist_entries LIMIT 5');
    console.log('✅ Query successful!');
    console.log('Found', rows.length, 'entries');
    if (rows.length > 0) {
      console.log('Sample entry:', rows[0]);
    }
    
    // Close the connection
    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

console.log('Testing MySQL connection with provided password...');
testConnection();
