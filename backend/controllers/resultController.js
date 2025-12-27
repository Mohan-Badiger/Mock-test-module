const pool = require('../config/database');

const startTestAttempt = async (req, res) => {
  try {
    // Get user_id from authenticated token (req.user is set by authenticate middleware)
    const user_id = req.user?.userId;

    if (!user_id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const { test_id, difficulty_id } = req.body;

    if (!test_id || !difficulty_id) {
      return res.status(400).json({ error: 'test_id and difficulty_id are required' });
    }

    const result = await pool.query(
      `INSERT INTO test_attempts (user_id, test_id, difficulty_id, status, started_at)
       VALUES ($1, $2, $3, 'in_progress', CURRENT_TIMESTAMP)
       RETURNING *`,
      [user_id, test_id, difficulty_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error starting test attempt:', error);
    res.status(500).json({ error: 'Failed to start test attempt' });
  }
};

const finishTestAttempt = async (req, res) => {
  try {
    const { attempt_id } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Calculate scores
      const answersResult = await client.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct,
          SUM(CASE WHEN is_skipped = true THEN 1 ELSE 0 END) as skipped
        FROM user_answers
        WHERE attempt_id = $1`,
        [attempt_id]
      );

      const { total, correct, skipped } = answersResult.rows[0];
      const attempted = total - skipped;

      // Get test details for total questions
      const attemptResult = await client.query(
        `SELECT t.total_questions, ta.started_at
         FROM test_attempts ta
         JOIN tests t ON ta.test_id = t.id
         WHERE ta.id = $1`,
        [attempt_id]
      );

      const totalQuestions = attemptResult.rows[0].total_questions;
      const startedAt = attemptResult.rows[0].started_at;

      // Calculate time taken
      const timeTaken = Math.floor((new Date() - new Date(startedAt)) / 1000);

      // Update attempt
      await client.query(
        `UPDATE test_attempts 
         SET completed_at = CURRENT_TIMESTAMP,
             time_taken_seconds = $1,
             total_score = $2,
             total_questions = $3,
             questions_attempted = $4,
             questions_skipped = $5,
             status = 'completed'
         WHERE id = $6`,
        [timeTaken, correct, totalQuestions, attempted, skipped, attempt_id]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Test completed successfully',
        attempt_id,
        score: correct,
        total: totalQuestions,
        attempted,
        skipped
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error finishing test attempt:', error);
    res.status(500).json({ error: 'Failed to finish test attempt' });
  }
};

const getAttemptDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        ta.*,
        t.title as test_title,
        d.name as difficulty_name
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      LEFT JOIN difficulty_levels d ON ta.difficulty_id = d.id
      WHERE ta.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    res.status(500).json({ error: 'Failed to fetch attempt details' });
  }
};

const getTestSummary = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // Get attempt details
    const attemptResult = await pool.query(
      `SELECT 
        ta.*,
        t.total_questions,
        d.name as difficulty_name
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      LEFT JOIN difficulty_levels d ON ta.difficulty_id = d.id
      WHERE ta.id = $1`,
      [attemptId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attemptResult.rows[0];

    // Get answer summary
    const answersResult = await pool.query(
      `SELECT 
        q.id as question_id,
        q.question_text,
        ua.is_correct,
        ua.is_skipped,
        ao_selected.option_text as selected_option,
        (SELECT option_text FROM answer_options WHERE question_id = q.id AND is_correct = true LIMIT 1) as correct_answer,
        (
          SELECT json_agg(option_text ORDER BY option_order)
          FROM answer_options
          WHERE question_id = q.id
        ) as options
      FROM questions q
      LEFT JOIN user_answers ua ON q.id = ua.question_id AND ua.attempt_id = $1
      LEFT JOIN answer_options ao_selected ON ua.selected_option_id = ao_selected.id
      WHERE q.test_id = $2
      ORDER BY q.id`,
      [attemptId, attempt.test_id]
    );

    res.json({
      attempt,
      questions: answersResult.rows,
      total_questions: attempt.total_questions,
      questions_attempted: attempt.questions_attempted || 0,
      questions_skipped: attempt.questions_skipped || 0
    });
  } catch (error) {
    console.error('Error fetching test summary:', error);
    res.status(500).json({ error: 'Failed to fetch test summary' });
  }
};

const generatePerformanceAnalysis = async (req, res) => {
  try {
    const { attemptId } = req.body;

    // Check system settings first
    const settingsResult = await pool.query("SELECT value FROM system_settings WHERE key = 'performance_analysis_enabled'");
    const isAnalysisEnabled = settingsResult.rows.length > 0 ? settingsResult.rows[0].value === 'true' : true;

    if (!isAnalysisEnabled) {
      return res.json({
        strengths: "Performance analysis is currently disabled.",
        areasForImprovement: [
          "Taking too much time to solve questions",
          "Not fully utilised test time",
          "If mark is too less - need to complete a dedicated course",
          "Need more practice"
        ]
      });
    }

    // Fetch attempt details
    const attemptResult = await pool.query(
      `SELECT 
        ta.*,
        t.title as test_title,
        d.name as difficulty_name
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      LEFT JOIN difficulty_levels d ON ta.difficulty_id = d.id
      WHERE ta.id = $1`,
      [attemptId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attemptResult.rows[0];

    // Fetch user answers (incorrect ones mainly) to analyze
    const answersResult = await pool.query(
      `SELECT 
        q.question_text,
        ua.is_correct,
        ua.is_skipped
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.attempt_id = $1 AND ua.is_correct = false AND ua.is_skipped = false
      LIMIT 10`,
      [attemptId]
    );

    const incorrectQuestions = answersResult.rows.map(r => r.question_text);

    const prompt = `Analyze the performance of a candidate in a mock test.
    Test: ${attempt.test_title}
    Difficulty: ${attempt.difficulty_name}
    Score: ${attempt.total_score}/${attempt.total_questions}
    
    The candidate got these questions wrong (sample):
    ${incorrectQuestions.map(q => `- ${q}`).join('\n')}
    
    Provide a JSON response with:
    1. "strengths": A paragraph describing likely strengths (infer from the fact they took this test, or general positive reinforcement if score is low).
    2. "areasForImprovement": An array of strings (bullet points) suggesting specific topics to study based on the wrong questions.
    
    Return ONLY valid JSON.`;

    if (process.env.OPENAI_API_KEY) {
      const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-v1-');
      const apiEndpoint = process.env.OPENAI_BASE_URL ||
        (isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions');
      const model = process.env.OPENAI_MODEL || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...(isOpenRouter && {
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            'X-Title': 'Mock Test Module'
          })
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || '{}';
      let analysis;
      try {
        analysis = JSON.parse(raw);
      } catch (e) {
        const match = raw.match(/\{[\s\S]*\}/);
        analysis = match ? JSON.parse(match[0]) : { strengths: "Analysis failed to parse.", areasForImprovement: [] };
      }

      return res.json(analysis);
    } else {
      // Mock response if no key
      return res.json({
        strengths: "Great effort! You showed good understanding of basic concepts.",
        areasForImprovement: [
          "Review the specific topics where you made mistakes.",
          "Practice more questions on this subject."
        ]
      });
    }

  } catch (error) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
};

const getTestHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    // Query tables directly instead of view
    const result = await pool.query(
      `SELECT 
        ta.id as attempt_id,
        ta.user_id,
        ta.test_id,
        ta.total_score,
        ta.total_questions,
        ta.completed_at,
        t.title as test_title,
        c.name as category_name
       FROM test_attempts ta
       JOIN tests t ON ta.test_id = t.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE ta.user_id = $1 AND ta.status = 'completed'
       ORDER BY ta.completed_at DESC
       LIMIT 10`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching test history:', error);
    res.status(500).json({ error: 'Failed to fetch test history' });
  }
};

module.exports = {
  startTestAttempt,
  finishTestAttempt,
  getAttemptDetails,
  getTestSummary,
  getTestHistory,
  generatePerformanceAnalysis
};

