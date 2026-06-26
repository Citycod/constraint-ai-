# Edge AI System - API Documentation

## Overview

This document describes the API endpoints for the Edge AI System's two pilots: Healthcare Triage and Education Quiz.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

---

## Healthcare Triage API

### Evaluate Triage

Evaluates symptoms and returns a severity assessment with recommendations.

**Endpoint**: `POST /api/triage`

**Request Body**:
```json
{
  "symptoms": ["Fever", "Cough"],
  "duration": "3",
  "severity": "moderate"
}
```

**Parameters**:
- `symptoms` (array of strings, required): List of symptoms selected by the user
- `duration` (string, optional): Days of symptom duration ("1" to "7+")
- `severity` (string, optional): User's self-reported severity ("mild" | "moderate" | "severe")

**Response** (200 OK):
```json
{
  "sessionId": "triage-1234567890-abc123def",
  "severity": "moderate",
  "recommendation": "visit_urgent_care",
  "details": {
    "primaryConcern": "Respiratory Infection",
    "reasoning": "Fever with cough indicates possible viral or bacterial respiratory infection",
    "followUp": "Seek urgent care if symptoms persist beyond 48 hours"
  },
  "evaluationTime": 32,
  "timestamp": "2024-06-24T10:30:00Z"
}
```

**Severity Levels**:
- `critical` - Seek emergency care immediately (911)
- `serious` - Visit urgent care or emergency room
- `moderate` - Consider visiting primary care physician
- `mild` - Monitor at home, typical cold/flu care

**HTTP Status Codes**:
- `200` - Successful evaluation
- `400` - Invalid symptoms or missing required parameters
- `503` - Service unavailable (offline fallback)

---

## Education Quiz API

### Get Quiz

Fetches a quiz with initial question based on category and difficulty.

**Endpoint**: `GET /api/quiz?category=<category>&difficulty=<level>`

**Query Parameters**:
- `category` (string, required): Quiz category ("history" | "literature" | "math" | "science")
- `difficulty` (string, optional): Starting difficulty ("easy" | "medium" | "hard") - defaults to "medium"

**Response** (200 OK):
```json
{
  "quizId": "quiz-1234567890-xyz789",
  "category": "history",
  "currentDifficulty": "medium",
  "score": 0,
  "correctAnswers": 0,
  "questionNumber": 1,
  "totalQuestions": 10,
  "question": {
    "id": "hist-001",
    "text": "In which year did the American Revolution begin?",
    "options": [
      { "id": "a", "text": "1775" },
      { "id": "b", "text": "1776" },
      { "id": "c", "text": "1783" },
      { "id": "d", "text": "1789" }
    ],
    "difficulty": "easy"
  }
}
```

### Submit Answer

Submits an answer and gets the next question with adaptive difficulty adjustment.

**Endpoint**: `POST /api/quiz`

**Request Body**:
```json
{
  "quizId": "quiz-1234567890-xyz789",
  "questionId": "hist-001",
  "selectedAnswer": "b",
  "responseTime": 4500
}
```

**Parameters**:
- `quizId` (string, required): Quiz session ID
- `questionId` (string, required): Current question ID
- `selectedAnswer` (string, required): Selected option ID (a, b, c, or d)
- `responseTime` (number, optional): Time spent on question in milliseconds

**Response** (200 OK):
```json
{
  "quizId": "quiz-1234567890-xyz789",
  "correct": true,
  "explanation": "Correct! The American Revolution officially began in 1775 with the Battles of Lexington and Concord.",
  "score": 10,
  "correctAnswers": 1,
  "difficulty": "medium",
  "nextQuestion": {
    "id": "hist-002",
    "text": "Who was the first President of the United States?",
    "options": [...],
    "difficulty": "medium"
  },
  "sessionProgress": {
    "questionNumber": 2,
    "totalQuestions": 10,
    "percentComplete": 10
  }
}
```

**Adaptive Difficulty Logic**:
- **Correct answer with fast response** (< 5s): Difficulty increases
- **Correct answer with normal response** (5-15s): Difficulty stays same
- **Correct answer with slow response** (> 15s): Difficulty decreases
- **Incorrect answer**: Difficulty decreases
- **Consecutive correct**: Difficulty increases progressively

**HTTP Status Codes**:
- `200` - Answer processed successfully
- `400` - Invalid quiz ID or answer format
- `404` - Quiz session not found
- `503` - Service unavailable

---

## Health Check API

### System Health

Returns system health status and performance metrics.

**Endpoint**: `GET /api/health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-06-24T10:30:00Z",
  "uptime": 3600,
  "metrics": {
    "memoryUsage": {
      "heapUsed": 45,
      "heapTotal": 128,
      "external": 12,
      "unit": "MB"
    },
    "responseTime": {
      "triage": 32,
      "quiz": 28,
      "unit": "ms"
    },
    "cacheStatus": {
      "enabled": true,
      "entries": 156
    }
  },
  "constraints": {
    "profile": "development",
    "cpus": 4,
    "memory": 16000
  }
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Invalid request",
  "details": "Missing required parameter: symptoms",
  "timestamp": "2024-06-24T10:30:00Z",
  "requestId": "req-abc123"
}
```

---

## Offline Behavior

When the service is offline:

1. **Cached Responses**: Previously evaluated requests are returned from IndexedDB
2. **Sync Queue**: New requests are queued for sync when connectivity returns
3. **Graceful Degradation**: Latest known state is used for UI display
4. **Error Responses**: 503 Service Unavailable with offline indicator

---

## Rate Limiting

- Development: Unlimited
- Production: 1000 requests per minute per IP (to be configured)

---

## CORS

- Development: All origins allowed
- Production: Whitelist configured in deployment

---

## Examples

### Healthcare Triage Example

```bash
curl -X POST http://localhost:3000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["Fever", "Severe Cough"],
    "duration": "2",
    "severity": "moderate"
  }'
```

### Education Quiz Example

```bash
# Get quiz
curl "http://localhost:3000/api/quiz?category=science&difficulty=medium"

# Submit answer
curl -X POST http://localhost:3000/api/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "quiz-123",
    "questionId": "sci-001",
    "selectedAnswer": "c",
    "responseTime": 6000
  }'
```

---

## WebSocket (Future)

Real-time sync and collaborative features planned for Phase 2.
