/**
 * Test user registration endpoint
 * Usage: node scripts/testUserRegistration.js [username] [email] [password] [full_name]
 */

const https = require('https');
const http = require('http');

async function testRegistration() {
  const username = process.argv[2] || 'testuser' + Date.now();
  const email = process.argv[3] || `test${Date.now()}@example.com`;
  const password = process.argv[4] || 'test123456';
  const full_name = process.argv[5] || 'Test User';
  const backendUrl = 'https://ai-powered-skill-based-mock-tests-module.onrender.com';
  const endpoint = `${backendUrl}/api/auth/register`;

  console.log('🧪 Testing User Registration...\n');
  console.log(`Backend: ${backendUrl}`);
  console.log(`Username: ${username}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Full Name: ${full_name}\n`);

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
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, data: body, headers: res.headers });
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
    const response = await makeRequest(endpoint, { 
      username, 
      email, 
      password, 
      full_name 
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      console.log('\n✅ Registration successful!');
      console.log(`User ID: ${response.data.user?.id}`);
      console.log(`Username: ${response.data.user?.username}`);
      console.log(`Email: ${response.data.user?.email}`);
      console.log(`Token: ${response.data.token?.substring(0, 50)}...`);
      console.log('\n✅ You can now use this token to start tests!');
    } else if (response.status === 400) {
      console.log('\n❌ Registration failed: Bad request');
      console.log('Error:', response.data.error || response.data.message);
    } else if (response.status === 409) {
      console.log('\n❌ Registration failed: User already exists');
      console.log('Error:', response.data.error || response.data.message);
    } else {
      console.log(`\n⚠️  Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Cannot connect to backend server');
    }
  }
}

testRegistration();

