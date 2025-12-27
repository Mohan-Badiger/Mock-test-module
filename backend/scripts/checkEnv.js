const path = require('path');
const fs = require('fs');

console.log('\n🔍 Checking .env file configuration...\n');

const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  console.error('\n💡 Create a .env file in the backend/ directory');
  process.exit(1);
}

console.log('✅ .env file found at:', envPath);
console.log('\n📄 Reading .env file...\n');

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let hasNeon = false;
let hasDatabaseUrl = false;
let hasLocalDb = false;

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }
  
  if (trimmed.startsWith('NEON_DATABASE_URL=')) {
    hasNeon = true;
    const value = trimmed.split('=')[1];
    console.log(`✅ Line ${index + 1}: NEON_DATABASE_URL found`);
    console.log(`   Value: ${value.substring(0, 30)}...${value.substring(value.length - 20)}`);
  } else if (trimmed.startsWith('DATABASE_URL=')) {
    hasDatabaseUrl = true;
    const value = trimmed.split('=')[1];
    console.log(`✅ Line ${index + 1}: DATABASE_URL found`);
    console.log(`   Value: ${value.substring(0, 30)}...${value.substring(value.length - 20)}`);
  } else if (trimmed.startsWith('DB_HOST=') || trimmed.startsWith('DB_PASSWORD=')) {
    hasLocalDb = true;
  }
});

console.log('\n📊 Summary:');
console.log(`   Neon/Remote DB: ${hasNeon ? '✅ Configured' : '❌ Not configured'}`);
console.log(`   DATABASE_URL: ${hasDatabaseUrl ? '✅ Configured' : '❌ Not configured'}`);
console.log(`   Local DB: ${hasLocalDb ? '✅ Configured' : '❌ Not configured'}`);

if (!hasNeon && !hasDatabaseUrl) {
  console.log('\n⚠️  No remote database connection string found!');
  console.log('\n💡 To add Neon connection string:');
  console.log('   1. Open backend/.env file');
  console.log('   2. Add this line at the top:');
  console.log('      NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require');
  console.log('   3. Replace with your actual Neon connection string');
  console.log('   4. Save and run: npm run test-remote');
}

// Test loading
console.log('\n🧪 Testing environment variable loading...\n');
require('dotenv').config({ path: envPath });

const neonUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (neonUrl) {
  console.log('✅ Connection string loaded successfully!');
  console.log(`   Type: ${process.env.NEON_DATABASE_URL ? 'NEON_DATABASE_URL' : 'DATABASE_URL'}`);
  console.log(`   Length: ${neonUrl.length} characters`);
  console.log(`   Preview: ${neonUrl.substring(0, 50)}...`);
} else {
  console.log('❌ Connection string not loaded from .env file');
  console.log('\n💡 Possible issues:');
  console.log('   1. Variable name is incorrect (should be NEON_DATABASE_URL or DATABASE_URL)');
  console.log('   2. Variable is commented out (starts with #)');
  console.log('   3. There are spaces around the = sign');
  console.log('   4. The connection string has special characters that need escaping');
}

process.exit(0);

