export interface WaitlistData {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thevvf.org/api' 
  : 'http://localhost:3001/api';

export const submitWaitlist = async (data: WaitlistData): Promise<{ success: boolean; message: string; duplicate?: boolean }> => {
  try {
    console.log('Submitting to API:', `${API_BASE_URL}/waitlist`);
    
    const response = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // Add a timeout to prevent long waiting times
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    console.log('API Response status:', response.status, response.statusText);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response received:', responseText);
      throw new Error(`Server returned non-JSON response (${response.status}). API might be misconfigured.`);
    }
    
    const result = await response.json();
    console.log('API Response data:', result);
    
    if (!response.ok) {
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
      
      throw new Error(result.error || result.message || 'Failed to submit');
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
