# Mock Test Backend API

Backend API for AI-Powered Skill Based Mock Tests with PostgreSQL database support.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory. See [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) for details.

### 3. Run Database Migrations

```bash
npm run migrate
```

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed-questions` - Add sample questions
- `npm run test-connection` - Test database connection
- `npm run test-remote` - Test remote/Neon database connection
- `npm run check-env` - Check environment configuration

## Documentation

All documentation is available in the `docs/` folder:

- **[Documentation Index](./docs/README.md)** - Complete documentation index
- **[Environment Setup](./docs/ENVIRONMENT.md)** - Environment variables configuration
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Render Deployment](./docs/RENDER_DEPLOYMENT.md)** - Render.com specific deployment guide
- **[API Documentation](./docs/API.md)** - API endpoints reference
- **[Render Fix Guide](./docs/RENDER_FIX.md)** - Quick fixes for Render deployment issues
- **[Vercel CORS Fix](./docs/VERCEL_CORS_FIX.md)** - Fix CORS errors with Vercel frontend

## API Endpoints

### Health Check
- `GET /api/health` - Server and database status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tests
- `GET /api/tests` - Get all public tests
- `GET /api/tests/:id` - Get test by ID

### Questions
- `GET /api/questions/test/:testId` - Get questions for a test
- `POST /api/questions` - Create question

### Results
- `POST /api/results/start` - Start test attempt
- `POST /api/results/finish` - Finish test attempt
- `GET /api/results/history/:userId` - Get test history

### Admin
- `GET /api/admin/tests` - Get all tests (including private)
- `POST /api/admin/ai/generate` - Generate AI questions
- `POST /api/admin/ai/approve` - Approve AI questions

## Database Support

- **Neon PostgreSQL** (Cloud) - Recommended for production
- **Local PostgreSQL** - For development

The app automatically detects which database to use based on environment variables.

## Health Check

Monitor your deployment with:

```bash
curl https://your-api-domain.com/api/health
```

## License

ISC
