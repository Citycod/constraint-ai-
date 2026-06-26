# Edge AI System - Project Structure

## Overview

This document describes the complete directory structure and organization of the Edge AI System project.

```
edge-ai-system/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx                # Root layout with PWA setup
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   ├── api/                      # API routes
│   │   ├── triage/
│   │   │   └── route.ts          # Healthcare triage endpoint
│   │   ├── quiz/
│   │   │   └── route.ts          # Education quiz endpoint
│   │   └── health/
│   │       └── route.ts          # Health check endpoint
│   ├── healthcare/               # Healthcare pilot routes
│   │   ├── page.tsx              # Healthcare landing page
│   │   └── [sessionId]/
│   │       └── page.tsx          # Individual triage session
│   └── education/                # Education pilot routes
│       ├── page.tsx              # Education landing page
│       └── [quizId]/
│           └── page.tsx          # Individual quiz session
├── components/                   # React components
│   ├── shared/                   # Shared components
│   │   ├── OfflineIndicator.tsx  # Offline status indicator
│   │   └── PWAInitializer.tsx    # PWA setup and SW registration
│   ├── triage/                   # Healthcare triage components
│   │   ├── TriageFlow.tsx        # Main triage flow controller
│   │   ├── SymptomSelector.tsx   # Symptom selection UI
│   │   └── SeverityDisplay.tsx   # Results display
│   ├── quiz/                     # Education quiz components
│   │   ├── QuizFlow.tsx          # Main quiz controller
│   │   └── QuestionRenderer.tsx  # Question display
│   └── ui/                       # shadcn/ui components
│       └── button.tsx            # Button component
├── lib/                          # Library code and utilities
│   ├── rules-engine/             # Core rules engine
│   │   ├── types.ts              # Type definitions
│   │   ├── engine.ts             # Rule evaluator
│   │   ├── healthcare-rules.ts   # Healthcare triage rules
│   │   ├── education-rules.ts    # Education quiz rules
│   │   └── index.ts              # Exports
│   ├── offline-sync/             # Offline functionality
│   │   ├── storage.ts            # IndexedDB wrapper
│   │   ├── sync-queue.ts         # Offline sync queue
│   │   └── index.ts              # Exports
│   ├── metrics/                  # Performance monitoring
│   │   ├── performance.ts        # Web Vitals tracking
│   │   ├── profiling.ts          # Profiling utilities
│   │   └── index.ts              # Exports
│   ├── quiz-data/                # Quiz questions and data
│   │   └── index.ts              # Question bank
│   └── utils.ts                  # Shared utilities
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   ├── offline.html              # Offline fallback page
│   ├── icon.svg                  # App icon
│   ├── icon-dark-32x32.png       # Dark theme icon
│   └── icon-light-32x32.png      # Light theme icon
├── scripts/                      # Development and deployment scripts
│   └── benchmark.ts              # Performance benchmarking
├── docker/                       # Docker configuration
│   ├── Dockerfile                # Multi-stage Docker build
│   └── docker-compose.yml        # Compose with constraint profiles
├── .github/                      # GitHub configuration
│   └── workflows/                # CI/CD workflows (future)
├── README.md                     # Main documentation
├── API.md                        # API documentation
├── DEPLOYMENT.md                 # Deployment guide
├── TESTING.md                    # Testing guide
├── PROJECT_STRUCTURE.md          # This file
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies
├── pnpm-lock.yaml                # Dependency lock file
└── .env.example                  # Example environment variables
```

---

## Core Modules

### Rules Engine (`lib/rules-engine/`)

Implements the decision tree evaluator for both healthcare and education pilots.

**Key Files**:
- `engine.ts`: Core evaluation logic with memoization
- `healthcare-rules.ts`: 16 symptoms mapped to severity levels
- `education-rules.ts`: Adaptive difficulty algorithm

**Key Features**:
- Sub-50ms evaluation time
- Memoized results for repeated queries
- Evidence-based decision paths
- Confidence scores

### Offline Sync (`lib/offline-sync/`)

Handles offline functionality and background sync.

**Key Files**:
- `storage.ts`: IndexedDB abstraction with 4 object stores
- `sync-queue.ts`: Queue for offline operations

**Object Stores**:
1. `triageSessions`: Completed healthcare assessments
2. `quizSessions`: Completed quiz attempts
3. `syncQueue`: Pending operations for sync
4. `metadata`: Cache metadata and timestamps

### Performance Metrics (`lib/metrics/`)

Tracks and reports performance data.

**Key Files**:
- `performance.ts`: Web Vitals tracking
- `profiling.ts`: Custom profiling utilities

**Metrics Collected**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- Custom rule evaluation time
- API response times

---

## Component Architecture

### Healthcare Triage (`components/triage/`)

Three-step assessment flow:
1. **SymptomSelector**: Multi-category symptom selection (16 symptoms)
2. **DetailCollection**: Additional context (duration, severity)
3. **SeverityDisplay**: Results with recommendations

### Education Quiz (`components/quiz/`)

Adaptive question flow:
1. **QuestionRenderer**: Display question with options
2. **ProgressTracker**: Show score and progress
3. **DifficultyAdjuster**: Adapt based on performance

---

## API Routes

### POST `/api/triage`
```
Request: { symptoms: string[], duration: string, severity: string }
Response: { sessionId, severity, recommendation, details, evaluationTime }
```

### POST `/api/quiz`
```
Request: { quizId, questionId, selectedAnswer, responseTime }
Response: { correct, explanation, score, nextQuestion, difficulty }
```

### GET `/api/health`
```
Response: { status, version, metrics, constraints }
```

---

## Data Flow

