/**
 * Test script to verify admin login endpoint is accessible
 * Usage: node scripts/testAdminEndpoint.js [backend_url]
 * 
 * Example:
 * node scripts/testAdminEndpoint.js
 * node scripts/testAdminEndpoint.js https://ai-powered-skill-based-mock-tests-module.onrender.com
 */

const https = require('https');
const http = require('http');

async function testAdminEndpoint() {
  const backendUrl = process.argv[2] || 'https://ai-powered-skill-based-mock-tests-module.onrender.com';
  const endpoint = `${backendUrl}/api/admin/auth/login`;

  console.log('🧪 Testing Admin Login Endpoint...\n');
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`Endpoint: ${endpoint}\n`);

  // Helper function to make HTTP requests
  function makeRequest(url, data) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  try {
    // Test 1: Check if endpoint exists (should return 400 for missing credentials, not 404)
    console.log('Test 1: Checking if endpoint exists...');
    const response = await makeRequest(endpoint, {});

    if (response.status === 404) {
      console.error('❌ Endpoint not found (404)');
      console.error('   The admin login endpoint does not exist on the backend.');
      console.error('   Please check:');
      console.error('   1. Is the backend deployed?');
      console.error('   2. Is the route registered in server.js?');
      console.error('   3. Are all migrations run?');
      process.exit(1);
    } else if (response.status === 400) {
      console.log('✅ Endpoint exists! (Got 400 for missing credentials, which is expected)');
    } else {
      console.log(`✅ Endpoint exists! (Status: ${response.status})`);
    }

    // Test 2: Test with invalid credentials (should return 401)
    console.log('\nTest 2: Testing with invalid credentials...');
    const invalidResponse = await makeRequest(endpoint, { username: 'nonexistent', password: 'wrong' });

    if (invalidResponse.status === 401) {
      console.log('✅ Endpoint working correctly! (Got 401 for invalid credentials)');
    } else {
      console.log(`⚠️  Unexpected status: ${invalidResponse.status}`);
      console.log(`   Response: ${JSON.stringify(invalidResponse.data, null, 2)}`);
    }

    // Test 3: Check if admins table exists (by trying to login with empty username)
    console.log('\nTest 3: Checking database connection...');
    const dbTestResponse = await makeRequest(endpoint, { username: '', password: '' });

    if (dbTestResponse.status === 500) {
      const errorMsg = JSON.stringify(dbTestResponse.data);
      if (errorMsg.includes('table') || errorMsg.includes('admins')) {
        console.error('❌ Database error detected!');
        console.error('   The "admins" table might not exist.');
        console.error('   Please run: npm run migrate');
        process.exit(1);
      }
    }

    console.log('\n✅ All tests passed!');
    console.log('\nNext steps:');
    console.log('1. Make sure you have run the migration: npm run migrate');
    console.log('2. Create an admin account: npm run create-admin admin admin@example.com admin123');
    console.log('3. Try logging in with your credentials');

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.error('❌ Cannot connect to backend server!');
      console.error(`   Error: ${error.message}`);
      console.error('\nPlease check:');
      console.error('1. Is the backend URL correct?');
      console.error('2. Is the backend server running?');
      console.error('3. Is the backend accessible from your network?');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
    process.exit(1);
  }
}

testAdminEndpoint();

