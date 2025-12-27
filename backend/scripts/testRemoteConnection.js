const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function testRemoteConnection() {
  console.log('\n🔍 Testing Remote/Neon PostgreSQL Connection...\n');
  
  // Check if connection string is set
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ No remote connection string found!');
    console.error('\n💡 To test remote connection:');
    console.error('  1. Open backend/.env file');
    console.error('  2. Add your Neon connection string:');
    console.error('     NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require');
    console.error('\n   Or use DATABASE_URL with the same format.');
    process.exit(1);
  }
  
  console.log('Connection Type: 🌐 Remote/Cloud (Neon)');
  console.log('Connection String:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
  console.log('\n');
  
  try {
    const pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Neon
      },
      connectionTimeoutMillis: 10000,
    });
    
    console.log('⏳ Attempting to connect...\n');
    
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db_name');
    
    console.log('✅ Connection successful!');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    console.log('  Connected to database:', result.rows[0].db_name);
    
    // Check if tables exist
    const tablesCheck = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('  Tables in database:', tablesCheck.rows[0].table_count);
    
    // Test a simple query
    const testQuery = await pool.query('SELECT 1 as test_value');
    console.log('  Test query result:', testQuery.rows[0].test_value);
    
    await pool.end();
    console.log('\n✅ Remote database connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === '28P01') {
      console.error('\n💡 Solution: Check your username and password in the connection string');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('\n💡 Solution: Check your host/endpoint in the connection string');
      console.error('  Make sure the Neon endpoint is correct');
    } else if (error.code === '3D000') {
      console.error('\n💡 Solution: Database does not exist');
      console.error('  Check the database name in your connection string');
    } else {
      console.error('\n💡 Common issues:');
      console.error('  1. Verify your Neon connection string is correct');
      console.error('  2. Check if your Neon database is active');
      console.error('  3. Verify network connectivity');
      console.error('  4. Check if SSL is required (should be in connection string)');
    }
    
    process.exit(1);
  }
}

testRemoteConnection();

