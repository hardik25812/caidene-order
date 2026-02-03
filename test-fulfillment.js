/**
 * Test Fulfillment Script
 * Run this to test the fulfillment flow without making a real payment
 * 
 * Usage: node test-fulfillment.js
 */

const testOrder = {
  email: 'test@example.com',
  phone: '+1234567890',
  domains: [
    {
      domain: 'testdomain.com',
      forwardingUrl: 'https://example.com',
      names: [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Smith' }
      ]
    }
  ]
};

async function runTest() {
  try {
    console.log('🧪 Testing fulfillment flow...\n');
    console.log('Test Order:', JSON.stringify(testOrder, null, 2));
    console.log('\n📤 Sending request to test endpoint...\n');

    const response = await fetch('http://localhost:3000/api/test/fulfillment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Test successful!\n');
      console.log('Order ID:', data.orderId);
      console.log('Fulfillment Results:', JSON.stringify(data.fulfillmentResults, null, 2));
      console.log('\n📊 View order at: http://localhost:3000/dashboard');
    } else {
      console.log('❌ Test failed!\n');
      console.log('Error:', data.error);
      console.log('Details:', data.details);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

runTest();
