// Environment variable validation
const validateEnv = () => {
  const required = ['JWT_SECRET'];
  const missing = [];

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please set these in your .env file');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode, but these should be set for production');
    }
  }

  // Warn about database configuration
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
    if (!process.env.DB_PASSWORD) {
      console.warn('⚠️  No database configuration found. Set NEON_DATABASE_URL, DATABASE_URL, or DB_PASSWORD');
    }
  }

  console.log('✅ Environment validation complete');
};

module.exports = validateEnv;

