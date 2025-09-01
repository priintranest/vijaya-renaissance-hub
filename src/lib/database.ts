// API-based database for waitlist with localStorage fallback
// Uses the backend API in production, localStorage for local development

export interface WaitlistData {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
}

export interface WaitlistEntry extends WaitlistData {
  id: number;
  submitted_at: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thevvf.org/api' 
  : 'http://localhost:3001/api';

const STORAGE_KEY = 'vvf_waitlist_entries';

// API-based functions
export const getAllWaitlistEntries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`);
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: data.entries || []
      };
    }
  } catch (error) {
    console.error('API fetch failed, using localStorage fallback:', error);
  }
  
  // Fallback to localStorage
  try {
    const entries = getLocalStorageEntries();
    return {
      success: true,
      data: entries
    };
  } catch (error) {
    console.error('❌ Storage error:', error);
    return {
      success: false,
      data: [],
      error
    };
  }
};

export const getWaitlistCount = async () => {
  try {
    const result = await getAllWaitlistEntries();
    return {
      success: result.success,
      count: result.data.length
    };
  } catch (error) {
    console.error('❌ Count error:', error);
    return {
      success: false,
      count: 0,
      error
    };
  }
};

export const clearAllEntries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'DELETE',
    });
    if (response.ok) {
      return {
        success: true,
        message: 'All entries cleared from server'
      };
    }
  } catch (error) {
    console.error('API clear failed, clearing localStorage:', error);
  }
  
  // Fallback to localStorage
  try {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
      message: 'All entries cleared from local storage'
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

export const exportToCSV = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/waitlist/export`);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('API export failed, using localStorage fallback:', error);
  }
  
  // Fallback to localStorage export
  return exportLocalStorageToCSV();
};

// localStorage fallback functions
const getLocalStorageEntries = (): WaitlistEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const exportLocalStorageToCSV = (): string => {
  const entries = getLocalStorageEntries();
  
  if (entries.length === 0) {
    return 'No data available';
  }

  const headers = ['ID', 'Name', 'Email', 'Phone', 'Interest', 'Submitted At'];
  const csvContent = [
    headers.join(','),
    ...entries.map(entry => [
      entry.id,
      `"${entry.name}"`,
      `"${entry.email}"`,
      `"${entry.phone || ''}"`,
      `"${entry.interest || ''}"`,
      `"${entry.submitted_at}"`
    ].join(','))
  ].join('\n');

  return csvContent;
};

// Legacy function for localStorage compatibility (if needed)
export const saveToDatabase = async (data: WaitlistData) => {
  try {
    const entries = getLocalStorageEntries();
    
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
      phone: data.phone,
      interest: data.interest,
      submitted_at: new Date().toISOString()
    };

    // Add to entries array
    entries.push(newEntry);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

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
