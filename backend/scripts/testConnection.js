const pool = require('../config/database');
require('dotenv').config();

async function testConnection() {
  console.log('\n🔍 Testing PostgreSQL Connection...\n');
  
  // Check connection type
  if (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL) {
    const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    console.log('Connection Type: 🌐 Remote/Cloud (Neon)');
    console.log('Connection String:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
  } else {
    console.log('Connection Type: 💻 Local PostgreSQL');
    console.log('Connection Details:');
    console.log('  Host:', process.env.DB_HOST || 'localhost');
    console.log('  Port:', process.env.DB_PORT || 5432);
    console.log('  Database:', process.env.DB_NAME || 'mock_test_db');
    console.log('  User:', process.env.DB_USER || 'postgres');
    console.log('  Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-2) : 'NOT SET');
  }
  console.log('\n');

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    
    // Test database exists
    const dbCheck = await pool.query('SELECT current_database() as db_name');
    console.log('  Connected to database:', dbCheck.rows[0].db_name);
    
    // Check if tables exist
    const tablesCheck = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('  Tables in database:', tablesCheck.rows[0].table_count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    
    if (error.code === '28P01') {
      console.error('Error: Password authentication failed');
      console.error('\n💡 Solution:');
      console.error('  1. Open backend/.env file');
      console.error('  2. Update DB_PASSWORD with your actual PostgreSQL password');
      console.error('  3. Common passwords:');
      console.error('     - postgres (default)');
      console.error('     - Check your PostgreSQL installation settings');
      console.error('\n💡 To reset PostgreSQL password:');
      console.error('  On Windows: Check pg_hba.conf or use pgAdmin');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Error: Connection refused');
      console.error('\n💡 Solution:');
      console.error('  1. Check if PostgreSQL is running');
      console.error('  2. Verify the host and port in backend/.env');
      console.error('  3. Check firewall settings');
    } else if (error.code === '3D000') {
      console.error('Error: Database does not exist');
      console.error('\n💡 Solution:');
      console.error('  Run: npm run migrate');
      console.error('  Or create manually: CREATE DATABASE mock_test_db;');
    } else {
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
    }
    
    process.exit(1);
  }
}

testConnection();


