export interface WaitlistData {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thevvf.org/api' 
  : 'http://localhost:3001/api';

export const submitWaitlist = async (data: WaitlistData): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Submitting to API:', `${API_BASE_URL}/waitlist`);
    
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('API Response status:', response.status, response.statusText);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', await response.text());
      throw new Error(`Server returned non-JSON response (${response.status}). API might be misconfigured.`);
    }
    
    const result = await response.json();
    console.log('API Response data:', result);
    
    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to submit');
    }

    return { 
      success: true, 
      message: result.message || 'Successfully joined the waitlist!' 
    };
  } catch (error) {
    console.error('Waitlist submission error:', error);
    
    // Check if it's a network error (API not available) or a non-JSON response
    if ((error instanceof TypeError && error.message.includes('fetch')) ||
        (error instanceof Error && error.message.includes('non-JSON response'))) {
      
      console.log('API unavailable or misconfigured, falling back to localStorage');
      
      // Fallback to localStorage only if API is completely unavailable or misconfigured
      try {
        return await saveToLocalStorage(data);
      } catch (fallbackError) {
        console.error('LocalStorage fallback also failed:', fallbackError);
        return { 
          success: false, 
          message: 'Service temporarily unavailable. Please try again later.' 
        };
      }
    }
    
    // For other errors (validation, duplicate email, etc.), show the error message
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to submit. Please try again.' 
    };
  }
};

// localStorage fallback function
const saveToLocalStorage = async (data: WaitlistData): Promise<{ success: boolean; message: string }> => {
  const STORAGE_KEY = 'vvf_waitlist_entries';
  
  try {
    // Get existing entries
    const stored = localStorage.getItem(STORAGE_KEY);
    const entries = stored ? JSON.parse(stored) : [];
    
    // Check for duplicate email
    const existingEntry = entries.find((entry: any) => 
      entry.email.toLowerCase() === data.email.toLowerCase()
    );
    
    if (existingEntry) {
      return {
        success: false,
        message: 'This email is already registered in our waitlist'
      };
    }
    
    // Create new entry
    const newEntry = {
      id: entries.length > 0 ? Math.max(...entries.map((e: any) => e.id)) + 1 : 1,
      name: data.name,
      email: data.email,
      phone: data.phone,
      interest: data.interest,
      submitted_at: new Date().toISOString()
    };
    
    // Add to entries
    entries.push(newEntry);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    console.log('✅ Saved to localStorage:', newEntry);
    
    return {
      success: true,
      message: 'Successfully joined the waitlist! (Saved locally until server is available)'
    };
  } catch (error) {
    console.error('LocalStorage save error:', error);
    return {
      success: false,
      message: 'Failed to save data. Please try again.'
    };
  }
};
