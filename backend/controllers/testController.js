const pool = require('../config/database');

const getDifficulties = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM difficulty_levels ORDER BY level');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching difficulties:', error);
    res.status(500).json({ error: 'Failed to fetch difficulties' });
  }
};

const getAllTests = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.id as category_id
      FROM tests t
      JOIN categories c ON t.category_id = c.id
      WHERE t.is_active = true AND (t.visibility = 'public' OR t.visibility IS NULL)
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND LOWER(c.name) = LOWER($${paramCount})`;
      params.push(category);
      paramCount++;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const totalTests = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTests / limit);

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      tests: result.rows,
      pagination: {
        total: totalTests,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching tests:', error);

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

    res.status(500).json({ error: 'Failed to fetch tests', details: error.message });
  }
};

const getTestsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await pool.query(
      `SELECT 
        t.*,
        c.name as category_name
      FROM tests t
      JOIN categories c ON t.category_id = c.id
      WHERE t.category_id = $1 AND t.is_active = true
      ORDER BY t.created_at DESC`,
      [categoryId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tests by category:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        t.*,
        c.name as category_name
      FROM tests t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
};

const createTest = async (req, res) => {
  try {
    const { title, description, category_id, total_questions, total_marks, duration_minutes, tagline, image_url, visibility, scheduled_date, company_name, role_position, questions_per_difficulty } = req.body;

    // Auto-calculate duration if not provided: 2 minutes per question
    const calculatedDuration = duration_minutes || (total_questions ? total_questions * 2 : 60);

    // Auto-calculate passing marks: 50% of total marks
    const passingMarks = total_marks ? Math.floor(total_marks * 0.5) : 15;

    const result = await pool.query(
      `INSERT INTO tests (title, description, category_id, total_questions, total_marks, duration_minutes, passing_marks, questions_per_difficulty, tagline, image_url, visibility, scheduled_date, company_name, role_position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [title, description, category_id, total_questions, total_marks, calculatedDuration, passingMarks, questions_per_difficulty || 30, tagline, image_url, visibility || 'public', scheduled_date || null, company_name || null, role_position || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, total_questions, total_marks, duration_minutes, tagline, image_url, is_active, visibility, scheduled_date, company_name, role_position, questions_per_difficulty, passing_marks } = req.body;

    // Auto-calculate duration if not provided: 2 minutes per question
    const calculatedDuration = duration_minutes || (total_questions ? total_questions * 2 : 60);

    // Auto-calculate passing marks if not provided: 50% of total marks
    const calculatedPassingMarks = passing_marks !== undefined ? passing_marks : (total_marks ? Math.floor(total_marks * 0.5) : 15);

    const result = await pool.query(
      `UPDATE tests 
       SET title = $1, description = $2, category_id = $3, total_questions = $4, 
           total_marks = $5, duration_minutes = $6, passing_marks = $7, questions_per_difficulty = $8,
           tagline = $9, image_url = $10, is_active = $11, visibility = $12, 
           scheduled_date = $13, company_name = $14, role_position = $15, updated_at = CURRENT_TIMESTAMP
       WHERE id = $16
       RETURNING *`,
      [title, description, category_id, total_questions, total_marks, calculatedDuration, calculatedPassingMarks, questions_per_difficulty || 30, tagline, image_url, is_active, visibility || 'public', scheduled_date || null, company_name || null, role_position || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tests WHERE id = $1', [id]);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

// Admin: Get all tests regardless of visibility
const getAllTestsForAdmin = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.id as category_id
      FROM tests t
      JOIN categories c ON t.category_id = c.id
      WHERE t.is_active = true
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND LOWER(c.name) = LOWER($${paramCount})`;
      params.push(category);
      paramCount++;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const totalTests = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTests / limit);

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      tests: result.rows,
      pagination: {
        total: totalTests,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching tests for admin:', error);

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

    res.status(500).json({ error: 'Failed to fetch tests', details: error.message });
  }
};

module.exports = {
  getAllTests,
  getAllTestsForAdmin,
  getTestsByCategory,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getDifficulties
};

