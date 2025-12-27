const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Mock express request/response
const mockReq = {
  body: {
    topic: 'Computer Fundamentals',
    company_name: 'Google',
    role_position: 'Software Engineer',
    difficulty_level: 3,
    ai_provider: 'openai',
    questions_per_difficulty: 2,
    description: 'Focus on sorting algorithms and time complexity',
    count: 3
  }
};

const mockRes = {
  json: (data) => {
    console.log('Success! Received response:');
    console.log(JSON.stringify(data, null, 2));
    if (data.questions && data.questions.length > 0) {
      console.log(`Generated ${data.questions.length} questions.`);
      console.log('First question:', data.questions[0].question_text);
      console.log('Source:', data.questions[0].source);
    } else {
      console.error('No questions generated.');
    }
  },
  status: (code) => ({
    json: (error) => {
      console.error(`Error ${code}:`, error);
    }
  })
};

// Import the controller function
// We need to mock the pool query since we don't want to actually write to DB for this test, 
// or we can let it fail on DB insert but succeed on API call.
// Let's mock the pool to avoid DB errors.

const mockPool = {
  query: async (text, params) => {
    console.log('Mock DB Query:', text.substring(0, 50) + '...');
    return { rows: [] };
  }
};

// We need to hijack the require for the database config
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (request) {
  if (request.endsWith('config/database')) {
    return mockPool;
  }
  return originalRequire.apply(this, arguments);
};

// Now require the controller
const adminController = require('../controllers/adminController');

console.log('Testing generateAIQuestionsPreview with API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
if (process.env.OPENAI_API_KEY) {
  console.log('Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
}

// Run the function
adminController.generateAIQuestionsPreview(mockReq, mockRes)
  .then(() => console.log('Test completed.'))
  .catch(err => console.error('Test failed:', err));
