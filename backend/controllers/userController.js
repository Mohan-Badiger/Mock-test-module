const pool = require('../config/database');

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, profile_picture, full_name, ai_credits FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Check for database connection errors
    if (error.code === '28P01' || error.message.includes('password authentication failed')) {
      return res.status(503).json({ 
        error: 'Database authentication failed',
        message: 'Please check your database password in backend/.env file',
        details: 'Update DB_PASSWORD to match your PostgreSQL password'
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Database connection refused',
        message: 'PostgreSQL server is not running or not accessible'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, profile_picture, full_name, ai_credits, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile_picture, full_name } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET profile_picture = $1, full_name = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, username, email, profile_picture, full_name, ai_credits`,
      [profile_picture, full_name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

module.exports = {
  getUser,
  getUserProfile,
  updateUserProfile
};

