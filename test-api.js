// Quick API test script
const testAPI = async () => {
  console.log('Testing API call...');
  
  try {
    const response = await fetch('https://api.esamudaay.com/api/waitlist', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-TOKEN': 'STATIC_WAITLIST_TOKEN',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    console.log('Is array:', Array.isArray(data));
    console.log('Length:', data.length);
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
  }
};

// Test it
testAPI();
