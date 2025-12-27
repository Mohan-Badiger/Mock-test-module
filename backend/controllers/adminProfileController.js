const pool = require('../config/database');

const getAdminProfile = async (req, res) => {
  try {
    // Get admin ID from authenticated token (req.admin is set by authenticateAdmin middleware)
    const adminId = req.admin?.adminId;
    
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const result = await pool.query(
      'SELECT id, username, email, full_name, is_active, created_at FROM admins WHERE id = $1',
      [adminId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    // Get admin ID from authenticated token
    const adminId = req.admin?.adminId;
    
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const { full_name } = req.body;
    
    // Only allow updating full_name (username and email should not be changed)
    const result = await pool.query(
      `UPDATE admins 
       SET full_name = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, email, full_name, is_active, created_at`,
      [full_name, adminId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ error: 'Failed to update admin profile' });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile
};

