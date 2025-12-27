const pool = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const getDifficulties = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM difficulty_levels ORDER BY level');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching difficulties:', error);
    res.status(500).json({ error: 'Failed to fetch difficulties' });
  }
};

// Placeholder for AI question generation - you would integrate with Grok AI here
const generateQuestionsWithAI = async (req, res) => {
  try {
    const { test_id, difficulty_id, count } = req.body;

    // This is a placeholder - integrate with Grok AI API
    // For now, return a message indicating where to integrate
    res.json({
      message: 'AI question generation endpoint',
      note: 'Integrate with Grok AI API here to generate questions based on test_id and difficulty_id',
      test_id,
      difficulty_id,
      count: count || 10
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

// Generate questions for all 5 difficulty levels
async function generateAllDifficultyLevels(req, res) {
  try {
    const { topic, company_name, role_position, ai_provider, questions_per_difficulty } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const questionsPerDiff = questions_per_difficulty ? parseInt(questions_per_difficulty) : 30;
    const selectedProvider = ai_provider || 'openai';
    const difficultyLevels = [
      { level: 1, name: 'Novice' },
      { level: 2, name: 'Easy' },
      { level: 3, name: 'Intermediate' },
      { level: 4, name: 'Master' },
      { level: 5, name: 'Expert' }
    ];

    let allGeneratedQuestions = [];
    let totalCount = 0;

    // Generate questions for each difficulty level
    for (const difficulty of difficultyLevels) {
      // Call the existing generateAIQuestionsPreview logic for each difficulty
      const mockReq = {
        body: {
          topic,
          company_name,
          role_position,
          difficulty_level: difficulty.level,
          ai_provider: selectedProvider,
          questions_per_difficulty: questionsPerDiff
        }
      };

      // Generate questions for this difficulty level
      // For now, we'll use the simplified approach and call the preview function internally
      // In production, you might want to refactor the generation logic into a shared function
      try {
        await new Promise((resolve, reject) => {
          const mockRes = {
            json: (data) => {
              if (data.questions) {
                allGeneratedQuestions.push(...data.questions.map(q => ({
                  ...q,
                  difficulty_level: difficulty.level,
                  difficulty_name: difficulty.name
                })));
                totalCount += data.questions.length;
              }
              resolve();
            },
            status: (code) => ({
              json: (error) => reject(new Error(error.error || 'Generation failed'))
            })
          };
          generateAIQuestionsPreview(mockReq, mockRes);
        });
      } catch (error) {
        console.error(`Error generating for difficulty ${difficulty.name}:`, error);
        // Continue with other difficulties even if one fails
      }
    }

    res.json({
      message: `Generated questions for all ${difficultyLevels.length} difficulty levels`,
      topic,
      company_name,
      role_position,
      total_count: totalCount,
      questions_per_difficulty: questionsPerDiff,
      difficulties: difficultyLevels.map(d => d.name),
      preview: `${totalCount} total questions generated (${questionsPerDiff} per difficulty × 5 levels)`
    });
  } catch (error) {
    console.error('Error generating questions for all difficulties:', error);
    res.status(500).json({ error: 'Failed to generate questions for all difficulties' });
  }
}

module.exports = {
  getCategories,
  getDifficulties,
  generateQuestionsWithAI,
  generateAIQuestionsPreview,
  approveAIQuestions,
  generateAllDifficultyLevels
};

// Generate AI questions (preview only)
async function generateAIQuestionsPreview(req, res) {
  try {
    const { topic, company_name, role_position, difficulty_level, ai_provider, questions_per_difficulty, description, count } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    // Number of questions to generate per difficulty level
    // Use 'count' if provided (from new frontend), otherwise fall back to questions_per_difficulty or default 30
    const questionsPerDiff = count ? parseInt(count) : (questions_per_difficulty ? parseInt(questions_per_difficulty) : 30);

    // Validate difficulty level (1-5)
    const difficultyNum = difficulty_level ? parseInt(difficulty_level) : 3;
    if (difficultyNum < 1 || difficultyNum > 5) {
      return res.status(400).json({ error: 'Difficulty level must be between 1 and 5' });
    }

    // Track which AI provider is being used
    const selectedProvider = ai_provider || 'openai';

    // If OpenAI key is present, call OpenAI to generate 30 MCQs
    if (process.env.OPENAI_API_KEY) {
      try {
        // Build enhanced prompt with company, role, and difficulty
        const companyContext = company_name ? `for ${company_name}` : '';
        const roleContext = role_position ? `for the ${role_position} position` : '';
        const descriptionContext = description ? `\nAdditional Context/Description: ${description}` : '';
        const difficultyNames = { 1: 'Novice', 2: 'Easy', 3: 'Intermediate', 4: 'Master', 5: 'Expert' };
        const difficultyName = difficultyNames[difficultyNum] || 'Intermediate';

        const prompt = `You are an expert technical interviewer creating multiple-choice questions (MCQs) for a reputed company's recruitment process.

Context:
- Company: ${company_name || 'A reputed technology company'}
- Role/Position: ${role_position || 'Software Engineer'}
- Topic: ${topic}
- Difficulty Level: ${difficultyNum}/5 (${difficultyName})${descriptionContext}

Generate exactly ${questionsPerDiff} high-quality MCQs that:
1. Are relevant to ${topic} ${roleContext}
2. Match the ${difficultyName} difficulty level (${difficultyNum}/5)
3. Are appropriate for ${company_name || 'a top-tier company'} interview standards
4. Test practical knowledge, problem-solving, and conceptual understanding
5. Each question must have exactly 4 options (A, B, C, D) with one clearly correct answer

Return ONLY valid JSON array (no markdown, no explanations, no code blocks), with this exact structure:
[
  {
    "topic": "${topic}",
    "question_text": "Question text here",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "source": "openai"
  },
  ...
]

Ensure all ${questionsPerDiff} questions are unique, relevant, and appropriate for the specified difficulty level and role.`;

        // Check if using OpenRouter (key starts with sk-or-v1-)
        const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-v1-');
        const apiEndpoint = process.env.OPENAI_BASE_URL ||
          (isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions');

        // For OpenRouter, we might need to adjust the model if not specified
        // OpenRouter supports openai/gpt-3.5-turbo, openai/gpt-4, etc. or other providers
        // Default to a good model if not set
        const model = process.env.OPENAI_MODEL || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...(isOpenRouter && {
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000', // Optional for OpenRouter
              'X-Title': 'Mock Test Admin' // Optional for OpenRouter
            })
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content || '[]';
        let questions;
        try {
          questions = JSON.parse(raw);
        } catch (e) {
          // Try to extract JSON substring if wrapping text present
          const match = raw.match(/\[[\s\S]*\]/);
          questions = match ? JSON.parse(match[0]) : [];
        }

        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('OpenAI returned no questions');
        }

        // Normalize and validate
        const normalized = questions.slice(0, questionsPerDiff).map((q) => ({
          topic: String(q.topic || topic),
          question_text: String(q.question_text || ''),
          option_a: String(q.option_a || ''),
          option_b: String(q.option_b || ''),
          option_c: String(q.option_c || ''),
          option_d: String(q.option_d || ''),
          correct_option: ['A', 'B', 'C', 'D'].includes(String(q.correct_option || '').toUpperCase()) ? String(q.correct_option).toUpperCase() : 'A',
          source: selectedProvider,
          difficulty_level: difficultyNum
        })).filter(q => q.question_text && q.option_a && q.option_b && q.option_c && q.option_d);

        if (normalized.length === 0) {
          throw new Error('No valid questions parsed from OpenAI');
        }

        const values = [];
        const placeholders = [];
        normalized.forEach((q, i) => {
          const base = i * 10;
          values.push(q.topic, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.source, q.difficulty_level, company_name || null);
          placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`);
        });

        // Store with company and role context
        await pool.query(
          `INSERT INTO ai_generated_questions (topic, question_text, option_a, option_b, option_c, option_d, correct_option, ai_provider, difficulty_level, company_name)
           VALUES ${placeholders.join(',')}`,
          values
        );

        return res.json({
          message: 'Preview generated via OpenAI',
          topic,
          company_name: company_name || null,
          role_position: role_position || null,
          difficulty_level: difficultyNum,
          count: normalized.length,
          questions: normalized
        });
      } catch (aiError) {
        console.error('OpenAI generation failed, falling back to mock:', aiError.message);
        // Fall through to mock generation below
      }
    }

    // Improved mock generator with varied stems/subtopics/options
    const subtopicsByTopic = {
      'Computer Fundamentals': [
        'CPU scheduling', 'primary memory', 'secondary storage', 'file systems', 'I/O devices', 'operating systems',
        'virtual memory', 'process synchronization', 'BIOS/UEFI', 'boot sequence', 'binary/hex', 'number systems',
        'computer architecture', 'cache memory', 'interrupts', 'DMA', 'throughput', 'latency', 'bandwidth', 'pipelining'
      ],
      'Data Structures': [
        'arrays', 'linked lists', 'stacks', 'queues', 'trees', 'graphs', 'hash tables', 'heaps', 'tries', 'sorting'
      ],
      'Computer Network': [
        'OSI layers', 'TCP/UDP', 'IP addressing', 'routing', 'switching', 'DNS', 'HTTP/HTTPS', 'firewalls', 'NAT', 'subnetting'
      ]
    };

    const genericSubtopics = ['concepts', 'principles', 'mechanisms', 'components', 'metrics', 'best practices'];
    const verbs = ['identify', 'best describes', 'is true about', 'is correct regarding', 'most impacts', 'is primarily used for'];
    const optionStarts = ['A. ', 'B. ', 'C. ', 'D. '];

    const subtopicPool = subtopicsByTopic[topic] || subtopicsByTopic['Computer Fundamentals'] || genericSubtopics;

    const makeQuestion = (idx) => {
      const sub = subtopicPool[idx % subtopicPool.length];
      const verb = verbs[idx % verbs.length];
      const stem = `(${idx + 1}) Which of the following ${verb} ${sub} in ${topic}?`;
      // Build options with slight variation
      const baseOptions = [
        `${sub} increases performance in specific scenarios`,
        `${sub} decreases latency but increases complexity`,
        `${sub} is unrelated to ${topic} in practice`,
        `${sub} is primarily managed by the operating system`
      ];
      // shuffle reproducibly based on idx
      const shuffled = [...baseOptions].sort((a, b) => ((a.length + idx) % 7) - ((b.length + idx) % 7));
      const correctIndex = idx % 4; // rotate correct answer
      const correctOption = ['A', 'B', 'C', 'D'][correctIndex];
      // rotate options so correct lands at correctIndex
      const rotated = [0, 1, 2, 3].map((k, i) => shuffled[(i + (4 - correctIndex)) % 4]);

      return {
        topic,
        question_text: stem,
        option_a: rotated[0],
        option_b: rotated[1],
        option_c: rotated[2],
        option_d: rotated[3],
        correct_option: correctOption,
        source: 'ai'
      };
    };

    const questions = Array.from({ length: questionsPerDiff }, (_, i) => makeQuestion(i));

    // Store preview to ai_generated_questions
    const values = [];
    const placeholders = [];
    questions.forEach((q, i) => {
      const base = i * 10;
      values.push(q.topic, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, selectedProvider, difficultyNum, company_name || null);
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`);
    });

    await pool.query(
      `INSERT INTO ai_generated_questions (topic, question_text, option_a, option_b, option_c, option_d, correct_option, ai_provider, difficulty_level, company_name)
       VALUES ${placeholders.join(',')}`,
      values
    );

    res.json({ message: 'Preview generated', topic, count: questions.length, questions });
  } catch (error) {
    console.error('Error generating AI questions preview:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
}

// Approve AI questions and save into normalized schema
async function approveAIQuestions(req, res) {
  const client = await pool.connect();
  try {
    const { topic, test_id, difficulty_id, questions: editedQuestions, approve_all_difficulties } = req.body;
    if (!topic || !test_id) {
      return res.status(400).json({ error: 'topic and test_id are required' });
    }

    await client.query('BEGIN');

    let questionsToProcess = [];

    // 1. Gather all questions to be saved
    if (approve_all_difficulties) {
      // Fetch all difficulty levels (1-5)
      const difficultyLevels = [1, 2, 3, 4, 5];

      for (const diffLevel of difficultyLevels) {
        const { rows } = await client.query(
          'SELECT * FROM ai_generated_questions WHERE topic = $1 AND difficulty_level = $2 ORDER BY id',
          [topic, diffLevel]
        );

        rows.forEach(row => {
          questionsToProcess.push({
            ...row,
            target_difficulty_id: diffLevel
          });
        });
      }
    } else {
      if (!difficulty_id) {
        return res.status(400).json({ error: 'difficulty_id is required when not approving all difficulties' });
      }

      if (editedQuestions && Array.isArray(editedQuestions) && editedQuestions.length > 0) {
        questionsToProcess = editedQuestions.map(q => ({
          ...q,
          target_difficulty_id: difficulty_id
        }));
      } else {
        const { rows } = await client.query(
          'SELECT * FROM ai_generated_questions WHERE topic = $1 AND (difficulty_level = $2 OR difficulty_level IS NULL) ORDER BY id',
          [topic, difficulty_id]
        );
        questionsToProcess = rows.map(row => ({
          ...row,
          target_difficulty_id: difficulty_id
        }));
      }
    }

    if (questionsToProcess.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ message: 'No questions to approve', count: 0 });
    }

    // 2. Bulk Insert Questions
    // We'll use a loop for now because we need the returned IDs for options, 
    // but we can optimize by preparing the statement or using a more complex CTE if needed.
    // For 10-50 questions, a loop with prepared statement is acceptable, 
    // but let's try to batch it slightly better if possible, or just stick to the loop for simplicity but clean up the code.
    // Actually, to truly optimize for "thousands", we should use a single query with UNNEST or VALUES.
    // Let's use a loop for Questions to get IDs, but do Options in one big batch per question is still N queries.
    // Better: Insert all questions in one go, get IDs back.

    // Construct bulk insert for Questions
    const questionValues = [];
    const questionPlaceholders = [];
    questionsToProcess.forEach((q, i) => {
      const base = i * 4;
      questionValues.push(test_id, q.target_difficulty_id, q.question_text, 1);
      questionPlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
    });

    const questionsQuery = `
      INSERT INTO questions (test_id, difficulty_id, question_text, marks)
      VALUES ${questionPlaceholders.join(',')}
      RETURNING id
    `;

    const questionsResult = await client.query(questionsQuery, questionValues);
    const newQuestionIds = questionsResult.rows.map(r => r.id);

    // 3. Bulk Insert Options
    // Now we have IDs corresponding to questionsToProcess (assuming order is preserved, which RETURNING usually does in PG)
    const optionValues = [];
    const optionPlaceholders = [];
    let optCounter = 0;

    questionsToProcess.forEach((q, idx) => {
      const qid = newQuestionIds[idx];
      const options = [
        { text: q.option_a, correct: q.correct_option === 'A', order: 1 },
        { text: q.option_b, correct: q.correct_option === 'B', order: 2 },
        { text: q.option_c, correct: q.correct_option === 'C', order: 3 },
        { text: q.option_d, correct: q.correct_option === 'D', order: 4 }
      ];

      options.forEach(opt => {
        const base = optCounter * 4;
        optionValues.push(qid, opt.text, opt.correct, opt.order);
        optionPlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
        optCounter++;
      });
    });

    const optionsQuery = `
      INSERT INTO answer_options (question_id, option_text, is_correct, option_order)
      VALUES ${optionPlaceholders.join(',')}
    `;

    await client.query(optionsQuery, optionValues);

    // Clean up previews for topic
    await client.query('DELETE FROM ai_generated_questions WHERE topic = $1', [topic]);

    await client.query('COMMIT');

    // Update total_questions count for the test
    await pool.query(
      'UPDATE tests SET total_questions = (SELECT COUNT(*) FROM questions WHERE test_id = $1) WHERE id = $1',
      [test_id]
    );
    res.json({ message: 'Questions approved and saved', count: questionsToProcess.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving AI questions:', error);
    res.status(500).json({ error: 'Failed to approve questions', details: error.message });
  } finally {
    client.release();
  }
}

// Job storage (in-memory)
const jobs = new Map();

// Helper to generate a UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Start a background generation job
const startGenerationJob = async (req, res) => {
  try {
    const { topic, company_name, role_position, difficulty_level, ai_provider, description, count } = req.body;

    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const jobId = generateUUID();
    const totalCount = parseInt(count) || 30;

    // Initialize job
    jobs.set(jobId, {
      id: jobId,
      status: 'pending',
      progress: 0,
      total: totalCount,
      generated: 0,
      questions: [],
      error: null,
      createdAt: Date.now()
    });

    // Start processing in background
    processGeneration(jobId, {
      topic,
      company_name,
      role_position,
      difficulty_level: parseInt(difficulty_level) || 3,
      ai_provider: ai_provider || 'openai',
      description,
      count: totalCount
    });

    res.json({ jobId, message: 'Generation started' });
  } catch (error) {
    console.error('Error starting generation job:', error);
    res.status(500).json({ error: 'Failed to start generation job' });
  }
};

// Get job status
const getGenerationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
};

// Internal function to process the generation job
const processGeneration = async (jobId, params) => {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';

  try {
    const BATCH_SIZE = 5; // Generate 5 questions per request
    const CONCURRENCY = 3; // Run 3 requests in parallel
    const batches = Math.ceil(params.count / BATCH_SIZE);
    const chunks = [];

    for (let i = 0; i < batches; i++) {
      chunks.push(Math.min(BATCH_SIZE, params.count - (i * BATCH_SIZE)));
    }

    // Process chunks with concurrency limit
    for (let i = 0; i < chunks.length; i += CONCURRENCY) {
      const currentBatch = chunks.slice(i, i + CONCURRENCY);
      const promises = currentBatch.map(batchCount =>
        generateBatch(params, batchCount)
      );

      const results = await Promise.all(promises);

      // Process results
      for (const result of results) {
        if (result && result.length > 0) {
          job.questions.push(...result);
          job.generated += result.length;
        }
      }

      // Update progress
      job.progress = Math.min(100, Math.round((job.generated / job.total) * 100));

      // Save intermediate results to DB (optional, but good for preview persistence)
      // For now, we accumulate in memory and save at the end or let the frontend approve
    }

    // Save all generated questions to DB for preview (compatibility with existing flow)
    if (job.questions.length > 0) {
      await saveQuestionsToDB(job.questions, params);
    }

    job.status = 'completed';
    job.progress = 100;

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    job.status = 'failed';
    job.error = error.message;
  }
};

// Helper to generate a batch of questions
const generateBatch = async (params, count) => {
  const { topic, company_name, role_position, difficulty_level, ai_provider, description } = params;

  // Reuse the prompt logic from generateAIQuestionsPreview but return array instead of saving
  // This is a simplified version of the logic in generateAIQuestionsPreview

  const difficultyNames = { 1: 'Novice', 2: 'Easy', 3: 'Intermediate', 4: 'Master', 5: 'Expert' };
  const difficultyName = difficultyNames[difficulty_level] || 'Intermediate';

  const prompt = `You are an expert technical interviewer creating multiple-choice questions (MCQs).
Context:
- Company: ${company_name || 'A reputed technology company'}
- Role: ${role_position || 'Software Engineer'}
- Topic: ${topic}
- Difficulty: ${difficulty_level}/5 (${difficultyName})${description ? `\n- Note: ${description}` : ''}

Generate exactly ${count} unique MCQs.
Return ONLY valid JSON array:
[
  {
    "topic": "${topic}",
    "question_text": "Question",
    "option_a": "A", "option_b": "B", "option_c": "C", "option_d": "D",
    "correct_option": "A"
  }
]`;

  try {
    // Call OpenAI (assuming key exists)
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
            'X-Title': 'Mock Test Admin'
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
      const raw = data.choices?.[0]?.message?.content || '[]';
      let questions = [];
      try {
        questions = JSON.parse(raw);
      } catch (e) {
        const match = raw.match(/\[[\s\S]*\]/);
        questions = match ? JSON.parse(match[0]) : [];
      }

      return questions.map(q => ({
        ...q,
        source: ai_provider,
        difficulty_level: difficulty_level,
        company_name: company_name
      }));
    } else {
      // Mock generation
      return Array.from({ length: count }, (_, i) => ({
        topic,
        question_text: `Mock Question ${i + 1} about ${topic}`,
        option_a: "Option A", option_b: "Option B", option_c: "Option C", option_d: "Option D",
        correct_option: "A",
        source: 'mock',
        difficulty_level,
        company_name
      }));
    }
  } catch (e) {
    console.error('Batch generation failed:', e);
    return [];
  }
};

// Helper to save questions to DB
const saveQuestionsToDB = async (questions, params) => {
  if (!questions.length) return;

  const values = [];
  const placeholders = [];

  questions.forEach((q, i) => {
    const base = i * 10;
    values.push(
      q.topic || params.topic,
      q.question_text,
      q.option_a, q.option_b, q.option_c, q.option_d,
      q.correct_option,
      q.source || 'ai',
      q.difficulty_level || params.difficulty_level,
      q.company_name || params.company_name
    );
    placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`);
  });

  await pool.query(
    `INSERT INTO ai_generated_questions (topic, question_text, option_a, option_b, option_c, option_d, correct_option, ai_provider, difficulty_level, company_name)
     VALUES ${placeholders.join(',')}`,
    values
  );
};

// Start a background approval job
const startApprovalJob = async (req, res) => {
  try {
    const { topic, test_id, difficulty_id, questions, approve_all_difficulties } = req.body;

    if (!topic || !test_id) {
      return res.status(400).json({ error: 'topic and test_id are required' });
    }

    const jobId = generateUUID();

    // Initialize job
    jobs.set(jobId, {
      id: jobId,
      status: 'pending',
      progress: 0,
      total: 0,
      processed: 0,
      error: null,
      createdAt: Date.now()
    });

    // Start processing in background
    processApproval(jobId, {
      topic,
      test_id,
      difficulty_id,
      questions,
      approve_all_difficulties
    });

    res.json({ jobId, message: 'Approval started' });
  } catch (error) {
    console.error('Error starting approval job:', error);
    res.status(500).json({ error: 'Failed to start approval job' });
  }
};

// Internal function to process the approval job
const processApproval = async (jobId, params) => {
  const job = jobs.get(jobId);
  if (!job) return;

  const client = await pool.connect();
  job.status = 'processing';

  try {
    const { topic, test_id, difficulty_id, questions: editedQuestions, approve_all_difficulties } = params;

    let questionsToProcess = [];

    // 1. Gather all questions to be saved
    if (approve_all_difficulties) {
      const difficultyLevels = [1, 2, 3, 4, 5];
      for (const diffLevel of difficultyLevels) {
        const { rows } = await client.query(
          'SELECT * FROM ai_generated_questions WHERE topic = $1 AND difficulty_level = $2 ORDER BY id',
          [topic, diffLevel]
        );
        rows.forEach(row => {
          questionsToProcess.push({ ...row, target_difficulty_id: diffLevel });
        });
      }
    } else {
      if (editedQuestions && Array.isArray(editedQuestions) && editedQuestions.length > 0) {
        questionsToProcess = editedQuestions.map(q => ({
          ...q,
          target_difficulty_id: difficulty_id
        }));
      } else {
        const { rows } = await client.query(
          'SELECT * FROM ai_generated_questions WHERE topic = $1 AND (difficulty_level = $2 OR difficulty_level IS NULL) ORDER BY id',
          [topic, difficulty_id]
        );
        questionsToProcess = rows.map(row => ({
          ...row,
          target_difficulty_id: difficulty_id
        }));
      }
    }

    job.total = questionsToProcess.length;

    if (job.total === 0) {
      job.status = 'completed';
      job.progress = 100;
      client.release();
      return;
    }

    // 2. Process in chunks to update progress
    const CHUNK_SIZE = 20; // Process 20 questions at a time
    const chunks = [];
    for (let i = 0; i < job.total; i += CHUNK_SIZE) {
      chunks.push(questionsToProcess.slice(i, i + CHUNK_SIZE));
    }

    await client.query('BEGIN');

    for (const chunk of chunks) {
      // Bulk Insert Questions for this chunk
      const questionValues = [];
      const questionPlaceholders = [];
      chunk.forEach((q, i) => {
        const base = i * 4;
        questionValues.push(test_id, q.target_difficulty_id, q.question_text, 1);
        questionPlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
      });

      const questionsQuery = `
        INSERT INTO questions (test_id, difficulty_id, question_text, marks)
        VALUES ${questionPlaceholders.join(',')}
        RETURNING id
      `;

      const questionsResult = await client.query(questionsQuery, questionValues);
      const newQuestionIds = questionsResult.rows.map(r => r.id);

      // Bulk Insert Options for this chunk
      const optionValues = [];
      const optionPlaceholders = [];
      let optCounter = 0;

      chunk.forEach((q, idx) => {
        const qid = newQuestionIds[idx];
        const options = [
          { text: q.option_a, correct: q.correct_option === 'A', order: 1 },
          { text: q.option_b, correct: q.correct_option === 'B', order: 2 },
          { text: q.option_c, correct: q.correct_option === 'C', order: 3 },
          { text: q.option_d, correct: q.correct_option === 'D', order: 4 }
        ];

        options.forEach(opt => {
          const base = optCounter * 4;
          optionValues.push(qid, opt.text, opt.correct, opt.order);
          optionPlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
          optCounter++;
        });
      });

      const optionsQuery = `
        INSERT INTO answer_options (question_id, option_text, is_correct, option_order)
        VALUES ${optionPlaceholders.join(',')}
      `;

      await client.query(optionsQuery, optionValues);

      // Update progress
      job.processed += chunk.length;
      job.progress = Math.min(100, Math.round((job.processed / job.total) * 100));

      // Small delay to allow event loop to breathe if needed, or just proceed
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Clean up previews for topic
    await client.query('DELETE FROM ai_generated_questions WHERE topic = $1', [topic]);

    await client.query('COMMIT');

    // Update total_questions count
    await pool.query(
      'UPDATE tests SET total_questions = (SELECT COUNT(*) FROM questions WHERE test_id = $1) WHERE id = $1',
      [test_id]
    );

    job.status = 'completed';
    job.progress = 100;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Approval job ${jobId} failed:`, error);
    job.status = 'failed';
    job.error = error.message;
  } finally {
    client.release();
  }
};

module.exports = {
  getCategories,
  getDifficulties,
  generateQuestionsWithAI,
  generateAIQuestionsPreview,
  approveAIQuestions,
  generateAllDifficultyLevels,
  startGenerationJob,
  getGenerationStatus,
  startApprovalJob
};
