// Test script for Satisfaction Survey API
// Run this in browser console or as a Node.js script

const API_BASE_URL = 'http://localhost:7111';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0ODc0LCJ1c2VybmFtZSI6InRyYWNubiIsImZ1bGxuYW1lIjoiTmd1eeG7hW4gTmfhu41jIFRyw6FjIiwiZW1haWwiOiJ0cmFjbm4yMDAyMTk3OUBnbWFpbC5jb20iLCJ0eXBlIjoiU1RBRkYiLCJ0b2tlbkNvZGUiOiIxOGVjY2I1YjZkODljYzE0YzgxNjVhZTI2YzQ4MDgwZjU2OGYxYTljOWU3MThjMjE2ZjZjMzc2NWU3NGJhZmE5IiwiaWF0IjoxNzU3NTUyMjE1LCJleHAiOjE3NTc1NTU4MTV9.mYuEDhGdcc-2h_V-DKkrBqVrV-fCzWpspQnlRM5xKj0';

async function testSatisfactionSurveyAPI() {
  try {
    console.log('Testing Satisfaction Survey API...');
    
    // Test 1: Get satisfaction surveys with default parameters
    console.log('\n1. Testing GET /admin/satisfaction-survey with default parameters:');
    const response1 = await fetch(`${API_BASE_URL}/admin/satisfaction-survey?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success:', data1);
      console.log(`Found ${data1.data.length} surveys`);
      console.log(`Total: ${data1.pagination.total}`);
    } else {
      console.log('❌ Error:', response1.status, response1.statusText);
    }
    
    // Test 2: Get satisfaction surveys with date filter
    console.log('\n2. Testing GET /admin/satisfaction-survey with date filter:');
    const response2 = await fetch(`${API_BASE_URL}/admin/satisfaction-survey?page=1&limit=10&fromDate=2025-09-11&toDate=2025-09-11`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Success:', data2);
      console.log(`Found ${data2.data.length} surveys for date 2025-09-11`);
    } else {
      console.log('❌ Error:', response2.status, response2.statusText);
    }
    
    // Test 3: Get satisfaction surveys with status filter
    console.log('\n3. Testing GET /admin/satisfaction-survey with status filter:');
    const response3 = await fetch(`${API_BASE_URL}/admin/satisfaction-survey?page=1&limit=10&surveyStatus=PENDING`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Success:', data3);
      console.log(`Found ${data3.data.length} PENDING surveys`);
    } else {
      console.log('❌ Error:', response3.status, response3.statusText);
    }
    
    // Test 4: Get satisfaction surveys with type filter
    console.log('\n4. Testing GET /admin/satisfaction-survey with type filter:');
    const response4 = await fetch(`${API_BASE_URL}/admin/satisfaction-survey?page=1&limit=10&surveyType=TREATMENT`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (response4.ok) {
      const data4 = await response4.json();
      console.log('✅ Success:', data4);
      console.log(`Found ${data4.data.length} TREATMENT surveys`);
    } else {
      console.log('❌ Error:', response4.status, response4.statusText);
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSatisfactionSurveyAPI();
