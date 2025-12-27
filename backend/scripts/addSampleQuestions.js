const pool = require('../config/database');
require('dotenv').config();

const sampleQuestions = [
  {
    test_title: 'Computer Fundamentals',
    questions: [
      {
        question_text: 'A system administrator is tasked with optimizing the performance of a server. After analyzing the system, they observe high CPU utilization and frequent disk I/O operations. Which of the following strategies would MOST effectively address these issues, considering a holistic approach to system optimization?',
        difficulty: 'Intermediate',
        marks: 1,
        options: [
          { text: 'Increase the CPU clock speed and replace the existing hard drives with faster SSDs.', correct: false },
          { text: 'Implement a RAID configuration for the existing hard drives and upgrade the RAM.', correct: false },
          { text: 'Optimize database queries, implement caching mechanisms, and consider load balancing across multiple servers.', correct: true },
          { text: 'Defragment the hard drives and disable unnecessary services running on the server.', correct: false }
        ]
      },
      {
        question_text: 'In a virtualized environment, a hypervisor manages the allocation of system resources to multiple virtual machines (VMs). What is the primary advantage of using a Type 1 (bare-metal) hypervisor compared to a Type 2 (hosted) hypervisor in terms of resource management and performance?',
        difficulty: 'Intermediate',
        marks: 1,
        options: [
          { text: 'Type 1 hypervisors run on top of a host operating system, providing better hardware compatibility.', correct: false },
          { text: 'Type 1 hypervisors have superior performance and direct hardware access, with minimal overhead.', correct: true },
          { text: 'Type 2 hypervisors offer better resource isolation between virtual machines.', correct: false },
          { text: 'Type 2 hypervisors provide superior hardware abstraction and easier migration of VMs.', correct: false }
        ]
      },
      {
        question_text: 'What is the primary purpose of a firewall in network security?',
        difficulty: 'Easy',
        marks: 1,
        options: [
          { text: 'To encrypt data transmission between networks', correct: false },
          { text: 'To monitor and control incoming and outgoing network traffic based on predetermined security rules', correct: true },
          { text: 'To store user credentials securely', correct: false },
          { text: 'To manage IP address allocation', correct: false }
        ]
      }
    ]
  },
  {
    test_title: 'CN (Computer Network)',
    questions: [
      {
        question_text: 'What does DNS stand for and what is its primary function?',
        difficulty: 'Easy',
        marks: 1,
        options: [
          { text: 'Domain Name System - Translates domain names to IP addresses', correct: true },
          { text: 'Dynamic Network Service - Manages network connections', correct: false },
          { text: 'Data Network Security - Encrypts network data', correct: false },
          { text: 'Distributed Network Storage - Stores files across networks', correct: false }
        ]
      },
      {
        question_text: 'Which protocol is used for secure data transmission over the internet?',
        difficulty: 'Easy',
        marks: 1,
        options: [
          { text: 'HTTP', correct: false },
          { text: 'FTP', correct: false },
          { text: 'HTTPS', correct: true },
          { text: 'SMTP', correct: false }
        ]
      }
    ]
  }
];

async function addSampleQuestions() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get difficulty levels
    const difficulties = await client.query('SELECT * FROM difficulty_levels');
    const difficultyMap = {};
    difficulties.rows.forEach(d => {
      difficultyMap[d.name] = d.id;
    });
    
    // Get tests
    const tests = await client.query('SELECT * FROM tests');
    const testMap = {};
    tests.rows.forEach(t => {
      testMap[t.title] = t.id;
    });
    
    for (const testData of sampleQuestions) {
      const testId = testMap[testData.test_title];
      if (!testId) {
        console.log(`Test "${testData.test_title}" not found, skipping...`);
        continue;
      }
      
      for (const qData of testData.questions) {
        const difficultyId = difficultyMap[qData.difficulty];
        if (!difficultyId) {
          console.log(`Difficulty "${qData.difficulty}" not found, skipping...`);
          continue;
        }
        
        // Insert question
        const questionResult = await client.query(
          `INSERT INTO questions (test_id, difficulty_id, question_text, marks)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [testId, difficultyId, qData.question_text, qData.marks]
        );
        
        const questionId = questionResult.rows[0].id;
        
        // Insert options
        for (let i = 0; i < qData.options.length; i++) {
          const option = qData.options[i];
          await client.query(
            `INSERT INTO answer_options (question_id, option_text, is_correct, option_order)
             VALUES ($1, $2, $3, $4)`,
            [questionId, option.text, option.correct, i + 1]
          );
        }
        
        console.log(`Added question to ${testData.test_title}`);
      }

      // Ensure at least 20 questions for Computer Fundamentals as a full sample exam
      if (testData.test_title === 'Computer Fundamentals') {
        const existingCountRes = await client.query('SELECT COUNT(*)::int as cnt FROM questions WHERE test_id = $1', [testId]);
        let existingCount = existingCountRes.rows[0].cnt;
        const target = 20;
        const difficultiesInOrder = ['Novice', 'Easy', 'Intermediate', 'Master', 'Expert'].filter(d => difficultyMap[d]);
        let i = 0;
        while (existingCount < target) {
          const diffName = difficultiesInOrder[i % difficultiesInOrder.length];
          const diffId = difficultyMap[diffName];
          const qText = `Sample ${diffName} Q${existingCount + 1}: What does component ${existingCount + 1} relate to in Computer Fundamentals?`;
          const qRes = await client.query(
            `INSERT INTO questions (test_id, difficulty_id, question_text, marks)
             VALUES ($1, $2, $3, 1)
             RETURNING id`,
            [testId, diffId, qText]
          );
          const qid = qRes.rows[0].id;
          const opts = [
            { t: 'CPU', c: false },
            { t: 'Memory', c: true },
            { t: 'Storage', c: false },
            { t: 'Network', c: false }
          ];
          for (let oi = 0; oi < opts.length; oi++) {
            await client.query(
              `INSERT INTO answer_options (question_id, option_text, is_correct, option_order)
               VALUES ($1, $2, $3, $4)`,
              [qid, opts[oi].t, opts[oi].c, oi + 1]
            );
          }
          existingCount++;
          i++;
        }
        console.log(`Ensured ${target} questions for ${testData.test_title}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('Sample questions added successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding sample questions:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

addSampleQuestions();

