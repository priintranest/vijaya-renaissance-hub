// Simple localStorage-based database for waitlist
// This is perfect for a frontend-only waitlist application

export interface WaitlistData {
  name: string;
  email: string;
}

export interface WaitlistEntry extends WaitlistData {
  id: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vvf_waitlist_entries';

// Get all entries from localStorage
const getStoredEntries = (): WaitlistEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Save entries to localStorage
const saveEntries = (entries: WaitlistEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const saveToDatabase = async (data: WaitlistData) => {
  try {
    const entries = getStoredEntries();
    
    // Check if email already exists
    const existingEntry = entries.find(entry => 
      entry.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existingEntry) {
      return {
        success: false,
        message: 'Email already registered',
        duplicate: true
      };
    }

    // Create new entry
    const newEntry: WaitlistEntry = {
      id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to entries array
    entries.push(newEntry);
    
    // Save to localStorage
    saveEntries(entries);

    console.log('✅ Saved to localStorage:', newEntry);
    return {
      success: true,
      message: 'Successfully saved to database',
      data: newEntry
    };
  } catch (error) {
    console.error('❌ Storage error:', error);
    return {
      success: false,
      message: 'Failed to save to database',
      error
    };
  }
};

export const getAllWaitlistEntries = async () => {
  try {
    const entries = getStoredEntries();
    // Sort by creation date (newest first)
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return {
      success: true,
      data: entries
    };
  } catch (error) {
    console.error('❌ Storage error:', error);
    return {
      success: false,
      message: 'Failed to fetch entries',
      error
    };
  }
};

export const getWaitlistCount = async () => {
  try {
    const entries = getStoredEntries();
    return {
      success: true,
      count: entries.length
    };
  } catch (error) {
    console.error('❌ Storage error:', error);
    return {
      success: false,
      count: 0,
      error
    };
  }
};

// Export function to clear all data (for admin use)
export const clearAllEntries = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
      message: 'All entries cleared'
    };
  } catch (error) {
    console.error('❌ Storage error:', error);
    return {
      success: false,
      message: 'Failed to clear entries',
      error
    };
  }
};
