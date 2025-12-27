const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Read migration files in order
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_seed_data.sql',
      '003_ai_generated_questions.sql',
      '004_add_test_visibility.sql',
      '005_create_admins.sql'
    ];
    
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Running migration: ${file}`);
      await client.query(sql);
      console.log(`✓ Completed: ${file}`);
    }
    
    await client.query('COMMIT');
    console.log('All migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });

