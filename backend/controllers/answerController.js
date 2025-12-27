const pool = require('../config/database');

const submitAnswer = async (req, res) => {
  try {
    const { attempt_id, question_id, selected_option_id, time_spent_seconds, is_skipped } = req.body;
    
    // Check if answer exists
    const existingAnswer = await pool.query(
      'SELECT id FROM user_answers WHERE attempt_id = $1 AND question_id = $2',
      [attempt_id, question_id]
    );
    
    // Get correct answer
    const correctOption = await pool.query(
      'SELECT id FROM answer_options WHERE question_id = $1 AND is_correct = true',
      [question_id]
    );
    
    const is_correct = correctOption.rows.length > 0 && 
                      correctOption.rows[0].id === selected_option_id;
    
    if (existingAnswer.rows.length > 0) {
      // Update existing answer
      await pool.query(
        `UPDATE user_answers 
         SET selected_option_id = $1, is_correct = $2, time_spent_seconds = $3, 
             is_skipped = $4, answered_at = CURRENT_TIMESTAMP
         WHERE attempt_id = $5 AND question_id = $6`,
        [selected_option_id, is_correct, time_spent_seconds, is_skipped, attempt_id, question_id]
      );
    } else {
      // Insert new answer
      await pool.query(
        `INSERT INTO user_answers (attempt_id, question_id, selected_option_id, is_correct, time_spent_seconds, is_skipped)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [attempt_id, question_id, selected_option_id, is_correct, time_spent_seconds, is_skipped]
      );
    }
    
    res.json({ message: 'Answer submitted successfully', is_correct });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

const getAnswersByAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const result = await pool.query(
      `SELECT 
        ua.*,
        q.question_text,
        ao.option_text as selected_option_text
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      LEFT JOIN answer_options ao ON ua.selected_option_id = ao.id
      WHERE ua.attempt_id = $1
      ORDER BY ua.answered_at`,
      [attemptId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
};

module.exports = {
  submitAnswer,
  getAnswersByAttempt
};

