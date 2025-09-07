const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
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

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'vvf_user',
  password: 'your_secure_password_here', // Change this to your actual password
  database: 'vvf_waitlist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    // Ensure table exists
    await pool.execute(`
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
    `);
    console.log('✅ Database table ready');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Initialize database
testConnection();

// Backup function using mysqldump
const createBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'data', 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupPath = path.join(backupDir, `waitlist-backup-${timestamp}.sql`);
  
  try {
    const { exec } = require('child_process');
    const command = `mysqldump -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > "${backupPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error);
      } else {
        console.log(`📦 MySQL backup created: ${backupPath}`);
        
        // Keep only last 7 backups
        const backupFiles = fs.readdirSync(backupDir)
          .filter(file => file.startsWith('waitlist-backup-'))
          .sort()
          .reverse();
        
        if (backupFiles.length > 7) {
          const filesToDelete = backupFiles.slice(7);
          filesToDelete.forEach(file => {
            try {
              fs.unlinkSync(path.join(backupDir, file));
              console.log(`🗑️ Deleted old backup: ${file}`);
            } catch (err) {
              console.error(`❌ Error deleting backup ${file}:`, err.message);
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('❌ Backup process failed:', error);
  }
};

// Create backup every 24 hours
setInterval(createBackup, 24 * 60 * 60 * 1000);

// Maintenance mode storage (in memory for simplicity)
let maintenanceMode = false;

// Utility functions
const getMaintenanceStatus = () => maintenanceMode;
const setMaintenanceStatus = (status) => {
  maintenanceMode = status;
  console.log(`🔧 Maintenance mode ${status ? 'ENABLED' : 'DISABLED'}`);
};

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      maintenance: getMaintenanceStatus(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Check maintenance status
app.get('/api/maintenance-status', (req, res) => {
  res.json({ maintenanceMode: getMaintenanceStatus() });
});

// Secret maintenance toggle endpoints
app.post('/secret-maintenance-enable-vvf-2024', (req, res) => {
  setMaintenanceStatus(true);
  res.json({ 
    success: true, 
    message: 'Maintenance mode enabled',
    maintenanceMode: true 
  });
});

app.post('/secret-maintenance-disable-vvf-2024', (req, res) => {
  setMaintenanceStatus(false);
  res.json({ 
    success: true, 
    message: 'Maintenance mode disabled',
    maintenanceMode: false 
  });
});

// Public waitlist submission
app.post('/api/waitlist', async (req, res) => {
  const { name, email, phone, interest } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name and email are required' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please enter a valid email address' 
    });
  }

  try {
    // Insert new waitlist entry
    const [result] = await pool.execute(
      'INSERT INTO waitlist_entries (name, email, phone, interest) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, interest || null]
    );

    console.log(`✅ New waitlist entry: ${email} (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: 'Successfully added to waitlist!',
      id: result.insertId
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'This email is already registered on our waitlist.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process your request. Please try again.'
    });
  }
});

// Get all waitlist entries (admin only)
app.get('/api/admin/waitlist', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, interest, submitted_at FROM waitlist_entries ORDER BY submitted_at DESC'
    );

    console.log(`📊 Admin accessed waitlist: ${rows.length} entries`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ Admin query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch waitlist data'
    });
  }
});

// Get waitlist count (admin only)
app.get('/api/admin/waitlist/count', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM waitlist_entries');
    const count = rows[0].count;

    res.json({ success: true, count });
  } catch (error) {
    console.error('❌ Count query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get waitlist count'
    });
  }
});

// Export waitlist as CSV (admin only)
app.get('/api/admin/waitlist/export', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT name, email, phone, interest, submitted_at FROM waitlist_entries ORDER BY submitted_at DESC'
    );

    // Generate CSV content
    const csvHeader = 'Name,Email,Phone,Interest,Submitted At\n';
    const csvRows = rows.map(row => {
      const escapeCsv = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCsv(row.name),
        escapeCsv(row.email),
        escapeCsv(row.phone),
        escapeCsv(row.interest),
        escapeCsv(row.submitted_at)
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const timestamp = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="vvf-waitlist-${timestamp}.csv"`);
    res.send(csvContent);

    console.log(`📤 Admin exported ${rows.length} waitlist entries`);
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export waitlist data'
    });
  }
});

// Delete waitlist entry (admin only)
app.delete('/api/admin/waitlist/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Valid entry ID is required'
    });
  }

  try {
    const [result] = await pool.execute('DELETE FROM waitlist_entries WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Waitlist entry not found'
      });
    }

    console.log(`🗑️ Admin deleted waitlist entry ID: ${id}`);
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete entry'
    });
  }
});

// Create manual backup (admin only)
app.post('/api/admin/backup', async (req, res) => {
  try {
    await createBackup();
    res.json({ 
      success: true, 
      message: 'Backup created successfully' 
    });
  } catch (error) {
    console.error('❌ Manual backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup'
    });
  }
});

// Handle React Router (serve React app for all non-API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  
  try {
    await createBackup();
    await pool.end();
    console.log('✅ Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VVF Waitlist server running on port ${PORT}`);
  console.log(`📊 Database: MySQL (${dbConfig.database})`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
