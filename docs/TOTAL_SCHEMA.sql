-- TOTAL SCHEMA SQL FILE
-- Combined from migrations 001-007

-- ==========================================
-- 001_initial_schema.sql
-- ==========================================
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

-- ==========================================
-- 002_seed_data.sql
-- ==========================================
-- Seed initial data

-- Categories
INSERT INTO categories (name, description) VALUES
('Tech', 'Technology and programming related tests'),
('Management', 'Management and business related tests')
ON CONFLICT (name) DO NOTHING;

-- Difficulty levels
INSERT INTO difficulty_levels (name, level, description) VALUES
('Novice', 1, 'Beginner level questions'),
('Easy', 2, 'Easy level questions'),
('Intermediate', 3, 'Moderate difficulty questions'),
('Master', 4, 'Advanced level questions'),
('Expert', 5, 'Expert level questions')
ON CONFLICT (name) DO NOTHING;

-- Sample Tests
INSERT INTO tests (title, description, category_id, total_questions, total_marks, duration_minutes, tagline, image_url) VALUES
('Computer Fundamentals', 'Test your computer fundamentals knowledge', 1, 30, 30, 15, 'Put your tech skills to the test!', ''),
('CN (Computer Network)', 'Computer networking fundamentals', 1, 30, 30, 15, 'Test your fundamentals first!', ''),
('DSA (Data Structures & Algorithms)', 'Data structures and algorithms', 1, 30, 30, 15, 'Analyze & improve your coding knowledge!', ''),
('OOPS (Object Oriented Programming)', 'Object oriented programming concepts', 1, 30, 30, 15, 'Review your OOP prep with this mock test!', ''),
('Financial Accounting', 'Financial accounting fundamentals', 2, 30, 30, 15, 'Understand the world of finance!', ''),
('Brand Management', 'Brand management concepts', 2, 30, 30, 15, 'Pathway To A Powerful Presence!', ''),
('Supply Chain Management', 'Supply chain management basics', 2, 30, 30, 15, 'Unlock Operational Excellence!', ''),
('Micro-Economics', 'Micro-economics principles', 2, 30, 30, 15, 'Your Key To Business Insights!', '')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 003_ai_generated_questions.sql
-- ==========================================
-- Table to store AI-generated questions for preview/edit before approval
CREATE TABLE IF NOT EXISTS ai_generated_questions (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    source VARCHAR(50) DEFAULT 'ai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 004_add_test_visibility.sql
-- ==========================================
-- Add visibility and scheduling options to tests
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'scheduled')),
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS role_position VARCHAR(255);

-- Update existing tests to be public by default
UPDATE tests SET visibility = 'public' WHERE visibility IS NULL;

-- ==========================================
-- 005_create_admins.sql
-- ==========================================
-- Admins table for admin panel authentication
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ==========================================
-- 006_add_passing_marks_and_ai_provider.sql
-- ==========================================
-- Add passing_marks to tests table and ai_provider to AI generation tracking
-- Migration 006: Add passing_marks and AI provider support

-- Add passing_marks to tests table (default 50% of total marks)
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS passing_marks INTEGER,
ADD COLUMN IF NOT EXISTS questions_per_difficulty INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS role_position VARCHAR(255);

-- Update existing tests to set passing_marks as 50% of total_marks
UPDATE tests 
SET passing_marks = FLOOR(total_marks * 0.5)
WHERE passing_marks IS NULL;

-- Add ai_provider, difficulty_level, and company tracking columns to ai_generated_questions
ALTER TABLE ai_generated_questions 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50) DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Rename source to ai_provider if it exists (backward compatibility)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_generated_questions' AND column_name = 'source') THEN
    UPDATE ai_generated_questions SET ai_provider = source WHERE ai_provider IS NULL;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tests_passing_marks ON tests(passing_marks);
CREATE INDEX IF NOT EXISTS idx_ai_generated_questions_provider ON ai_generated_questions(ai_provider);
CREATE INDEX IF NOT EXISTS idx_ai_generated_questions_difficulty ON ai_generated_questions(difficulty_level);

-- Add comment to document the auto-duration calculation logic
COMMENT ON COLUMN tests.duration_minutes IS 'Duration in minutes. Auto-calculated as (total_questions * 2) for 2 min per question';
COMMENT ON COLUMN tests.passing_marks IS 'Passing marks threshold. Defaults to 50% of total_marks';
COMMENT ON COLUMN tests.questions_per_difficulty IS 'Number of questions to generate per difficulty level (5 levels total)';
COMMENT ON COLUMN ai_generated_questions.ai_provider IS 'AI provider used: openai, grok, gemini, claude';

-- ==========================================
-- 007_add_system_settings.sql
-- ==========================================
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (key, value) VALUES ('performance_analysis_enabled', 'true') ON CONFLICT (key) DO NOTHING;
