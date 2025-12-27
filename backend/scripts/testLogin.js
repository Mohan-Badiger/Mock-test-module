/**
 * Test admin login endpoint
 * Usage: node scripts/testLogin.js [username] [password]
 */

const https = require('https');
const http = require('http');

async function testLogin() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const backendUrl = 'https://ai-powered-skill-based-mock-tests-module.onrender.com';
  const endpoint = `${backendUrl}/api/admin/auth/login`;

  console.log('🧪 Testing Admin Login...\n');
  console.log(`Backend: ${backendUrl}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}\n`);

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
    const response = await makeRequest(endpoint, { username, password });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ Login successful!');
      console.log(`Token: ${response.data.token?.substring(0, 50)}...`);
    } else if (response.status === 401) {
      console.log('\n❌ Login failed: Invalid credentials');
      console.log('\nPossible issues:');
      console.log('  1. Password hash in database doesn\'t match the password');
      console.log('  2. Admin account is inactive');
      console.log('  3. Wrong username/email');
      console.log('\nFix: Run this SQL in your database:');
      console.log('  UPDATE admins SET password_hash = \'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy\', is_active = true WHERE username = \'admin\';');
    } else if (response.status === 403) {
      console.log('\n❌ Login failed: Admin account is deactivated');
      console.log('\nFix: Run this SQL:');
      console.log('  UPDATE admins SET is_active = true WHERE username = \'admin\';');
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

testLogin();

