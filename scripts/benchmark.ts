#!/usr/bin/env node

/**
 * Benchmark Script
 * Tests the application under different constraint profiles
 * Run with: npx ts-node scripts/benchmark.ts
 */

interface BenchmarkProfile {
  name: string
  port: number
  cpus: number
  memory: number
}

interface BenchmarkResult {
  profile: string
  endpoint: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
}

const PROFILES: BenchmarkProfile[] = [
  { name: 'Low-End Phone', port: 3001, cpus: 0.5, memory: 512 },
  { name: 'Edge Device', port: 3002, cpus: 1, memory: 1024 },
  { name: 'Raspberry Pi', port: 3003, cpus: 1.5, memory: 2048 },
]

const ENDPOINTS = [
  { path: '/api/health', method: 'GET' },
  {
    path: '/api/triage',
    method: 'POST',
    body: {
      symptoms: ['fever', 'cough'],
      age: 30,
      duration: 24,
    },
  },
  {
    path: '/api/quiz',
    method: 'POST',
    body: {
      quizId: 'test-quiz',
      questionId: 'sci-easy-1',
      answer: 'Cell',
      recentCorrectCount: 1,
      recentTotalCount: 2,
      currentDifficulty: 'easy',
      answeredQuestionIds: [],
    },
  },
]

const TEST_DURATION = 10000 // 10 seconds per endpoint
const CONCURRENT_REQUESTS = 5

async function runBenchmark() {
  console.log('Starting Edge AI System Benchmark')
  console.log('=' .repeat(80))

  for (const profile of PROFILES) {
    console.log(`\nTesting ${profile.name} (${profile.cpus}CPU, ${profile.memory}MB RAM)`)
    console.log('-' .repeat(80))

    for (const endpoint of ENDPOINTS) {
      const result = await benchmarkEndpoint(profile, endpoint)
      printResult(result)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('Benchmark Complete')
}

async function benchmarkEndpoint(
  profile: BenchmarkProfile,
  endpoint: { path: string; method: string; body?: unknown }
): Promise<BenchmarkResult> {
  const url = `http://localhost:${profile.port}${endpoint.path}`
  const responseTimes: number[] = []
  let successCount = 0
  let failCount = 0

  const startTime = Date.now()
  const promises = []

  // Make concurrent requests
  while (Date.now() - startTime < TEST_DURATION) {
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      promises.push(
        (async () => {
          const reqStart = performance.now()

          try {
            const response = await fetch(url, {
              method: endpoint.method,
              headers: { 'Content-Type': 'application/json' },
              body:
                endpoint.method === 'POST' ? JSON.stringify(endpoint.body) : undefined,
            })

            const reqTime = performance.now() - reqStart
            responseTimes.push(reqTime)

            if (response.ok) {
              successCount++
            } else {
              failCount++
            }
          } catch (error) {
            failCount++
          }
        })()
      )

      if (promises.length >= 20) {
        await Promise.all(promises.splice(0, 10))
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises)
      promises.length = 0
    }
  }

  // Wait for remaining promises
  if (promises.length > 0) {
    await Promise.all(promises)
  }

  // Calculate statistics
  responseTimes.sort((a, b) => a - b)

  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  const totalRequests = successCount + failCount
  const requestsPerSecond = (totalRequests / TEST_DURATION) * 1000

  return {
    profile: profile.name,
    endpoint: endpoint.path,
    totalRequests,
    successfulRequests: successCount,
    failedRequests: failCount,
    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    minResponseTime: Math.round(responseTimes[0] * 100) / 100,
    maxResponseTime: Math.round(responseTimes[responseTimes.length - 1] * 100) / 100,
    p95ResponseTime:
      Math.round(responseTimes[Math.floor(responseTimes.length * 0.95)] * 100) / 100,
    p99ResponseTime:
      Math.round(responseTimes[Math.floor(responseTimes.length * 0.99)] * 100) / 100,
    requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
  }
}

function printResult(result: BenchmarkResult) {
  console.log(`\n  ${result.endpoint}`)
  console.log(`    Total Requests:     ${result.totalRequests}`)
  console.log(`    Successful:         ${result.successfulRequests} (${Math.round((result.successfulRequests / result.totalRequests) * 100)}%)`)
  console.log(`    Failed:             ${result.failedRequests}`)
  console.log(`    Avg Response Time:  ${result.avgResponseTime}ms`)
  console.log(`    Min Response Time:  ${result.minResponseTime}ms`)
  console.log(`    Max Response Time:  ${result.maxResponseTime}ms`)
  console.log(`    P95 Response Time:  ${result.p95ResponseTime}ms`)
  console.log(`    P99 Response Time:  ${result.p99ResponseTime}ms`)
  console.log(`    Requests/Second:    ${result.requestsPerSecond}`)
}

// Run benchmark
runBenchmark().catch(console.error)
