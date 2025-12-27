/**
 * Test starting a test as a user
 * Usage: node scripts/testStartTest.js <token> <testId> <difficultyId>
 */

const https = require('https');
const http = require('http');

async function testStartTest() {
  const token = process.argv[2];
  const testId = process.argv[3] || '1';
  const difficultyId = process.argv[4] || '1';
  const backendUrl = 'https://ai-powered-skill-based-mock-tests-module.onrender.com';

  if (!token) {
    console.error('Usage: node scripts/testStartTest.js <token> [testId] [difficultyId]');
    console.error('Example: node scripts/testStartTest.js eyJhbGci... 1 1');
    process.exit(1);
  }

  console.log('🧪 Testing Start Test Flow...\n');
  console.log(`Backend: ${backendUrl}`);
  console.log(`Test ID: ${testId}`);
  console.log(`Difficulty ID: ${difficultyId}\n`);

  function makeRequest(url, method = 'GET', data = null, authToken = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const postData = data ? JSON.stringify(data) : null;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      if (postData) {
        headers['Content-Length'] = Buffer.byteLength(postData);
      }
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: method,
        headers: headers,
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

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  try {
    // Step 1: Get test details
    console.log('Step 1: Getting test details...');
    const testResponse = await makeRequest(
      `${backendUrl}/api/tests/${testId}`,
      'GET',
      null,
      token
    );
    
    if (testResponse.status === 200) {
      console.log('✅ Test found:', testResponse.data.title || testResponse.data.name);
    } else {
      console.log(`❌ Failed to get test: ${testResponse.status}`);
      console.log('Response:', testResponse.data);
      return;
    }

    // Step 2: Start test attempt
    console.log('\nStep 2: Starting test attempt...');
    const attemptResponse = await makeRequest(
      `${backendUrl}/api/results/start`,
      'POST',
      {
        test_id: parseInt(testId),
        difficulty_id: parseInt(difficultyId)
      },
      token
    );
    
    console.log(`Status: ${attemptResponse.status}`);
    console.log(`Response:`, JSON.stringify(attemptResponse.data, null, 2));
    
    if (attemptResponse.status === 201 || attemptResponse.status === 200) {
      console.log('\n✅ Test attempt started successfully!');
      console.log(`Attempt ID: ${attemptResponse.data.id}`);
      console.log(`User ID: ${attemptResponse.data.user_id}`);
      console.log(`Test ID: ${attemptResponse.data.test_id}`);
      console.log(`Difficulty ID: ${attemptResponse.data.difficulty_id}`);
      console.log('\n✅ You can now proceed to the exam interface!');
    } else if (attemptResponse.status === 401) {
      console.log('\n❌ Unauthorized: Invalid or expired token');
    } else if (attemptResponse.status === 404) {
      console.log('\n❌ Test or difficulty not found');
    } else {
      console.log(`\n⚠️  Unexpected status: ${attemptResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Cannot connect to backend server');
    }
  }
}

testStartTest();

