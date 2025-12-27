-- Database Schema for Mock Test Platform
-- Normalized structure

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500),
    full_name VARCHAR(255),
    ai_credits INTEGER DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (Tech, Management, etc.)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    total_questions INTEGER DEFAULT 30,
    total_marks INTEGER DEFAULT 30,
    duration_minutes INTEGER DEFAULT 15,
    image_url VARCHAR(500),
    tagline TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Difficulty levels table
CREATE TABLE IF NOT EXISTS difficulty_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    level INTEGER UNIQUE NOT NULL,
    description TEXT
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
    difficulty_id INTEGER REFERENCES difficulty_levels(id),
    question_text TEXT NOT NULL,
    marks INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answer options table
CREATE TABLE IF NOT EXISTS answer_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test attempts table (user's test sessions)
CREATE TABLE IF NOT EXISTS test_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
    difficulty_id INTEGER REFERENCES difficulty_levels(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_taken_seconds INTEGER,
    total_score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_skipped INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress' -- in_progress, completed, abandoned
);

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id INTEGER REFERENCES answer_options(id),
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    is_skipped BOOLEAN DEFAULT false,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test results table (AI-generated analysis)
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES test_attempts(id) ON DELETE CASCADE UNIQUE,
    strengths TEXT,
    areas_for_improvement TEXT,
    performance_analysis JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test history summary (for quick access)
CREATE VIEW test_history_summary AS
SELECT 
    ta.id as attempt_id,
    u.id as user_id,
    t.id as test_id,
    t.title as test_title,
    c.name as category_name,
    ta.completed_at,
    ta.total_score,
    ta.total_questions,
    ta.questions_attempted,
    ta.status
FROM test_attempts ta
JOIN users u ON ta.user_id = u.id
JOIN tests t ON ta.test_id = t.id
JOIN categories c ON t.category_id = c.id
ORDER BY ta.completed_at DESC;

-- Indexes for performance
CREATE INDEX idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_user_answers_attempt ON user_answers(attempt_id);
CREATE INDEX idx_questions_test ON questions(test_id);
CREATE INDEX idx_tests_category ON tests(category_id);

