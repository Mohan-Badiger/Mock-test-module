/**
 * Debug script to test admin login
 * This will help identify why login is failing
 * 
 * Usage: node scripts/debugAdminLogin.js <username> <password>
 * Example: node scripts/debugAdminLogin.js admin admin123
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

async function debugAdminLogin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/debugAdminLogin.js <username> <password>');
    console.error('Example: node scripts/debugAdminLogin.js admin admin123');
    process.exit(1);
  }

  const [username, password] = args;

  try {
    console.log('🔍 Debugging Admin Login...\n');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}\n`);

    // Step 1: Check if admin exists
    console.log('Step 1: Checking if admin exists...');
    const result = await pool.query(
      'SELECT id, username, email, password_hash, full_name, is_active FROM admins WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      console.error('❌ Admin not found!');
      console.error('\nAvailable admins:');
      const allAdmins = await pool.query('SELECT id, username, email, is_active FROM admins');
      allAdmins.rows.forEach(admin => {
        console.log(`  - ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}, Active: ${admin.is_active}`);
      });
      process.exit(1);
    }

    const admin = result.rows[0];
    console.log('✅ Admin found!');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Full Name: ${admin.full_name}`);
    console.log(`  Active: ${admin.is_active}`);
    console.log(`  Password Hash: ${admin.password_hash.substring(0, 20)}...`);

    // Step 2: Check if admin is active
    console.log('\nStep 2: Checking if admin is active...');
    if (!admin.is_active) {
      console.error('❌ Admin account is DEACTIVATED!');
      console.error('   Fix: UPDATE admins SET is_active = true WHERE username = $1;');
      process.exit(1);
    }
    console.log('✅ Admin is active');

    // Step 3: Verify password
    console.log('\nStep 3: Verifying password...');
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      console.error('❌ Password is INCORRECT!');
      console.error('\nPossible issues:');
      console.error('  1. The password you entered is wrong');
      console.error('  2. The password hash in database is incorrect');
      console.error('  3. The hash was generated with different settings');
      
      console.error('\nTo fix:');
      console.error('  1. Generate a new hash for your password:');
      console.error('     const bcrypt = require("bcryptjs");');
      console.error(`     bcrypt.hash("${password}", 10).then(hash => console.log(hash));`);
      console.error('  2. Update the admin:');
      console.error(`     UPDATE admins SET password_hash = '$2a$10$NEW_HASH_HERE' WHERE username = '${admin.username}';`);
      process.exit(1);
    }
    
    console.log('✅ Password is correct!');

    // Step 4: Test JWT generation
    console.log('\nStep 4: Testing JWT generation...');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { adminId: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    console.log('✅ JWT token generated successfully');
    console.log(`  Token (first 50 chars): ${token.substring(0, 50)}...`);

    // Summary
    console.log('\n✅ All checks passed!');
    console.log('\nThe admin account should work. If login still fails:');
    console.log('  1. Check backend logs for errors');
    console.log('  2. Verify JWT_SECRET is set correctly in backend .env');
    console.log('  3. Check CORS settings');
    console.log('  4. Verify the frontend is sending the correct request');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    
    if (error.code === '42P01') {
      console.error('\n⚠️  The "admins" table does not exist!');
      console.error('Please run: node migrations/runMigrations.js');
    }
    
    process.exit(1);
  }
}

debugAdminLogin();

