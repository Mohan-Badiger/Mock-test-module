const pool = require('../config/database');

const getQuestionsByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const result = await pool.query(
      `SELECT 
        q.*,
        d.name as difficulty_name,
        d.level as difficulty_level,
        json_agg(
          json_build_object(
            'id', ao.id,
            'option_text', ao.option_text,
            'is_correct', ao.is_correct,
            'option_order', ao.option_order
          ) ORDER BY ao.option_order
        ) as options
      FROM questions q
      LEFT JOIN difficulty_levels d ON q.difficulty_id = d.id
      LEFT JOIN answer_options ao ON q.id = ao.question_id
      WHERE q.test_id = $1
      GROUP BY q.id, d.name, d.level
      ORDER BY q.id`,
      [testId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

const getQuestionsByTestAndDifficulty = async (req, res) => {
  try {
    const { testId, difficultyId } = req.params;
    const result = await pool.query(
      `SELECT 
        q.*,
        d.name as difficulty_name,
        d.level as difficulty_level,
        json_agg(
          json_build_object(
            'id', ao.id,
            'option_text', ao.option_text,
            'is_correct', ao.is_correct,
            'option_order', ao.option_order
          ) ORDER BY ao.option_order
        ) as options
      FROM questions q
      LEFT JOIN difficulty_levels d ON q.difficulty_id = d.id
      LEFT JOIN answer_options ao ON q.id = ao.question_id
      WHERE q.test_id = $1 AND q.difficulty_id = $2
      GROUP BY q.id, d.name, d.level
      ORDER BY q.id`,
      [testId, difficultyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        q.*,
        d.name as difficulty_name,
        json_agg(
          json_build_object(
            'id', ao.id,
            'option_text', ao.option_text,
            'is_correct', ao.is_correct,
            'option_order', ao.option_order
          ) ORDER BY ao.option_order
        ) as options
      FROM questions q
      LEFT JOIN difficulty_levels d ON q.difficulty_id = d.id
      LEFT JOIN answer_options ao ON q.id = ao.question_id
      WHERE q.id = $1
      GROUP BY q.id, d.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { test_id, difficulty_id, question_text, marks, options } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const questionResult = await client.query(
        `INSERT INTO questions (test_id, difficulty_id, question_text, marks)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [test_id, difficulty_id, question_text, marks]
      );

      const questionId = questionResult.rows[0].id;

      if (options && options.length > 0) {
        for (const option of options) {
          await client.query(
            `INSERT INTO answer_options (question_id, option_text, is_correct, option_order)
             VALUES ($1, $2, $3, $4)`,
            [questionId, option.option_text, option.is_correct, option.option_order]
          );
        }
      }

      await client.query('COMMIT');

      // Update total_questions count in tests table
      await pool.query(
        'UPDATE tests SET total_questions = (SELECT COUNT(*) FROM questions WHERE test_id = $1) WHERE id = $1',
        [test_id]
      );

      // Fetch the full question with options
      const fullQuestionResult = await client.query(
        `SELECT 
          q.*,
          d.name as difficulty_name,
          json_agg(
            json_build_object(
              'id', ao.id,
              'option_text', ao.option_text,
              'is_correct', ao.is_correct,
              'option_order', ao.option_order
            ) ORDER BY ao.option_order
          ) as options
        FROM questions q
        LEFT JOIN difficulty_levels d ON q.difficulty_id = d.id
        LEFT JOIN answer_options ao ON q.id = ao.question_id
        WHERE q.id = $1
        GROUP BY q.id, d.name`,
        [questionId]
      );

      res.status(201).json(fullQuestionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_text, difficulty_id, marks, options } = req.body;

    await pool.query(
      `UPDATE questions 
       SET question_text = $1, difficulty_id = $2, marks = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [question_text, difficulty_id, marks, id]
    );

    if (options) {
      await pool.query('DELETE FROM answer_options WHERE question_id = $1', [id]);
      for (const option of options) {
        await pool.query(
          `INSERT INTO answer_options (question_id, option_text, is_correct, option_order)
           VALUES ($1, $2, $3, $4)`,
          [id, option.option_text, option.is_correct, option.option_order]
        );
      }
    }

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    // Get test_id before deleting
    const questionResult = await pool.query('SELECT test_id FROM questions WHERE id = $1', [id]);
    if (questionResult.rows.length > 0) {
      const testId = questionResult.rows[0].test_id;
      await pool.query('DELETE FROM questions WHERE id = $1', [id]);

      // Update total_questions count
      await pool.query(
        'UPDATE tests SET total_questions = (SELECT COUNT(*) FROM questions WHERE test_id = $1) WHERE id = $1',
        [testId]
      );
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

module.exports = {
  getQuestionsByTest,
  getQuestionsByTestAndDifficulty,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};

