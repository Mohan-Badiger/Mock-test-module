const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

// Read current .env file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check if NEON_DATABASE_URL already exists
if (envContent.includes('NEON_DATABASE_URL=') || envContent.includes('DATABASE_URL=')) {
  console.log('⚠️  Connection string already exists in .env file');
  console.log('\nCurrent connection strings:');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('NEON_DATABASE_URL') || line.includes('DATABASE_URL')) {
      console.log('  ' + line.replace(/:[^:@]+@/, ':****@'));
    }
  });
  console.log('\nTo update, manually edit backend/.env file');
  process.exit(0);
}

// Prompt for connection string
console.log('\n📝 Add Neon Database Connection String\n');
console.log('Please provide your Neon connection string.');
console.log('Example format:');
console.log('postgresql://neondb_owner:password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require\n');

// For now, show instructions
console.log('To add manually:');
console.log('1. Open backend/.env file');
console.log('2. Add this line at the top:');
console.log('   NEON_DATABASE_URL=your_connection_string_here');
console.log('\n3. Make sure the connection string includes:');
console.log('   - Full URL starting with postgresql://');
console.log('   - ?sslmode=require at the end');
console.log('\n4. Save the file and run: npm run test-remote');

process.exit(0);

