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
