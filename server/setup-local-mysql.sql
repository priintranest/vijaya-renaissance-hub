-- MySQL Initialization Script for Vijaya Renaissance Hub Waitlist
-- This script creates the necessary database and table for local testing

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS vvf_waitlist;

-- Use the database
USE vvf_waitlist;

-- Create user (if not exists) and grant privileges
CREATE USER IF NOT EXISTS 'vvf_user'@'localhost' IDENTIFIED BY '1001';
GRANT ALL PRIVILEGES ON vvf_waitlist.* TO 'vvf_user'@'localhost';
FLUSH PRIVILEGES;

-- Create waitlist entries table
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  interest TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_submitted_at (submitted_at)
);

-- Insert a test entry (will fail silently if email already exists)
INSERT IGNORE INTO waitlist_entries (name, email, interest)
VALUES ('Test User', 'test@example.com', 'Testing the waitlist system');

-- Show the current entries
SELECT * FROM waitlist_entries;

-- Display success message
SELECT 'Database setup completed successfully!' AS Message;
