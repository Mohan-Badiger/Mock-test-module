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


