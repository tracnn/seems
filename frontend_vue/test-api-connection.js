// Test API connection
const API_BASE_URL = 'http://localhost:7111';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0ODc0LCJ1c2VybmFtZSI6InRyYWNubiIsImZ1bGxuYW1lIjoiTmd1eeG7hW4gTmfhu41jIFRyw6FjIiwiZW1haWwiOiJ0cmFjbm4yMDAyMTk3OUBnbWFpbC5jb20iLCJ0eXBlIjoiU1RBRkYiLCJ0b2tlbkNvZGUiOiIxOGVjY2I1YjZkODljYzE0YzgxNjVhZTI2YzQ4MDgwZjU2OGYxYTljOWU3MThjMjE2ZjZjMzc2NWU3NGJhZmE5IiwiaWF0IjoxNzU3NTUyMjE1LCJleHAiOjE3NTc1NTU4MTV9.mYuEDhGdcc-2h_V-DKkrBqVrV-fCzWpspQnlRM5xKj0';

async function testAPI() {
  console.log('Testing API connection...');
  
  try {
    // Test 1: Check if backend is running
    console.log('\n1. Testing backend health...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible:', error.message);
    console.log('Please start the backend server first:');
    console.log('cd backend && npm run start:dev');
    return;
  }
  
  try {
    // Test 2: Test satisfaction survey API
    console.log('\n2. Testing satisfaction survey API...');
    const response = await fetch(`${API_BASE_URL}/admin/satisfaction-survey?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is working!');
      console.log(`Found ${data.data.length} surveys`);
      console.log(`Total: ${data.pagination.total}`);
    } else {
      console.log('❌ API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ API request failed:', error.message);
  }
}

// Run the test
testAPI();
