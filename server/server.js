const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
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

// Ensure database directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database setup with backup
const dbPath = path.join(dbDir, 'waitlist.db');
const backupDir = path.join(dbDir, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log(`📊 Database location: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err);
  } else {
    console.log('✅ Database table ready');
  }
});

// Backup function
const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `waitlist-backup-${timestamp}.db`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`📦 Backup created: ${backupPath}`);
    
    // Keep only last 7 backups
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('waitlist-backup-'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 7) {
      backupFiles.slice(7).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️ Deleted old backup: ${file}`);
      });
    }
  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
};

// Create backup every 6 hours
setInterval(createBackup, 6 * 60 * 60 * 1000);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VVF Waitlist API is running',
    timestamp: new Date().toISOString(),
    database: fs.existsSync(dbPath) ? 'Connected' : 'Error'
  });
});

// Submit waitlist form
app.post('/api/waitlist', (req, res) => {
  const { name, email } = req.body;
  
  console.log('📝 New waitlist submission:', { name, email, ip: req.ip });
  
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

  db.run(
    'INSERT INTO waitlist (name, email) VALUES (?, ?)',
    [name.trim(), email.toLowerCase().trim()],
    function(err) {
      if (err) {
        console.error('❌ Database error:', err);
        if (err.code === 'SQLITE_CONSTRAINT') {
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
      
      console.log('✅ Successfully added to waitlist:', { id: this.lastID, name, email });
      
      // Create backup after every 10 new entries
      if (this.lastID % 10 === 0) {
        createBackup();
      }
      
      res.json({
        success: true,
        message: 'Successfully added to waitlist',
        data: { id: this.lastID, name, email }
      });
    }
  );
});

// Get all waitlist entries (for admin)
app.get('/api/admin/waitlist', (req, res) => {
  db.all(
    'SELECT id, name, email, createdAt, updatedAt FROM waitlist ORDER BY createdAt DESC', 
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

// Get waitlist statistics
app.get('/api/admin/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM waitlist', (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    db.get(`SELECT COUNT(*) as today FROM waitlist 
            WHERE DATE(createdAt) = DATE('now')`, (err, todayRow) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      db.get(`SELECT COUNT(*) as thisWeek FROM waitlist 
              WHERE DATE(createdAt) >= DATE('now', '-7 days')`, (err, weekRow) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json({
          success: true,
          stats: {
            total: row.total,
            today: todayRow.today,
            thisWeek: weekRow.thisWeek
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
    res.json({ success: true, message: 'Backup created successfully' });
  } catch (error) {
    console.error('❌ Manual backup failed:', error);
    res.status(500).json({ success: false, message: 'Backup failed' });
  }
});

// Export data as CSV
app.get('/api/admin/export', (req, res) => {
  db.all(
    'SELECT id, name, email, createdAt FROM waitlist ORDER BY createdAt DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      // Create CSV content
      const csvHeader = 'ID,Name,Email,Registration Date\n';
      const csvRows = rows.map(row => 
        `${row.id},"${row.name}","${row.email}","${new Date(row.createdAt).toLocaleString()}"`
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
  
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
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
  console.log(`💾 Database: ${dbPath}`);
  console.log(`📦 Backups: ${backupDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
