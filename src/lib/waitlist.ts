import { API_CONFIG } from './api-config';

export interface WaitlistData {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
}

export const submitWaitlist = async (data: WaitlistData): Promise<{ success: boolean; message: string; duplicate?: boolean }> => {
  try {
    console.log('Submitting to API:', API_CONFIG.EXTERNAL_API_URL);
    
    const response = await fetch(API_CONFIG.EXTERNAL_API_URL, {
      method: 'POST',
      headers: API_CONFIG.getHeaders(),
      body: JSON.stringify(data),
      // Add a timeout to prevent long waiting times
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
    });

    console.log('API Response status:', response.status, response.statusText);
    
    const result = await API_CONFIG.handleResponse(response);
    console.log('API Response data:', result);
    
    // Check for duplicate email error
    if (response.status === 400 && (
        result.error?.toLowerCase().includes('duplicate') || 
        result.error?.toLowerCase().includes('unique') ||
        result.error?.toLowerCase().includes('already exists')
      )) {
      return { 
        success: false, 
        message: 'This email is already registered in our waitlist',
        duplicate: true 
      };
    }

    return { 
      success: true, 
      message: result.message || 'Successfully joined the waitlist!' 
    };
  } catch (error) {
    console.error('Waitlist submission error:', error);
    
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to submit. Please try again.' 
    };
  }
};

// Fetch waitlist entries from external API
export const fetchWaitlistEntries = async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    console.log('Fetching from API:', API_CONFIG.EXTERNAL_API_URL);
    
    const response = await fetch(API_CONFIG.EXTERNAL_API_URL, {
      method: 'GET',
      headers: API_CONFIG.getHeaders(),
      // Add a timeout to prevent long waiting times
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
    });

    console.log('API Response status:', response.status, response.statusText);
    
    const result = await API_CONFIG.handleResponse(response);
    console.log('API Response data:', result);

    return { 
      success: true, 
      data: result.data || result || [], // Handle different response formats
      message: result.message || 'Successfully fetched waitlist entries' 
    };
  } catch (error) {
    console.error('Waitlist fetch error:', error);
    
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch waitlist entries. Please try again.' 
    };
  }
};
