const { Pool } = require("pg");
const path = require("path");

// Load .env file explicitly
require("dotenv").config({ path: path.join(__dirname, "../.env") });

let pool;

// Check if Neon connection string is provided
if (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) {
  // Use Neon connection string (priority: NEON_DATABASE_URL > DATABASE_URL)
  const connectionString =
    process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  console.log("🌐 Using Neon/Cloud PostgreSQL connection string");

  pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased for cloud connections
  });
} else {
  // Fallback to local PostgreSQL with individual parameters
  console.log("💻 Using local PostgreSQL connection");

  // Validate required environment variables for local DB
  if (!process.env.DB_PASSWORD) {
    console.warn("\n WARNING: DB_PASSWORD is not set in .env file");
    console.warn("Using local PostgreSQL with default settings.");
    console.warn(
      "To use Neon/Cloud DB, set NEON_DATABASE_URL or DATABASE_URL in .env file"
    );
    console.warn("Current .env location:", path.join(__dirname, "../.env"));
    console.warn(
      "Example: NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require\n"
    );
  }

  // Ensure password is always a string (even if empty)
  const dbPassword = process.env.DB_PASSWORD
    ? String(process.env.DB_PASSWORD)
    : "";

  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "mock_test_db",
    user: process.env.DB_USER || "postgres",
    password: dbPassword,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Test database connection on startup
const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    const dbType =
      process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
        ? "Neon/Cloud"
        : "Local";
    console.log(`✅ Connected to ${dbType} PostgreSQL database`);
    console.log(`📅 Database time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    console.error("Error code:", error.code);

    if (error.code === "28P01") {
      console.error(
        "💡 Authentication failed. Check your database credentials."
      );
    } else if (error.code === "ECONNREFUSED") {
      console.error("💡 Connection refused. Is the database server running?");
    } else if (error.code === "ENOTFOUND") {
      console.error(
        "💡 Database host not found. Check your connection string."
      );
    }

    // Don't exit in production - let the app start and handle errors gracefully
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️  Continuing despite database connection error (development mode)"
      );
    }
    return false;
  }
};

// Test connection immediately
testConnection();

pool.on("connect", () => {
  const dbType =
    process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
      ? "Neon/Cloud"
      : "Local";
  console.log(`✅ New connection to ${dbType} PostgreSQL database`);
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  // Don't exit in production - let the app handle errors gracefully
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️  Continuing despite database pool error (development mode)"
    );
  }
});

module.exports = pool;
