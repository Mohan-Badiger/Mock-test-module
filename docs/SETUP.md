# Quick Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

Open three terminal windows/tabs:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

**Terminal 3 - Admin Panel:**
```bash
cd mock-test-admin
npm install
```

### 2. Database Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres-mocktest -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Create Database:**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE mock_test_db;

-- Exit psql
\q
```

3. **Configure Backend Environment:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mock_test_db
DB_USER=postgres
DB_PASSWORD=postgres  # Change to your PostgreSQL password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

4. **Run Migrations:**
```bash
cd backend
npm run migrate
```

This will:
- Create all database tables
- Insert categories (Tech, Management)
- Insert difficulty levels (Novice, Easy, Intermediate, Master, Expert)
- Insert sample tests

### 3. Start Services

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:3000

**Terminal 3 - Start Admin Panel:**
```bash
cd mock-test-admin
npm run dev
```
✅ Admin panel running on http://localhost:3001

### 4. Add Questions

1. Go to http://localhost:3001 (Admin Panel)
2. Click "Manage Tests"
3. Select a test and click "Questions"
4. Click "Add Question" to manually add questions
5. Or use the API endpoint `/api/admin/questions/generate` with Grok AI integration

### 5. Test the Application

1. Open http://localhost:3000 in your browser
2. Browse tests by category
3. Select a test and choose difficulty
4. Start a test (you'll need at least one question in the database)

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
- Check credentials in `backend/.env`
- Ensure database exists: `psql -U postgres -l | grep mock_test_db`

### Port Already in Use
- Change ports in `vite.config.js` (frontend) or `server.js` (backend)
- Or stop the process using the port

### Missing Data
- Re-run migrations: `cd backend && npm run migrate`
- Check if seed data was inserted: `psql -U postgres -d mock_test_db -c "SELECT * FROM categories;"`

### CORS Errors
- Ensure `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Check backend console for CORS errors

## Next Steps

1. **Add Sample Questions:**
   - Use the admin panel to add questions
   - Or create a script to bulk insert questions

2. **Integrate Grok AI:**
   - Get API key from Grok AI
   - Update `backend/controllers/adminController.js`
   - Add `GROK_API_KEY` to `backend/.env`

3. **Add Authentication:**
   - Implement user registration/login
   - Protect routes with JWT tokens
   - Update user context in frontend

4. **Customize Design:**
   - Update Tailwind config
   - Add custom images/logos
   - Modify color schemes

## Project Structure Overview

```
Mock-test-module/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/    # Route controllers
│   ├── migrations/      # Database migrations
│   ├── models/          # Data models (if needed)
│   ├── routes/          # API routes
│   ├── server.js        # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities (API, helpers)
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   └── package.json
│
└── mock-test-admin/
    ├── src/
    │   ├── components/  # Admin components
    │   ├── pages/       # Admin pages
    │   ├── utils/       # Admin utilities
    │   └── App.jsx
    └── package.json
```

## Development Tips

1. **Hot Reload:** All three apps support hot reload in development mode
2. **Database Changes:** Modify migrations and re-run them
3. **API Testing:** Use Postman or Thunder Client to test endpoints
4. **Debugging:** Check browser console and backend terminal for errors

## Production Deployment

1. Build frontend: `cd frontend && npm run build`
2. Build admin: `cd mock-test-admin && npm run build`
3. Set `NODE_ENV=production` in backend `.env`
4. Use a process manager like PM2 for the backend
5. Serve frontend/admin builds with Nginx or similar

