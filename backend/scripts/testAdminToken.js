/**
 * Test if admin token is valid
 * Usage: node scripts/testAdminToken.js <token>
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = process.argv[2];

if (!token) {
  console.error('Usage: node scripts/testAdminToken.js <token>');
  console.error('Example: node scripts/testAdminToken.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

console.log('🔍 Testing Admin Token...\n');
console.log(`Token (first 50 chars): ${token.substring(0, 50)}...\n`);

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
  
  console.log('✅ Token is valid!');
  console.log('\nToken Payload:');
  console.log(JSON.stringify(decoded, null, 2));
  
  console.log('\n✅ Checks:');
  console.log(`  Role: ${decoded.role} ${decoded.role === 'admin' ? '✅' : '❌'}`);
  console.log(`  Admin ID: ${decoded.adminId ? decoded.adminId + ' ✅' : '❌ Missing'}`);
  console.log(`  Username: ${decoded.username || 'N/A'}`);
  
  if (decoded.role === 'admin' || decoded.adminId) {
    console.log('\n✅ Token should work for admin routes!');
  } else {
    console.log('\n❌ Token is missing admin role or adminId!');
    console.log('   This token will be rejected by admin middleware.');
  }
  
} catch (error) {
  if (error.name === 'JsonWebTokenError') {
    console.error('❌ Invalid token:', error.message);
  } else if (error.name === 'TokenExpiredError') {
    console.error('❌ Token expired:', error.message);
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}

