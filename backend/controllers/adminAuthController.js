const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin by username or email
    const result = await pool.query(
      'SELECT id, username, email, password_hash, full_name, is_active FROM admins WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const admin = result.rows[0];

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(403).json({ error: 'Admin account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      console.error('Admin login failed: Password mismatch');
      console.error(`  Username: ${username}`);
      console.error(`  Admin ID: ${admin.id}`);
      console.error(`  Hash prefix: ${admin.password_hash.substring(0, 20)}...`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    delete admin.password_hash;

    res.json({
      message: 'Admin login successful',
      admin,
      token
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    
    // Check for database connection errors
    if (error.code === '28P01' || error.message.includes('password authentication failed')) {
      return res.status(503).json({ 
        error: 'Database authentication failed',
        message: 'Please check your database password in backend/.env file'
      });
    }
    
    res.status(500).json({ error: 'Failed to login' });
  }
};

const adminLogout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  res.json({ message: 'Admin logout successful' });
};

module.exports = {
  adminLogin,
  adminLogout
};

