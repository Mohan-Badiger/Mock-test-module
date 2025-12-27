# Project Documentation

## Project Overview
**AI-Powered Skill Based Mock Tests Module**

- **Common User App**: [https://ai-powered-skill-based-mock-tests-m.vercel.app](https://ai-powered-skill-based-mock-tests-m.vercel.app)
- **Admin Dashboard**: [https://ai-powered-skill-based-mock-tests-m-iota.vercel.app](https://ai-powered-skill-based-mock-tests-m-iota.vercel.app)
- **GitHub Repository**: [https://github.com/Peterase-1/AI-Powered-Skill-Based-Mock-Tests-Module](https://github.com/Peterase-1/AI-Powered-Skill-Based-Mock-Tests-Module)

---

## Tech Stack

### Frontend (Common User & Admin)
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State/Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: pg (node-postgres)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Utilities**: dotenv, cors

### Database
- **Database**: PostgreSQL (Neon DB)
- **ORM/Migrations**: Custom SQL migration scripts

### External Services
- **Database Hosting**: Neon (Serverless Postgres)
- **Image Storage**: Cloudinary (for profile pictures/test images)
- **AI Providers**: OpenAI, Grok, Gemini, Claude (for question generation and analysis)

---

## Folder Structure

```
Mock-test-module/
├── backend/                  # Node.js Express Backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth and error handling
│   ├── migrations/          # SQL schema migration scripts
│   ├── models/              # Database models (if using ORM)
│   ├── routes/              # API route definitions
│   ├── scripts/             # Utility scripts (seeding, testing)
│   └── server.js            # Entry point
├── frontend/                 # User-facing React App
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (Auth)
│   │   ├── pages/           # Page components
│   │   └── utils/           # API helpers
│   └── ...
└── mock-test-admin/          # Admin React App
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
    └── ...
```

---

## Database Schema

### Tables

1.  **`users`**
    *   `id`: PK, Serial
    *   `username`, `email`, `password_hash`
    *   `profile_picture`, `full_name`
    *   `ai_credits` (Default: 7)

2.  **`categories`**
    *   `id`: PK, Serial
    *   `name` (Tech, Management, etc.)
    *   `description`

3.  **`tests`**
    *   `id`: PK, Serial
    *   `title`, `description`, `tagline`, `image_url`
    *   `category_id`: FK -> categories
    *   `total_questions`, `total_marks`, `duration_minutes`
    *   `passing_marks`, `questions_per_difficulty`
    *   `company_name`, `role_position`
    *   `is_active`

4.  **`difficulty_levels`**
    *   `id`: PK, Serial
    *   `name`, `level`, `description`

5.  **`questions`**
    *   `id`: PK, Serial
    *   `test_id`: FK -> tests
    *   `difficulty_id`: FK -> difficulty_levels
    *   `question_text`, `marks`

6.  **`answer_options`**
    *   `id`: PK, Serial
    *   `question_id`: FK -> questions
    *   `option_text`, `is_correct`, `option_order`

7.  **`test_attempts`**
    *   `id`: PK, Serial
    *   `user_id`: FK -> users
    *   `test_id`: FK -> tests
    *   `started_at`, `completed_at`
    *   `total_score`, `status` (in_progress, completed)

8.  **`user_answers`**
    *   `id`: PK, Serial
    *   `attempt_id`: FK -> test_attempts
    *   `question_id`: FK -> questions
    *   `selected_option_id`: FK -> answer_options
    *   `is_correct`, `time_spent_seconds`

9.  **`test_results`**
    *   `id`: PK, Serial
    *   `attempt_id`: FK -> test_attempts
    *   `strengths`, `areas_for_improvement`, `performance_analysis` (JSONB)

10. **`ai_generated_questions`**
    *   Tracks AI generation jobs and providers.

---

## Functional Requirements

### Common User Module
1.  **Authentication**:
    *   Register and Login with Email/Password.
    *   Manage Profile (Update details, Profile Picture).
2.  **Dashboard (Home)**:
    *   View featured tests.
    *   Filter tests by Category (Tech, Management).
    *   View Recent Test History.
3.  **Test Taking**:
    *   View "View All" tests with pagination.
    *   Start a test (Full-screen mode recommended).
    *   Answer questions with a timer.
    *   Submit test or auto-submit on timeout.
4.  **Results & Analysis**:
    *   View immediate score and accuracy.
    *   View detailed AI-powered performance analysis (Strengths/Weaknesses).
    *   View detailed question summary (Correct/Incorrect answers).

### Admin Module
1.  **Authentication**:
    *   Secure Admin Login.
2.  **Test Management**:
    *   Create, Update, Delete Tests.
    *   Set test properties (Title, Duration, Passing Marks, Company/Role tags).
3.  **Question Management**:
    *   Manually add questions to tests.
    *   **AI Generation**: Generate questions automatically using AI providers (OpenAI, etc.) based on difficulty and topic.
    *   Review and Approve AI-generated questions.
4.  **Analytics**:
    *   View system-wide statistics (Total Users, Tests, Attempts).
5.  **Settings**:
    *   Manage system configurations (e.g., AI Provider selection).

---

## API Endpoints

### Authentication (`/api/auth`)
*   `POST /register`: Register a new user.
*   `POST /login`: Login user.
*   `POST /logout`: Logout user.

### Users (`/api/users`)
*   `GET /:id`: Get user details.
*   `GET /:id/profile`: Get user profile.
*   `PUT /:id/profile`: Update user profile.

### Tests (`/api/tests`)
*   `GET /`: Get all active tests.
*   `GET /:id`: Get specific test details.
*   `GET /category/:categoryId`: Get tests by category.
*   `GET /difficulties`: Get available difficulty levels.
*   `POST /`: Create a new test (Admin).
*   `PUT /:id`: Update a test (Admin).
*   `DELETE /:id`: Delete a test (Admin).

### Questions (`/api/questions`)
*   `GET /test/:testId`: Get questions for a test.
*   `POST /`: Create a question (Admin).
*   `PUT /:id`: Update a question (Admin).
*   `DELETE /:id`: Delete a question (Admin).

### Results (`/api/results`)
*   `POST /start`: Start a test attempt.
*   `POST /finish`: Submit a test attempt.
*   `GET /attempt/:id`: Get attempt details.
*   `GET /history/:userId`: Get user's test history.
*   `POST /analysis`: Generate AI performance analysis.

### Admin (`/api/admin`)
*   `POST /ai/generate-job`: Start AI question generation job.
*   `GET /ai/status/:jobId`: Check generation status.
*   `POST /ai/approve`: Approve generated questions.
*   `GET /tests`: Get all tests (including inactive).

### Settings (`/api/settings`)
*   `GET /`: Get system settings.
*   `PUT /`: Update system settings.

---

## Testing

To run tests (if implemented):
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```
*Note: Specific test scripts like `test-connection` are available in `backend/scripts`.*

## Implementation Phase

*   **Phase 1**: Core Backend & Database Setup (Completed)
*   **Phase 2**: Frontend User Interface & Auth (Completed)
*   **Phase 3**: Test Taking Engine & Results (Completed)
*   **Phase 4**: Admin Dashboard & AI Integration (Completed)
*   **Phase 5**: Advanced Analytics & Optimization (Current)
