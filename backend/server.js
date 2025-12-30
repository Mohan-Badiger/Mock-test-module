const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const testRoutes = require('./routes/testRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const resultRoutes = require('./routes/resultRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const validateEnv = require('./middleware/validateEnv');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate environment variables
validateEnv();

// Security headers middleware
app.use((req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

// Request logging (only in development or if LOG_REQUESTS is set)
if (NODE_ENV === 'development' || process.env.LOG_REQUESTS === 'true') {
  app.use(logger);
}

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim()) : [])
].filter(Boolean);

// In development, add localhost origins
if (NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
}

// Add Render's default frontend URL if on Render
if (process.env.RENDER) {
  // Render provides RENDER_EXTERNAL_URL for the service itself
  if (process.env.RENDER_EXTERNAL_URL) {
    allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);
  }
}

// Add Vercel URL if provided
if (process.env.VERCEL_URL) {
  // Vercel provides VERCEL_URL (without protocol)
  const vercelUrl = `https://${process.env.VERCEL_URL}`;
  allowedOrigins.push(vercelUrl);
}

// Helper function to check if origin matches Vercel pattern
const isVercelDomain = (origin) => {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    // Match *.vercel.app domains (remove trailing slash if present)
    const cleanHostname = hostname.replace(/\/$/, '');
    return cleanHostname.endsWith('.vercel.app');
  } catch (error) {
    console.warn('⚠️  Error parsing origin for Vercel check:', origin, error.message);
    return false;
  }
};

// Helper function to check if origin matches any allowed pattern
const isOriginAllowed = (origin) => {
  if (!origin) return false;

  // Exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check Vercel domains if ALLOW_VERCEL is set or no origins configured
  if (process.env.ALLOW_VERCEL === 'true' || allowedOrigins.length === 0) {
    if (isVercelDomain(origin)) {
      console.log(`✅ Allowing Vercel domain: ${origin}`);
      return true;
    }
  }

  // Check if origin matches any pattern in allowedOrigins (for wildcards)
  for (const allowed of allowedOrigins) {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) {
        return true;
      }
    }
  }

  return false;
};

console.log('🌐 Allowed CORS origins:', allowedOrigins.length > 0 ? allowedOrigins : 'All (development mode)');
if (process.env.ALLOW_VERCEL === 'true') {
  console.log('✅ Vercel domains (*.vercel.app) are allowed');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    // If no origins are configured, allow all (for easier deployment)
    if (allowedOrigins.length === 0 && NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: No CORS origins configured. Allowing all origins.');
      return callback(null, true);
    }

    // Log the rejected origin for debugging
    console.warn(`⚠️  CORS: Origin "${origin}" not allowed.`);
    console.warn(`   Allowed origins:`, allowedOrigins.length > 0 ? allowedOrigins : 'None configured');
    console.warn(`   ALLOW_VERCEL:`, process.env.ALLOW_VERCEL || 'not set');
    console.warn(`   Is Vercel domain:`, isVercelDomain(origin));

    if (process.env.ALLOW_VERCEL !== 'true') {
      console.warn('💡 Tip: Set ALLOW_VERCEL=true to allow all Vercel domains, or add the origin to ALLOWED_ORIGINS');
    } else if (isVercelDomain(origin)) {
      console.warn('💡 Warning: ALLOW_VERCEL is true but Vercel domain check failed. This might be a bug.');
    }

    // In production, reject if origin is not whitelisted
    if (NODE_ENV === 'production' && allowedOrigins.length > 0) {
      return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }

    // In development, allow all
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes); // Admin auth routes (no auth required)
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes); // Admin routes (require auth)
app.use('/api/users', userRoutes);

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');

    res.json({
      status: 'OK',
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Server is running but database is unavailable',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV
    });
  }
});

// Root endpoint moved to /api
app.get('/api', (req, res) => {
  res.json({
    message: 'AI-Powered Skill Based Mock Tests API',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV
  });
});

// Serve static files from the React app
// app.use(express.static(path.join(__dirname, '../mock-test-admin/dist')));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Catch-all handler for any request that doesn't match an API route
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../mock-test-admin/dist/index.html'));
// });

// Global error handler (must be last)
app.use(errorHandler);

// Test database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('⚠️  Database connection test failed:', error.message);
    console.warn('⚠️  Server will start, but database operations may fail');
    console.warn('💡 Make sure NEON_DATABASE_URL or DATABASE_URL is set correctly');
  }

  // Start server regardless of database status
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📦 Environment: ${NODE_ENV}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);

    // Return server for graceful shutdown
    return server;
  });

  return server;
};

// Start the server
let server;
startServer().then(s => {
  server = s;
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log('HTTP server closed');

      // Close database pool
      pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
      });
    });
  } else {
    // If server hasn't started yet, just close the pool
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  }

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

module.exports = app;

