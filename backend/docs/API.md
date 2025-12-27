# API Documentation

Complete API reference for the Mock Test Backend.

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-api-domain.com/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

#### GET /api/health

Check server and database status.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2025-11-08T...",
  "environment": "production"
}
```

---

### Authentication

#### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

#### POST /api/auth/login

Login user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

---

### Tests

#### GET /api/tests

Get all public tests.

**Query Parameters:**
- `category` (optional) - Filter by category (e.g., "tech", "management")

**Response:**
```json
[
  {
    "id": 1,
    "title": "Computer Fundamentals",
    "description": "...",
    "category_name": "Tech",
    "total_questions": 30,
    "visibility": "public"
  }
]
```

#### GET /api/tests/:id

Get test by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Computer Fundamentals",
  "description": "...",
  "category_name": "Tech",
  "total_questions": 30
}
```

---

### Questions

#### GET /api/questions/test/:testId

Get all questions for a test.

**Response:**
```json
[
  {
    "id": 1,
    "question_text": "What is...",
    "difficulty_id": 1,
    "difficulty_name": "Easy",
    "options": [...]
  }
]
```

#### GET /api/questions/test/:testId/difficulty/:difficultyId

Get questions for a test by difficulty.

#### POST /api/questions

Create a new question. (Admin only)

**Request Body:**
```json
{
  "test_id": 1,
  "difficulty_id": 1,
  "question_text": "What is...",
  "marks": 1,
  "options": [
    { "option_text": "Option A", "is_correct": true, "option_order": 1 },
    { "option_text": "Option B", "is_correct": false, "option_order": 2 }
  ]
}
```

---

### Results

#### POST /api/results/start

Start a test attempt.

**Request Body:**
```json
{
  "user_id": 1,
  "test_id": 1,
  "difficulty_id": 1
}
```

**Response:**
```json
{
  "id": 123,
  "user_id": 1,
  "test_id": 1,
  "started_at": "2025-11-08T..."
}
```

#### POST /api/results/finish

Finish a test attempt.

**Request Body:**
```json
{
  "attempt_id": 123
}
```

**Response:**
```json
{
  "message": "Test completed",
  "score": 25,
  "total_marks": 30,
  "percentage": 83.33
}
```

#### GET /api/results/history/:userId

Get test history for a user.

**Response:**
```json
[
  {
    "attempt_id": 123,
    "test_title": "Computer Fundamentals",
    "score": 25,
    "total_marks": 30,
    "completed_at": "2025-11-08T..."
  }
]
```

---

### Admin Endpoints

#### GET /api/admin/tests

Get all tests including private ones. (Admin only)

#### GET /api/admin/categories

Get all categories.

#### GET /api/admin/difficulties

Get all difficulty levels.

#### POST /api/admin/ai/generate

Generate AI questions preview.

**Request Body:**
```json
{
  "topic": "Computer Fundamentals",
  "company_name": "Google",
  "role_position": "Software Engineer",
  "difficulty_level": 3
}
```

#### POST /api/admin/ai/approve

Approve and save AI-generated questions.

**Request Body:**
```json
{
  "topic": "Computer Fundamentals",
  "test_id": 1,
  "difficulty_id": 1,
  "questions": [...]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": "..."
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Route GET /api/invalid not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

### 503 Service Unavailable
```json
{
  "error": "Database connection refused",
  "message": "PostgreSQL server is not running or not accessible"
}
```

## Rate Limiting

Currently not implemented. Consider adding for production.

## CORS

CORS is configured based on `FRONTEND_URL` and `ADMIN_URL` environment variables.

