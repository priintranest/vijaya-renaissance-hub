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
    console.log('Submission data:', data);
    console.log('Request headers:', API_CONFIG.getHeaders());
    
    const response = await fetch(API_CONFIG.EXTERNAL_API_URL, {
      method: 'POST',
      headers: API_CONFIG.getHeaders(),
      body: JSON.stringify(data),
      // Add a timeout to prevent long waiting times
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
    });

    console.log('API Response status:', response.status, response.statusText);
    
    // Handle response based on status
    if (!response.ok) {
      // Get response data for error handling
      const contentType = response.headers.get('content-type');
      let errorData;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = { error: await response.text() };
        }
      } catch {
        errorData = { error: 'Unknown error occurred' };
      }
      
      console.log('API Error data:', errorData);
      
      // Check for duplicate email error
      if (response.status === 400 && (
          errorData.error?.toLowerCase().includes('duplicate') || 
          errorData.error?.toLowerCase().includes('unique') ||
          errorData.error?.toLowerCase().includes('already exists') ||
          errorData.message?.toLowerCase().includes('duplicate') ||
          errorData.message?.toLowerCase().includes('unique') ||
          errorData.message?.toLowerCase().includes('already exists')
        )) {
        return { 
          success: false, 
          message: 'This email is already registered in our waitlist',
          duplicate: true 
        };
      }
      
      // Other error types
      throw new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Success response
    const result = await response.json();
    console.log('API Response data:', result);
    
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

// Test function to verify API connectivity
export const testAPIConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Testing API connection to:', API_CONFIG.EXTERNAL_API_URL);
    
    const response = await fetch(API_CONFIG.EXTERNAL_API_URL, {
      method: 'GET',
      headers: API_CONFIG.getHeaders(),
      signal: AbortSignal.timeout(5000) // 5 second timeout for test
    });

    console.log('Test API Response status:', response.status, response.statusText);
    
    if (response.ok) {
      return {
        success: true,
        message: 'API connection successful'
      };
    } else {
      return {
        success: false,
        message: `API returned status ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    console.error('API connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to API'
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
