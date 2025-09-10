// API Configuration for External Waitlist Service

export const API_CONFIG = {
  // External waitlist API
  EXTERNAL_API_URL: 'https://api.esamudaay.com/api/waitlist',
  API_TOKEN: 'STATIC_WAITLIST_TOKEN',
  
  // Request configuration
  TIMEOUT: 15000, // 15 seconds
  
  // Headers
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'X-API-TOKEN': API_CONFIG.API_TOKEN,
  }),
  
  // Response handling
  handleResponse: async (response: Response) => {
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response received:', responseText);
      throw new Error(`Server returned non-JSON response (${response.status}). API might be misconfigured.`);
    }
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || result.message || `API request failed with status ${response.status}`);
    }
    
    return result;
  }
};

export default API_CONFIG;
