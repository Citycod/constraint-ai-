/**
 * System Health & Metrics Endpoint
 * POST /api/health
 * Receives performance metrics from clients and returns system status
 */

import { performanceMonitor } from '@/lib/metrics'
import type { PerformanceReport } from '@/lib/metrics/performance'

export interface HealthRequest {
  timestamp: number
  url: string
  vitals?: {
    lcp?: { value: number; rating: string }
    fid?: { value: number; rating: string }
    cls?: { value: number; rating: string }
    ttfb?: { value: number; rating: string }
  }
  custom?: Array<{
    name: string
    value: number
    unit: string
    tags?: Record<string, string>
  }>
  systemMetrics?: {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: number
  message: string
  metrics?: {
    avgLCP?: number
    avgCLS?: number
    memoryUsage?: number
  }
}

// Store metrics for analysis (in production, use a real database)
const metricsStore: PerformanceReport[] = []
const MAX_STORED_REPORTS = 1000

export async function POST(request: Request): Promise<Response> {
  try {
    const body: HealthRequest = await request.json()

    // Store the metric
    metricsStore.push({
      timestamp: body.timestamp || Date.now(),
      url: body.url || '',
      vitals: {
        lcp: body.vitals?.lcp,
        fid: body.vitals?.fid,
        cls: body.vitals?.cls,
        ttfb: body.vitals?.ttfb,
      },
      custom: body.custom || [],
      systemMetrics: body.systemMetrics,
    })

    // Maintain max size
    if (metricsStore.length > MAX_STORED_REPORTS) {
      metricsStore.shift()
    }

    // Analyze metrics to determine health
    const health = analyzeMetrics()

    const response: HealthResponse = {
      status: health.status,
      timestamp: Date.now(),
      message: health.message,
      metrics: health.metrics,
    }

    return Response.json(response)
  } catch (error) {
    console.error('[health/route] Error:', error)
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: Date.now(),
        message: 'Failed to process health check',
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<Response> {
  const health = analyzeMetrics()

  return Response.json({
    status: health.status,
    timestamp: Date.now(),
    message: health.message,
    metrics: health.metrics,
    reportCount: metricsStore.length,
  })
}

/**
 * Analyze stored metrics to determine system health
 */
function analyzeMetrics(): {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  metrics: Record<string, number>
} {
  if (metricsStore.length === 0) {
    return {
      status: 'healthy',
      message: 'No metrics recorded yet',
      metrics: {},
    }
  }

  // Calculate averages
  const vitals = metricsStore
    .map((r) => r.vitals)
    .filter((v) => v)

  let avgLCP = 0
  let avgCLS = 0
  let avgTTFB = 0
  let goodRatings = 0
  let totalRatings = 0

  vitals.forEach((v) => {
    if (v.lcp) {
      avgLCP += v.lcp.value
      goodRatings += v.lcp.rating === 'good' ? 1 : 0
      totalRatings++
    }
    if (v.cls) {
      avgCLS += v.cls.value
      goodRatings += v.cls.rating === 'good' ? 1 : 0
      totalRatings++
    }
    if (v.ttfb) {
      avgTTFB += v.ttfb.value
      goodRatings += v.ttfb.rating === 'good' ? 1 : 0
      totalRatings++
    }
  })

  if (vitals.length > 0) {
    avgLCP /= vitals.length
    avgCLS /= vitals.length
    avgTTFB /= vitals.length
  }

  const goodRatio = totalRatings > 0 ? goodRatings / totalRatings : 1

  // Determine status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  let message = 'System is operating normally'

  if (avgLCP > 4 || avgCLS > 0.25 || goodRatio < 0.5) {
    status = 'degraded'
    message = 'Some performance metrics are outside acceptable ranges'
  }

  if (avgLCP > 8 || avgCLS > 0.5 || goodRatio < 0.3) {
    status = 'unhealthy'
    message = 'Performance metrics are significantly degraded'
  }

  const memoryUsage = metricsStore[metricsStore.length - 1].systemMetrics?.memory
    ? Math.round(
        (metricsStore[metricsStore.length - 1].systemMetrics!.memory!
          .usedJSHeapSize / 1024 / 1024) * 100
      ) / 100
    : 0

  return {
    status,
    message,
    metrics: {
      avgLCP: Math.round(avgLCP * 100) / 100,
      avgCLS: Math.round(avgCLS * 10000) / 10000,
      avgTTFB: Math.round(avgTTFB * 100) / 100,
      memoryUsageMB: memoryUsage,
      reportCount: metricsStore.length,
      goodMetricsRatio: Math.round(goodRatio * 100),
    },
  }
}
