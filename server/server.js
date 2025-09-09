const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// Ensure log directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'vvf_user',
  password: '1001', 
  database: 'vvf_waitlist',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
  } else {
    console.log('✅ Connected to MySQL database successfully');
    
    // Initialize tables if needed
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
  } else {
    console.log('✅ Database table ready');
  }
});
}

// MySQL Backup function
const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `waitlist-backup-${timestamp}.sql`;
  const backupDir = path.join(__dirname, 'backups');
  const backupPath = path.join(backupDir, backupFileName);
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Log the backup operation
  const logFile = path.join(logsDir, 'backup.log');
  fs.appendFileSync(logFile, `${new Date().toISOString()}: Starting backup to ${backupPath}\n`);
  
  // Use mysqldump command for backup
  const { exec } = require('child_process');
  const cmd = `mysqldump -u${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > "${backupPath}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup failed:', error);
      fs.appendFileSync(logFile, `${new Date().toISOString()}: Backup failed: ${error.message}\n`);
      return;
    }
    
    console.log(`📦 Backup created: ${backupPath}`);
    fs.appendFileSync(logFile, `${new Date().toISOString()}: Backup created successfully: ${backupPath}\n`);
    
    // Keep only last 7 backups
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('waitlist-backup-'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 7) {
      backupFiles.slice(7).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️ Deleted old backup: ${file}`);
        fs.appendFileSync(logFile, `${new Date().toISOString()}: Deleted old backup: ${file}\n`);
      });
    }
  });
};

// Create backup every 6 hours
setInterval(createBackup, 6 * 60 * 60 * 1000);

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Check database connection
  pool.query('SELECT 1', (err, results) => {
    const dbStatus = err ? 'Error' : 'Connected';
    
    res.json({ 
      status: 'OK', 
      message: 'VVF Waitlist API is running',
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  });
});

// Submit waitlist form
app.post('/api/waitlist', (req, res) => {
  const { name, email, phone, interest } = req.body;
  
  console.log('📝 New waitlist submission:', { name, email, phone, interest, ip: req.ip });
  
  if (!name || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name and email are required' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // Name validation
  if (name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters long'
    });
  }

  const query = 'INSERT INTO waitlist_entries (name, email, phone, interest) VALUES (?, ?, ?, ?)';
  const values = [name.trim(), email.toLowerCase().trim(), phone?.trim() || null, interest?.trim() || null];
  
  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('❌ Database error:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.json({
          success: false,
          duplicate: true,
          message: 'This email is already registered in our waitlist'
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Database error occurred' 
      });
    }
    
    console.log('✅ Successfully added to waitlist:', { id: result.insertId, name, email });
    
    // Create backup after every 10 new entries
    if (result.insertId % 10 === 0) {
      createBackup();
    }
    
    res.json({
      success: true,
      message: 'Successfully added to waitlist',
      data: { id: result.insertId, name, email }
    });
  });
});

// Get all waitlist entries (for admin)
app.get('/api/admin/waitlist', (req, res) => {
  pool.query(
    'SELECT id, name, email, phone, interest, submitted_at FROM waitlist_entries ORDER BY submitted_at DESC', 
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching waitlist:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }
      
      console.log(`📊 Admin fetched ${rows.length} waitlist entries`);
      res.json({ 
        success: true, 
        data: rows,
        total: rows.length 
      });
    }
  );
});

// Public GET endpoint for waitlist (for frontend)
app.get('/api/waitlist', (req, res) => {
  pool.query(
    'SELECT id, name, email, phone, interest, submitted_at FROM waitlist_entries ORDER BY submitted_at DESC', 
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching waitlist:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }
      
      res.json({ 
        success: true, 
        entries: rows,
        count: rows.length 
      });
    }
  );
});

// Get waitlist statistics
app.get('/api/admin/stats', (req, res) => {
  pool.query('SELECT COUNT(*) as total FROM waitlist_entries', (err, totalRows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    pool.query(`SELECT COUNT(*) as today FROM waitlist_entries 
              WHERE DATE(submitted_at) = CURDATE()`, (err, todayRows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      pool.query(`SELECT COUNT(*) as thisWeek FROM waitlist_entries 
                WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`, (err, weekRows) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json({
          success: true,
          stats: {
            total: totalRows[0].total,
            today: todayRows[0].today,
            thisWeek: weekRows[0].thisWeek
          }
        });
      });
    });
  });
});

// Manual backup endpoint (for admin)
app.post('/api/admin/backup', (req, res) => {
  try {
    createBackup();
    res.json({ success: true, message: 'Backup initiated successfully' });
  } catch (error) {
    console.error('❌ Manual backup failed:', error);
    res.status(500).json({ success: false, message: 'Backup failed' });
  }
});

// Export data as CSV
app.get('/api/admin/export', (req, res) => {
  pool.query(
    'SELECT id, name, email, phone, interest, submitted_at FROM waitlist_entries ORDER BY submitted_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      // Create CSV content
      const csvHeader = 'ID,Name,Email,Phone,Interest,Registration Date\n';
      const csvRows = rows.map(row => 
        `${row.id},"${row.name}","${row.email}","${row.phone || ''}","${row.interest || ''}","${new Date(row.submitted_at).toLocaleString()}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // Set headers for file download
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="vvf-waitlist-${timestamp}.csv"`);
      
      res.send(csvContent);
      console.log(`📁 Admin exported ${rows.length} entries as CSV`);
    }
  );
});

// Public export endpoint for frontend
app.get('/api/waitlist/export', (req, res) => {
  pool.query(
    'SELECT id, name, email, phone, interest, submitted_at FROM waitlist_entries ORDER BY submitted_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      // Create CSV content
      const csvHeader = 'ID,Name,Email,Phone,Interest,Registration Date\n';
      const csvRows = rows.map(row => 
        `${row.id},"${row.name}","${row.email}","${row.phone || ''}","${row.interest || ''}","${row.submitted_at}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="vvf-waitlist-export.csv"');
      
      res.send(csvContent);
      console.log(`📁 Exported ${rows.length} entries as CSV`);
    }
  );
});

// Clear all entries (admin)
app.delete('/api/waitlist', (req, res) => {
  // Create backup before deletion
  createBackup();
  
  pool.query('DELETE FROM waitlist_entries', (err, result) => {
    if (err) {
      console.error('❌ Error clearing waitlist:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    console.log(`🗑️ Admin cleared ${result.affectedRows} waitlist entries`);
    res.json({ 
      success: true, 
      message: `Successfully cleared ${result.affectedRows} entries`,
      cleared_count: result.affectedRows
    });
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`🔄 Received ${signal}. Shutting down gracefully...`);
  
  createBackup(); // Final backup before shutdown
  
  pool.end((err) => {
    if (err) {
      console.error('❌ Error closing database connection:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

app.listen(PORT, () => {
  console.log(`🚀 VVF Waitlist Server running on port ${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin/waitlist`);
  console.log(`💾 Database: MySQL (${dbConfig.database}@${dbConfig.host})`);
  console.log(`📦 Backups: ${path.join(__dirname, 'backups')}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
