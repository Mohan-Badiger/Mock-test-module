# AI-Powered Skill Based Mock Tests Platform

A full-stack web application for conducting AI-powered skill-based mock tests with comprehensive analytics and admin management.

## Project Structure

```
Mock-test-module/
├── frontend/              # React frontend application
├── backend/               # Node.js Express backend API
├── mock-test-admin/       # Admin panel for managing tests
└── README.md
```

## Features

- **User Features:**
  - Browse tests by category (Tech/Management)
  - Select difficulty levels (Novice, Easy, Intermediate, Master, Expert)
  - AI-powered question generation
  - Real-time exam interface with timer
  - Performance analysis with strengths and areas for improvement
  - Test history tracking
  - Profile management

- **Admin Features:**
  - Create and manage tests
  - Add questions with multiple choice options
  - Set difficulty levels
  - View test statistics

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Vite

### Backend
- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL client)

### Database
- PostgreSQL with normalized schema

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation & Setup

### 1. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE mock_test_db;
```

2. Update database credentials in `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mock_test_db
DB_USER=postgres
DB_PASSWORD=your_password
```

3. Run migrations:
```bash
cd backend
npm install
npm run migrate
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Admin Panel Setup

```bash
cd mock-test-admin
npm install
npm run dev
```

Admin panel will run on `http://localhost:3001`

## Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mock_test_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Database Schema

The database is normalized with the following main tables:
- `users` - User accounts and profiles
- `categories` - Test categories (Tech, Management)
- `tests` - Mock test definitions
- `difficulty_levels` - Difficulty levels (Novice to Expert)
- `questions` - Test questions
- `answer_options` - Multiple choice options
- `test_attempts` - User test sessions
- `user_answers` - User answers to questions
- `test_results` - AI-generated performance analysis

## API Endpoints

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get test by ID
- `POST /api/tests` - Create new test (admin)
- `PUT /api/tests/:id` - Update test (admin)

### Questions
- `GET /api/questions/test/:testId` - Get questions for a test
- `GET /api/questions/test/:testId/difficulty/:difficultyId` - Get questions by difficulty
- `POST /api/questions` - Create question (admin)

### Results
- `POST /api/results/start` - Start a test attempt
- `POST /api/results/finish` - Finish a test attempt
- `GET /api/results/summary/:attemptId` - Get test summary
- `GET /api/results/history/:userId` - Get user test history

### Answers
- `POST /api/answers/submit` - Submit an answer
- `GET /api/answers/attempt/:attemptId` - Get answers for an attempt

## Usage

### For Users

1. Navigate to `http://localhost:3000`
2. Browse tests by category (Tech/Management)
3. Click on a test card to start
4. Select difficulty level
5. Wait for AI to generate questions
6. Type "start" to begin the test
7. Answer questions and submit
8. View results and performance analysis

### For Admins

1. Navigate to `http://localhost:3001`
2. Create new tests
3. Add questions with multiple choice options
4. Set correct answers
5. Manage test settings

## Adding Questions with AI (Grok Integration)

To integrate Grok AI for question generation:

1. Update `backend/controllers/adminController.js`
2. Add Grok AI API key to `.env`
3. Implement the `generateQuestionsWithAI` function

Example:
```javascript
const response = await fetch('https://api.grok.ai/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    test_id,
    difficulty_id,
    count
  })
});
```

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Admin Panel:
```bash
cd mock-test-admin
npm run dev
```

## Project Status

- ✅ Database schema and migrations
- ✅ Backend API endpoints
- ✅ Frontend pages and components
- ✅ Admin panel for test management
- ✅ User interface matching design mockups
- ⚠️ AI question generation (placeholder - needs Grok API integration)
- ⚠️ Authentication system (basic structure ready)

## 📚 Documentation

All project documentation is organized in the [`docs/`](./docs) folder:

- **[Documentation Index](./docs/INDEX.md)** - Complete documentation guide
- **[Quick Start Guide](./docs/QUICK_START.md)** ⚡ - Get running in 5 minutes
- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Latest Updates](./docs/UPDATES_TODAY.md)** - New features and changes
- **[Final Session Summary](./docs/FINAL_SESSION_SUMMARY.md)** 🎉 - Complete overview of all updates
- **[Shimmer Skeletons Guide](./docs/SHIMMER_SKELETONS_UPDATE.md)** - Loading states implementation
- **[Admin UI Update](./docs/ADMIN_UI_UPDATE.md)** - Admin panel consistency
- **[Navigator Update](./docs/NAVIGATOR_UPDATE.md)** - Question navigator improvements
- **[Troubleshooting](./docs/QUICK_FIX.md)** - Common issues and fixes
- **[Database Guide](./docs/FIX_DATABASE.md)** - Database setup and fixes
- **[Environment Setup](./docs/ENV_SETUP.md)** - Environment variables configuration

**👉 Start here:** [Quick Start Guide](./docs/QUICK_START.md) or [Documentation Index](./docs/INDEX.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