### Healthcare Pilot Flow
```
User Input (Symptoms)
    ↓
TriageFlow Component
    ↓
API Call: POST /api/triage
    ↓
Rules Engine: Evaluate (memoized)
    ↓
Response: Severity + Recommendation
    ↓
SeverityDisplay Component
    ↓
IndexedDB: Store session
    ↓
Sync Queue: Queue for server (if online)
```

### Education Pilot Flow
```
User Input (Category)
    ↓
Quiz Component: Load questions
    ↓
QuestionRenderer: Display Q1
    ↓
User Answer
    ↓
API Call: POST /api/quiz
    ↓
Rules Engine: Score + Adapt difficulty
    ↓
QuestionRenderer: Display Q2 (adjusted)
    ↓
IndexedDB: Track progress
    ↓
Completion: Show results
```

---

## Service Worker Cache Strategy

### Cache-First (API Responses)
```
Request → Check Cache → Found? Return cached
              ↓
         Network call → Cache → Return
              ↓
         Offline? → Return error response
```

### Network-First (Pages)
```
Request → Network call → Success? Cache → Return
              ↓
         Failed/Offline → Check Cache → Found? Return
                              ↓
                         Return offline page
```

### Cache Stores
- `edge-ai-v1`: Static assets (images, fonts, CSS)
- `edge-ai-runtime-v1`: Pages and navigation
- `edge-ai-api-v1`: API responses

---

## State Management

### Client State
- React hooks for component-level state
- IndexedDB for persistent user data
- Service Worker for offline state

### Session Data
- Quiz: Session ID + responses in URL params
- Triage: Session ID in localStorage
- Results: IndexedDB for history

### Sync State
- Sync queue in IndexedDB
- Exponential backoff retry (max 5 attempts)
- Manual sync trigger via health check

---

## Environment Configuration

### Development (`.env.local`)
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Docker Profiles
- Low-end: 0.5 CPU, 512MB RAM
- Edge: 1 CPU, 1GB RAM
- Raspberry Pi: 1.5 CPU, 2GB RAM

---

## Build Output

### Production Build (`pnpm build`)
```
.next/
├── static/
│   ├── chunks/       # JavaScript chunks
│   ├── css/          # Optimized CSS
│   └── media/        # Images and fonts
├── server/           # Server-side code
├── standalone/       # Standalone deployment
└── app-build-manifest.json
```

### Docker Image
- Multi-stage build (reduce size)
- Production Node.js
- ~150MB compressed image

---

## Testing Structure

```
tests/
├── unit/             # Unit tests (future)
│   ├── rules-engine.test.ts
│   └── utils.test.ts
├── e2e/              # E2E tests (future)
│   ├── healthcare.spec.ts
│   └── education.spec.ts
└── integration/      # Integration tests (future)
```

---

## Performance Optimization

### Code Splitting
- Next.js automatic chunk splitting
- Dynamic imports for large components

### Image Optimization
- Next.js `<Image>` component
- Automatic WebP conversion
- Responsive sizing

### Font Optimization
- Google Fonts with `next/font`
- Font preloading
- Variable fonts for reduced requests

### CSS Optimization
- Tailwind CSS JIT compilation
- Automatic minification
- Unused style elimination

---

## Type Safety

### TypeScript Configuration
- Strict mode enabled
- All files `.ts` or `.tsx`
- No implicit `any` types

### Key Types
```typescript
// lib/rules-engine/types.ts
- Rule
- RuleContext
- RuleResult
- TriageContext
- TriageResult
- QuizContext
- QuizResult
```

---

## Accessibility

### WCAG 2.1 AA Compliance
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Color contrast ratios
- Screen reader testing

### Key Accessible Components
- Form inputs with labels
- Buttons with visible focus states
- Skip links
- Alternative text for icons

---

## Security

### Content Security Policy
- Inline scripts blocked
- Font sources whitelisted
- Trusted origins only

### Input Validation
- Server-side validation on API routes
- HTML entity escaping
- XSS prevention

### HTTPS
- Required for PWA features
- Service Worker requires HTTPS
- Secure cookie flags

---

## Deployment Targets

### Supported Platforms
1. **Vercel** (Recommended): Zero-config
2. **Docker**: Any platform (AWS, GCP, Azure, DigitalOcean)
3. **Self-hosted**: Node.js server with reverse proxy

### Database Integration (Phase 2)
- PostgreSQL (Prisma or raw SQL)
- MongoDB (Mongoose or native driver)
- Firestore
- Supabase

---

## Monitoring & Observability

### Metrics Collection
- `/api/health`: System health and performance
- Web Vitals: Client-side performance
- Error tracking: Exception logging

### Logging
- Server logs to stdout (Docker-friendly)
- Client errors to console (development)
- Production error tracking (to implement)

---

## Future Enhancements (Phase 2+)

### Phase 2: ML Integration
- TensorFlow Lite models
- On-device inference
- Model update mechanism

### Phase 3: Advanced Features
- Real-time collaboration
- User accounts and history
- Adaptive learning profiles
- Export results (PDF)

### Phase 4: Deployment & Scale
- Database integration
- Authentication system
- Analytics dashboard
- Admin panel

---

## Development Workflow

### Local Development
```bash
pnpm dev              # Start dev server
pnpm lint             # Check code quality
pnpm type-check       # TypeScript validation
```

### Testing
```bash
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Coverage report
```

### Building
```bash
pnpm build            # Production build
pnpm start            # Run production server
docker build .        # Build Docker image
```

---

## References

- [Next.js 16 Docs](https://nextjs.org)
- [React 19 Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Vitals](https://web.dev/vitals)
