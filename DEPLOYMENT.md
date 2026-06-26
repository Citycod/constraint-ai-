# Edge AI System - Deployment Guide

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

---

## Production Deployment

### Option 1: Vercel (Recommended)

The simplest way to deploy Next.js applications.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Features**:
- Zero-config deployment
- Automatic SSL certificates
- Global CDN
- Environment variables management
- Deployment previews

### Option 2: Docker on Cloud Platforms

Build and deploy Docker containers to any platform.

#### Docker Build

```bash
# Build image
docker build -t edge-ai-system:latest .

# Run container
docker run -p 3000:3000 edge-ai-system:latest
```

#### Docker Compose (Multi-Constraint Testing)

```bash
cd docker
docker-compose up
```

This starts three instances simulating different device profiles:
- `edge-ai-low-end`: 0.5 CPU, 512MB RAM (low-end phone)
- `edge-ai-edge`: 1 CPU, 1GB RAM (edge device)
- `edge-ai-rpi`: 1.5 CPU, 2GB RAM (Raspberry Pi)

#### AWS ECS Deployment

```bash
# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker tag edge-ai-system:latest <account>.dkr.ecr.us-east-1.amazonaws.com/edge-ai-system:latest

docker push <account>.dkr.ecr.us-east-1.amazonaws.com/edge-ai-system:latest

# Deploy via ECS/Fargate (configure in AWS Console or with CDK)
```

#### Google Cloud Run

```bash
# Configure
gcloud config set project PROJECT_ID

# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/edge-ai-system

# Deploy
gcloud run deploy edge-ai-system \
  --image gcr.io/PROJECT_ID/edge-ai-system \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Select "Next.js" as the service type
3. Configure environment variables
4. Deploy

---

## Environment Variables

Create a `.env.local` file for local development:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

For production deployments, set these in your platform's environment configuration.

---

## Performance Optimization

### Build Optimization

The application includes:
- Automatic code splitting
- Image optimization
- Font loading optimization
- CSS minification
- JavaScript minification

### Runtime Performance

Monitor performance with Web Vitals:

```bash
# Build production version
pnpm build

# Analyze bundle size
ANALYZE=true pnpm build
```

### Caching Strategy

The application implements:
- Service Worker caching (offline support)
- IndexedDB for local data persistence
- Browser cache headers (configured in next.config.mjs)

---

## Monitoring & Observability

### Health Check

```bash
curl https://your-domain.com/api/health
```

### Metrics

The application exposes performance metrics at `/api/health`:
- Memory usage
- Response times
- Cache status
- Constraint profile

### Logging

Logs are output to stdout/stderr for container platforms:

```bash
# View logs (Docker)
docker logs edge-ai-system

# View logs (ECS/Fargate)
aws logs tail /ecs/edge-ai-system --follow

# View logs (Cloud Run)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=edge-ai-system"
```

---

## Database Integration (Phase 2)

When adding database persistence:

### PostgreSQL (Recommended)

```bash
# Install Prisma
pnpm add @prisma/client
pnpm add -D prisma

# Initialize
npx prisma init

# Configure DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@host:5432/database"

# Deploy migrations
npx prisma migrate deploy
```

### MongoDB

```bash
pnpm add mongodb mongoose

# Set MONGODB_URI environment variable
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/database"
```

---

## Backup & Data Safety

### IndexedDB Data

User data stored locally in IndexedDB is automatically backed up when syncing with server (Phase 2+).

### Service Worker Cache

Clear caches manually if needed:

```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

---

## Scaling Considerations

### Horizontal Scaling

The application is stateless and scales horizontally:
- Deploy multiple instances behind a load balancer
- Use session storage for user state (Phase 2)
- Cache responses at edge CDN layer

### Constraint-Aware Execution

For running on edge devices, use Docker profiles:

```bash
# Start all profiles
docker-compose up

# Monitor individual profiles
docker stats edge-ai-low-end
```

---

## Security

### HTTPS

All production deployments must use HTTPS.

**Vercel**: Automatic SSL
**Docker**: Use nginx reverse proxy with Let's Encrypt
**Cloud Platforms**: Native HTTPS support

### Headers

Security headers configured in `next.config.mjs`:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### CORS

Configure CORS in API routes for cross-origin requests (if needed).

---

## Troubleshooting

### Service Worker Not Updating

Clear site data:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister())
  })
```

### Offline Features Not Working

1. Check browser console for SW errors
2. Verify manifest.json is accessible
3. Ensure app is served over HTTPS (required for SW)
4. Check IndexedDB support (not available in private browsing)

### Performance Issues

1. Check `/api/health` metrics
2. Analyze bundle size: `ANALYZE=true pnpm build`
3. Profile with Chrome DevTools
4. Test with constraint profiles: `docker-compose up`

---

## Rollback

### Vercel
```bash
vercel --prod --target <deployment-url>
```

### Docker
```bash
docker ps -a  # Find previous image
docker run -p 3000:3000 <previous-image-id>
```

---

## Contact & Support

For deployment issues, check:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com)
