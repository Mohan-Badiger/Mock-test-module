/**
 * Script to create an admin account
 * Usage: node scripts/createAdmin.js <username> <email> <password> [full_name]
 * 
 * Example:
 * node scripts/createAdmin.js admin admin@example.com admin123 "Admin User"
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node scripts/createAdmin.js <username> <email> <password> [full_name]');
    console.error('Example: node scripts/createAdmin.js admin admin@example.com admin123 "Admin User"');
    process.exit(1);
  }

  const [username, email, password, full_name] = args;

  try {
    // Check if admin already exists
    const existing = await pool.query(
      'SELECT id FROM admins WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      console.error('❌ Admin with this username or email already exists!');
      process.exit(1);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert admin
    const result = await pool.query(
      `INSERT INTO admins (username, email, password_hash, full_name, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, username, email, full_name, is_active, created_at`,
      [username, email, password_hash, full_name || username]
    );

    const admin = result.rows[0];
    console.log('✅ Admin created successfully!');
    console.log('\nAdmin Details:');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Full Name: ${admin.full_name}`);
    console.log(`  Active: ${admin.is_active}`);
    console.log(`  Created: ${admin.created_at}`);
    console.log('\nYou can now login with:');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    
    if (error.code === '42P01') {
      console.error('\n⚠️  The "admins" table does not exist!');
      console.error('Please run the migration first:');
      console.error('  node migrations/runMigrations.js');
    } else if (error.code === '23505') {
      console.error('\n⚠️  Admin with this username or email already exists!');
    } else {
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  }
}

createAdmin();

