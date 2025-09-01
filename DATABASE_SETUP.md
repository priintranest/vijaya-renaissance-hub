# Waitlist LocalStorage Setup

## Overview
Your waitlist form now saves all registrations to the browser's localStorage without any email functionality.

## Storage Details
- **Storage Type:** Browser localStorage
- **Location:** Browser's local storage
- **Key:** `vvf_waitlist_entries`
- **Format:** JSON array

## Data Schema
```javascript
{
  id: number,           // Auto-incrementing ID
  name: string,         // User's full name
  email: string,        // User's email (unique check)
  createdAt: string,    // Registration timestamp (ISO string)
  updatedAt: string     // Last update timestamp (ISO string)
}
```

## Features
✅ **Form Validation** - Prevents duplicate emails  
✅ **LocalStorage** - All submissions saved in browser  
✅ **Admin Dashboard** - View all registrations at `/admin/waitlist`  
✅ **Export to CSV** - Download waitlist data  
✅ **Clear All Data** - Admin function to reset waitlist  
✅ **Duplicate Prevention** - Shows friendly message for existing emails  

## Accessing Data

### Admin Dashboard
Visit: `http://localhost:8081/admin/waitlist`
- View all registrations
- See total count
- Export to CSV
- Clear all data
- Refresh data

### Browser DevTools
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Click "Local Storage"
4. Find key: `vvf_waitlist_entries`

### Programmatic Access
```javascript
// Get all entries
const entries = JSON.parse(localStorage.getItem('vvf_waitlist_entries') || '[]');

// Clear all entries
localStorage.removeItem('vvf_waitlist_entries');
```

## Backup
Data is stored in the browser's localStorage. To backup:
1. Go to admin dashboard
2. Click "Export to CSV"
3. Save the CSV file

## Important Notes
⚠️ **Browser-specific:** Data is tied to the specific browser/device  
⚠️ **Can be cleared:** Users can clear browser data  
⚠️ **Not shared:** Each browser has its own copy  

## Production Considerations
For production deployment, consider:
1. Setting up a proper backend API
2. Using a real database (PostgreSQL, MySQL)
3. Implementing user authentication
4. Adding data persistence across devices
5. Regular data backups

## Migration to Real Database
When ready for production, you can:
1. Export current data to CSV
2. Set up backend API
3. Import CSV data to real database
4. Update frontend to use API endpoints
