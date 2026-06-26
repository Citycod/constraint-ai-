/**
 * Performance Monitoring
 * Tracks Core Web Vitals and custom metrics for constraint-aware testing.
 * Metrics collected: LCP, FID, CLS, TTFB, custom rule evaluation time.
 */

export interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id: string
  entries?: PerformanceEntry[]
}

export interface CustomMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
}

export interface PerformanceReport {
  timestamp: number
  url: string
  vitals: {
    lcp?: WebVital
    fid?: WebVital
    cls?: WebVital
    ttfb?: WebVital
  }
  custom: CustomMetric[]
  systemMetrics?: {
    memory?: MemoryMetrics
    cpu?: CPUMetrics
  }
}

export interface MemoryMetrics {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface CPUMetrics {
  userTime: number
  systemTime: number
}

class PerformanceMonitor {
  private metrics: CustomMetric[] = []
  private vitals: Map<string, WebVital> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()
  private reportListeners: Set<(report: PerformanceReport) => void> = new Set()

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (typeof window === 'undefined') return

    // Setup Web Vitals observers
    this.setupLCPObserver()
    this.setupFIDObserver()
    this.setupCLSObserver()
    this.setupTTFBObserver()
  }

  /**
   * Setup LCP (Largest Contentful Paint) observer
   */
  private setupLCPObserver(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number
          loadTime?: number
        }

        const value = (lastEntry.renderTime || lastEntry.loadTime || 0) / 1000

        this.vitals.set('LCP', {
          name: 'Largest Contentful Paint',
          value,
          rating: value < 2.5 ? 'good' : value < 4.0 ? 'needs-improvement' : 'poor',
          id: 'lcp',
          entries: entries,
        })
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('LCP', observer)
    } catch (e) {
      console.log('[PerformanceMonitor] LCP observer not supported')
    }
  }

  /**
   * Setup FID (First Input Delay) observer
   */
  private setupFIDObserver(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0] as PerformanceEntry & { processingDuration?: number }

        const value = (firstEntry.processingDuration || 0) / 1000

        this.vitals.set('FID', {
          name: 'First Input Delay',
          value,
          rating: value < 0.1 ? 'good' : value < 0.3 ? 'needs-improvement' : 'poor',
          id: 'fid',
          entries: [firstEntry],
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('FID', observer)
    } catch (e) {
      console.log('[PerformanceMonitor] FID observer not supported')
    }
  }

  /**
   * Setup CLS (Cumulative Layout Shift) observer
   */
  private setupCLSObserver(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }

        this.vitals.set('CLS', {
          name: 'Cumulative Layout Shift',
          value: clsValue,
          rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
          id: 'cls',
          entries: list.getEntries(),
        })
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('CLS', observer)
    } catch (e) {
      console.log('[PerformanceMonitor] CLS observer not supported')
    }
  }

  /**
   * Setup TTFB (Time to First Byte) observer
   */
  private setupTTFBObserver(): void {
    if (typeof window === 'undefined' || !window.performance) return

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (navigation) {
        const value = (navigation.responseStart - navigation.fetchStart) / 1000

        this.vitals.set('TTFB', {
          name: 'Time to First Byte',
          value,
          rating: value < 0.6 ? 'good' : value < 1.2 ? 'needs-improvement' : 'poor',
          id: 'ttfb',
        })
      }
    } catch (e) {
      console.log('[PerformanceMonitor] TTFB observer not supported')
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags?: Record<string, string>
  ): void {
    const metric: CustomMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    }

    this.metrics.push(metric)

    // Keep only last 100 metrics to avoid memory bloat
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  /**
   * Get current Web Vitals
   */
  getWebVitals(): Record<string, WebVital> {
    const result: Record<string, WebVital> = {}
    this.vitals.forEach((vital, key) => {
      result[key.toLowerCase()] = vital
    })
    return result
  }

  /**
   * Get custom metrics
   */
  getCustomMetrics(): CustomMetric[] {
    return [...this.metrics]
  }

  /**
   * Get memory metrics (if available)
   */
  getMemoryMetrics(): MemoryMetrics | null {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return null
    }

    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize || 0,
      totalJSHeapSize: memory.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory.jsHeapSizeLimit || 0,
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const vitals = this.getWebVitals()
    return {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      vitals: {
        lcp: vitals.lcp,
        fid: vitals.fid,
        cls: vitals.cls,
        ttfb: vitals.ttfb,
      },
      custom: this.getCustomMetrics(),
      systemMetrics: {
        memory: this.getMemoryMetrics() || undefined,
      },
    }
  }

  /**
   * Send report to analytics endpoint
   */
  async sendReport(endpoint: string = '/api/health'): Promise<void> {
    try {
      const report = this.generateReport()
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
        // Don't wait for response, fire and forget
        keepalive: true,
      })
    } catch (error) {
      console.log('[PerformanceMonitor] Failed to send report:', error)
    }
  }

  /**
   * Register a listener for performance reports
   */
  onReport(listener: (report: PerformanceReport) => void): () => void {
    this.reportListeners.add(listener)
    return () => this.reportListeners.delete(listener)
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach((observer) => {
      try {
        observer.disconnect()
      } catch (e) {
        // Ignore
      }
    })
    this.observers.clear()
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()
