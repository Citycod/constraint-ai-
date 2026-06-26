/**
 * Profiling Utilities
 * Measures rule evaluation performance and other critical operations.
 */

export interface ProfileResult {
  name: string
  duration: number // milliseconds
  memoryDelta?: number // bytes
  startMemory?: number
  endMemory?: number
}

class Profiler {
  private results: ProfileResult[] = []
  private maxResults = 1000

  /**
   * Profile a synchronous function
   */
  profileSync<T>(name: string, fn: () => T): T {
    const startMemory = this.getMemory()
    const startTime = performance.now()

    const result = fn()

    const duration = performance.now() - startTime
    const endMemory = this.getMemory()
    const memoryDelta = endMemory ? (endMemory - (startMemory || 0)) / 1024 : undefined

    this.recordResult({
      name,
      duration,
      memoryDelta,
      startMemory,
      endMemory,
    })

    return result
  }

  /**
   * Profile an async function
   */
  async profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startMemory = this.getMemory()
    const startTime = performance.now()

    const result = await fn()

    const duration = performance.now() - startTime
    const endMemory = this.getMemory()
    const memoryDelta = endMemory ? (endMemory - (startMemory || 0)) / 1024 : undefined

    this.recordResult({
      name,
      duration,
      memoryDelta,
      startMemory,
      endMemory,
    })

    return result
  }

  /**
   * Measure operation duration
   */
  measure(name: string, fn: () => void): number {
    const startTime = performance.now()
    fn()
    return performance.now() - startTime
  }

  /**
   * Record a profiling result
   */
  private recordResult(result: ProfileResult): void {
    this.results.push(result)

    // Keep only recent results
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(-this.maxResults)
    }
  }

  /**
   * Get memory usage in bytes
   */
  private getMemory(): number | null {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return null
    }

    return (performance as any).memory.usedJSHeapSize
  }

  /**
   * Get all profiling results
   */
  getResults(): ProfileResult[] {
    return [...this.results]
  }

  /**
   * Get statistics for a specific operation
   */
  getStats(operationName: string): {
    count: number
    min: number
    max: number
    avg: number
    median: number
  } | null {
    const results = this.results.filter((r) => r.name === operationName)

    if (results.length === 0) return null

    const durations = results.map((r) => r.duration).sort((a, b) => a - b)
    const min = durations[0]
    const max = durations[durations.length - 1]
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length
    const median = durations[Math.floor(durations.length / 2)]

    return { count: results.length, min, max, avg, median }
  }

  /**
   * Reset all results
   */
  reset(): void {
    this.results = []
  }

  /**
   * Generate summary report
   */
  generateSummary(): {
    totalMeasurements: number
    uniqueOperations: Set<string>
    averageDuration: number
    slowestOperation: { name: string; duration: number } | null
  } {
    const uniqueOperations = new Set(this.results.map((r) => r.name))
    const averageDuration =
      this.results.reduce((acc, r) => acc + r.duration, 0) / this.results.length || 0

    const slowestOperation = this.results.reduce<{
      name: string
      duration: number
    } | null>((acc, r) => {
      if (!acc || r.duration > acc.duration) {
        return { name: r.name, duration: r.duration }
      }
      return acc
    }, null)

    return {
      totalMeasurements: this.results.length,
      uniqueOperations,
      averageDuration,
      slowestOperation,
    }
  }
}

// Singleton instance
export const profiler = new Profiler()

/**
 * Decorator for profiling methods (experimental)
 */
export function profile(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  if (typeof originalMethod === 'function') {
    descriptor.value = function (...args: any[]) {
      const name = `${target.constructor.name}.${propertyKey}`
      return profiler.profileSync(name, () => originalMethod.apply(this, args))
    }
  }

  return descriptor
}
