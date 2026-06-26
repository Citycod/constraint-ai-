# Edge AI System - Testing Guide

## Manual Testing

### Healthcare Triage Pilot

#### Test Case 1: Mild Symptoms
1. Navigate to `/healthcare`
2. Click "Start Assessment"
3. Select symptoms: Fever, Minor Ache
4. Set duration to "1-2 days"
5. **Expected Result**: Severity = "mild", Recommendation = "Monitor at home"

#### Test Case 2: Critical Symptoms
1. Navigate to `/healthcare`
2. Click "Start Assessment"
3. Select: Severe Shortness of Breath + Chest Pain
4. **Expected Result**: Severity = "critical", Recommendation = "Call 911"

#### Test Case 3: Offline Triage
1. Open DevTools (F12)
2. Go to Network tab, check "Offline"
3. Perform assessment
4. **Expected Result**: Triage completes, data saved to IndexedDB

### Education Quiz Pilot

#### Test Case 1: Basic Quiz Flow
1. Navigate to `/education`
2. Select "History" category
3. Answer 3 questions
4. **Expected Result**: Score updates, difficulty may adjust

#### Test Case 2: Adaptive Difficulty
1. Answer several questions quickly and correctly
2. **Expected Result**: Difficulty increases (questions get harder)
3. Answer incorrectly
4. **Expected Result**: Difficulty decreases

#### Test Case 3: Quiz Persistence
1. Start a quiz
2. Refresh the page (F5)
3. **Expected Result**: Quiz state is recovered from session

---

## Performance Testing

### Browser DevTools

#### Measure Web Vitals
1. Open DevTools → Lighthouse tab
2. Click "Generate report"
3. Check scores for:
   - **LCP (Largest Contentful Paint)**: Target < 2.5s
   - **FID (First Input Delay)**: Target < 100ms
   - **CLS (Cumulative Layout Shift)**: Target < 0.1

#### Measure Rules Engine Performance
1. Open DevTools → Console
2. Perform assessment/quiz
3. Check for `[v0]` debug logs showing:
   - Rule evaluation time (should be < 50ms)
   - Cache hit rate

### Load Testing with Docker

#### Start Constraint Profiles
```bash
cd docker
docker-compose up
```

#### Measure Response Times
```bash
# Test low-end device
curl -w "Response time: %{time_total}s\n" http://localhost:3001/api/health

# Test edge device
curl -w "Response time: %{time_total}s\n" http://localhost:3002/api/health

# Test Raspberry Pi
curl -w "Response time: %{time_total}s\n" http://localhost:3003/api/health
```

#### Load Test with Apache Bench
```bash
# Install Apache Bench (macOS)
brew install httpd

# 1000 concurrent requests to low-end profile
ab -n 1000 -c 10 http://localhost:3001/api/triage
```

#### Load Test with K6
```bash
# Install K6
brew install k6

# Run load test
k6 run scripts/load-test.js
```

---

## Automated Testing

### Unit Tests (To Be Implemented)

```bash
# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

### E2E Tests (To Be Implemented)

```bash
# Install Playwright
pnpm add -D @playwright/test

# Run tests
pnpm exec playwright test

# Run specific test
pnpm exec playwright test healthcare.spec.ts

# Debug mode
pnpm exec playwright test --debug
```

Example E2E test structure:
```typescript
import { test, expect } from '@playwright/test'

