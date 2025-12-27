const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, ai_credits)
       VALUES ($1, $2, $3, $4, 7)
       RETURNING id, username, email, full_name, profile_picture, ai_credits`,
      [username, email, password_hash, full_name || username]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const result = await pool.query(
      'SELECT id, username, email, password_hash, full_name, profile_picture, ai_credits FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    
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

const logout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logout successful' });
};

module.exports = {
  register,
  login,
  logout
};


