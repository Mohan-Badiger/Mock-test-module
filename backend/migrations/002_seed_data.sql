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