test('Healthcare triage flow', async ({ page }) => {
  await page.goto('/healthcare')
  await page.click('text=Start Assessment')
  await page.check('input[value="Fever"]')
  await page.click('button:has-text("Next")')
  const result = await page.textContent('.severity-result')
  expect(result).toContain('mild')
})
```

---

## Offline Testing

### Simulate Offline Mode

#### Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Navigate app - should still work

#### Service Worker Testing
1. Open DevTools → Application tab
2. Go to Service Workers section
3. Check that SW is "activated and running"
4. Go to Cache Storage
5. Verify cache entries exist for API calls

### Test Offline Sync Queue

1. Open DevTools → Application → IndexedDB
2. Expand `edge-ai-v1` database
3. Check `syncQueue` object store
4. Add offline, perform assessment
5. Verify queue entry created
6. Go back online
7. Verify queue is processed

---

## Accessibility Testing

### Screen Reader Testing

#### NVDA (Windows)
```bash
# Download: https://www.nvaccess.org/
# Test navigation with arrow keys
# Verify form labels are announced
```

#### VoiceOver (macOS/iOS)
```bash
# Enable: System Preferences → Accessibility → VoiceOver
# Test with Cmd+F5
```

### Keyboard Navigation
1. Open any page
2. Use Tab to navigate
3. Use Enter to activate buttons
4. Use Space for checkboxes
5. **Expected**: All interactive elements accessible

### Color Contrast
1. Open DevTools → Lighthouse
2. Run accessibility audit
3. Verify WCAG AA compliance (7:1 contrast ratio)

---

## Security Testing

### XSS (Cross-Site Scripting)
Test inputs with malicious scripts:
```javascript
// Try in symptom input
"><script>alert('XSS')</script>

// Expected: Should be escaped/sanitized
```

### CSRF Protection
1. Open DevTools → Network
2. Perform state-changing action (submit assessment)
3. Verify CSRF token in request headers

### Content Security Policy
1. Open DevTools → Network
2. Check response headers for CSP directives
3. Verify inline scripts are blocked

---

## Mobile Testing

### Responsive Design
```bash
# Test different viewports
pnpm dev
# Open DevTools → Toggle device toolbar
# Test: iPhone 12, iPad, Android phone
```

### Touch Interactions
1. Test on actual mobile device or Chrome DevTools mobile mode
2. Verify:
   - Buttons are large enough (44x44px minimum)
   - Forms are easy to fill with keyboard
   - Scrolling is smooth
   - No layout shifts

### PWA Installation
1. Open app in Chrome on mobile
2. Tap menu → "Install app"
3. App should install to home screen
4. Test offline functionality from home screen app

---

## Network Throttling

### Simulate Slow Networks
```bash
# Using Chrome DevTools
1. Open DevTools → Network
2. Click throttling dropdown (usually "No throttling")
3. Select:
   - "Slow 3G" for 2G-like experience
   - "Fast 3G" for typical mobile
   - "Offline" for offline testing
```

### Measure Performance on Slow Networks
1. Enable "Slow 3G" throttling
2. Load each page
3. Measure LCP:
   - Target < 4s on slow 3G
   - Target < 2.5s on 4G

---

## Benchmark Script

```bash
# Run benchmark against all profiles
npx ts-node scripts/benchmark.ts

# Output includes:
# - Average response time
# - 95th percentile
# - Memory usage
# - CPU utilization
```

---

## Debugging

### Enable Debug Logging

```typescript
// In any component
console.log('[v0] Message:', data)
```

Debug logs appear with `[v0]` prefix and can be:
- Viewed in browser console
- Collected in logs (production)
- Filtered for analysis

### Common Issues

#### Service Worker Not Updating
```javascript
// Clear all caches
caches.keys().then(names => 
  Promise.all(names.map(name => caches.delete(name)))
)
```

#### IndexedDB Not Persisting
1. Check if private browsing is enabled (disables IDB)
2. Check storage quota: 
```javascript
navigator.storage.estimate().then(estimate => 
  console.log(`Used: ${estimate.usage}, Quota: ${estimate.quota}`)
)
```

#### Rules Engine Timeout
- Check rule complexity
- Verify memoization is working
- Profile with DevTools Performance tab

---

## Performance Baselines

### Expected Metrics

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | TBD |
| FID | < 100ms | TBD |
| CLS | < 0.1 | TBD |
| Triage API | < 50ms | TBD |
| Quiz API | < 50ms | TBD |
| Bundle Size | < 150KB | TBD |
| TTI | < 3s | TBD |

Run benchmarks to populate current values.

---

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
      - run: pnpm exec playwright test
```

---

## Contact

For testing issues or questions, refer to:
- Next.js Testing: https://nextjs.org/docs/testing
- Playwright: https://playwright.dev
- WebPageTest: https://www.webpagetest.org
