const pool = require('../config/database');

const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const result = await pool.query(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, String(value)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

module.exports = {
  getSettings,
  updateSetting
};
