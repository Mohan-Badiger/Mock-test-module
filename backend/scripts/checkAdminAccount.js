/**
 * Check if an admin account exists in the database
 * Usage: node scripts/checkAdminAccount.js <username>
 */

const pool = require('../config/database');
require('dotenv').config();

const username = process.argv[2];

if (!username) {
  console.error('Usage: node scripts/checkAdminAccount.js <username>');
  console.error('Example: node scripts/checkAdminAccount.js peterphone');
  process.exit(1);
}

(async () => {
  try {
    console.log(`🔍 Checking admin account for: ${username}\n`);

    // Check in admins table
    const adminResult = await pool.query(
      'SELECT id, username, email, full_name, is_active, created_at FROM admins WHERE username = $1 OR email = $1',
      [username]
    );

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log('✅ Found in ADMINS table:');
      console.log(JSON.stringify(admin, null, 2));
      console.log('\n✅ This account should use: /api/admin/auth/login');
    } else {
      console.log('❌ NOT found in ADMINS table');
    }

    // Check in users table
    const userResult = await pool.query(
      'SELECT id, username, email, full_name, created_at FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('\n⚠️  Found in USERS table:');
      console.log(JSON.stringify(user, null, 2));
      console.log('\n⚠️  This account uses: /api/auth/login (regular user login)');
      console.log('⚠️  This will NOT work for admin panel!');
    } else {
      console.log('\n❌ NOT found in USERS table');
    }

    // Summary
    console.log('\n📋 Summary:');
    if (adminResult.rows.length > 0) {
      console.log('✅ Account exists in admins table - can use admin login');
    } else if (userResult.rows.length > 0) {
      console.log('❌ Account only exists in users table - cannot use admin login');
      console.log('   You need to create this account in the admins table');
    } else {
      console.log('❌ Account not found in either table');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

