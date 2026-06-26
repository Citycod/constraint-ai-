/**
 * Rules Engine: Evaluates decision trees with memoization and performance optimization.
 * Designed for constraint-aware environments (low-end phones, edge devices).
 */

import {
  Condition,
  ConditionGroup,
  DecisionNode,
  DecisionResult,
  EvaluationOptions,
  MemoEntry,
  ResultNode,
  RuleContext,
  Ruleset,
} from './types'

class RulesEngine {
  private memoCache: Map<string, MemoEntry> = new Map()
  private memoMaxSize = 1000
  private memoTTL = 3600000 // 1 hour in milliseconds

  /**
   * Evaluate a ruleset against a context
   */
  evaluate(
    ruleset: Ruleset,
    context: RuleContext,
    options: EvaluationOptions = {}
  ): DecisionResult {
    const startTime = performance.now()
    const { memoize = true, timeout = 5000, verbose = false } = options

    try {
      // Check memoization cache
      if (memoize) {
        const cached = this.checkMemoCache(ruleset, context)
        if (cached) {
          if (verbose) console.log('[RulesEngine] Cache hit')
          return { ...cached, evaluationTime: performance.now() - startTime }
        }
      }

      // Evaluate the decision tree
      const result = this.evaluateNode(ruleset.root, context, {
        timeout,
        startTime,
      })

      // Store in memo cache
      if (memoize) {
        this.storeMemoCache(ruleset, context, result)
      }

      return {
        ...result,
        evaluationTime: performance.now() - startTime,
      }
    } catch (error) {
      const evaluationTime = performance.now() - startTime
      return {
        nodeId: 'error',
        success: false,
        data: {},
        evaluationTime,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Recursively evaluate a decision node
   */
  private evaluateNode(
    node: DecisionNode | ResultNode,
    context: RuleContext,
    config: { timeout: number; startTime: number }
  ): DecisionResult {
    // Check timeout
    if (performance.now() - config.startTime > config.timeout) {
      throw new Error('Rule evaluation timeout exceeded')
    }

    // Terminal node (result)
    if (node.type === 'result') {
      return {
        nodeId: node.id,
        success: true,
        data: (node as ResultNode).data,
        evaluationTime: 0,
      }
    }

    const decisionNode = node as DecisionNode

    // Decision node with condition
    if (decisionNode.condition) {
      const conditionMet = this.evaluateCondition(
        decisionNode.condition,
        context
      )

      if (conditionMet && decisionNode.onTrue) {
        return this.evaluateNode(decisionNode.onTrue, context, config)
      } else if (!conditionMet && decisionNode.onFalse) {
        return this.evaluateNode(decisionNode.onFalse, context, config)
      } else {
        // No branch taken, return safe default
        return {
          nodeId: decisionNode.id,
          success: false,
          data: { reason: 'No matching branch' },
          evaluationTime: 0,
        }
      }
    }

    // Branch node with multiple outcomes
    if (decisionNode.branches && decisionNode.branches.length > 0) {
      for (const branch of decisionNode.branches) {
        if (this.evaluateCondition(branch.condition, context)) {
          return this.evaluateNode(branch.node, context, config)
        }
      }
      // No branch matched
      return {
        nodeId: decisionNode.id,
        success: false,
        data: { reason: 'No matching branch' },
        evaluationTime: 0,
      }
    }

    // Shouldn't reach here
    return {
      nodeId: decisionNode.id,
      success: false,
      data: { reason: 'Malformed decision node' },
      evaluationTime: 0,
    }
  }

  /**
   * Evaluate a condition or condition group
   */
  private evaluateCondition(
    condition: Condition | ConditionGroup,
    context: RuleContext
  ): boolean {
    if ('logic' in condition) {
      // ConditionGroup
      const results = condition.conditions.map((c) =>
        this.evaluateCondition(c, context)
      )

      if (condition.logic === 'AND') {
        return results.every((r) => r === true)
      } else {
        return results.some((r) => r === true)
      }
    } else {
      // Condition
      return this.evaluateSingleCondition(condition, context)
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateSingleCondition(
    condition: Condition,
    context: RuleContext
  ): boolean {
    const contextValue = context[condition.field]

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value
      case 'not_equals':
        return contextValue !== condition.value
      case 'greater_than':
        return Number(contextValue) > Number(condition.value)
      case 'less_than':
        return Number(contextValue) < Number(condition.value)
      case 'greater_equal':
        return Number(contextValue) >= Number(condition.value)
      case 'less_equal':
        return Number(contextValue) <= Number(condition.value)
      case 'in_set':
        return Array.isArray(condition.value)
          ? condition.value.includes(contextValue)
          : false
      case 'not_in_set':
        return Array.isArray(condition.value)
          ? !condition.value.includes(contextValue)
          : true
      case 'contains':
        return String(contextValue).includes(String(condition.value))
      case 'not_contains':
        return !String(contextValue).includes(String(condition.value))
      default:
        return false
    }
  }

  /**
   * Generate a hash of context for memoization
   */
  private hashContext(context: RuleContext): string {
    try {
      return JSON.stringify(context)
    } catch {
      return ''
    }
  }

  /**
   * Check if result exists in memo cache
   */
  private checkMemoCache(ruleset: Ruleset, context: RuleContext): DecisionResult | null {
    const key = `${ruleset.id}:${this.hashContext(context)}`
    const entry = this.memoCache.get(key)

    if (
      entry &&
      performance.now() - entry.timestamp < this.memoTTL
    ) {
      return entry.result
    } else if (entry) {
      this.memoCache.delete(key)
    }

    return null
  }

  /**
   * Store result in memo cache with LRU eviction
   */
  private storeMemoCache(
    ruleset: Ruleset,
    context: RuleContext,
    result: DecisionResult
  ): void {
    // Evict oldest entries if cache is full
    if (this.memoCache.size >= this.memoMaxSize) {
      const oldestKey = this.memoCache.keys().next().value
      if (oldestKey) this.memoCache.delete(oldestKey)
    }

    const key = `${ruleset.id}:${this.hashContext(context)}`
    this.memoCache.set(key, {
      contextHash: key,
      result,
      timestamp: performance.now(),
    })
  }

  /**
   * Clear the memo cache
   */
  clearMemoCache(): void {
    this.memoCache.clear()
  }

  /**
   * Get memo cache stats (for debugging)
   */
  getMemoCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.memoCache.size,
      maxSize: this.memoMaxSize,
    }
  }
}

// Singleton instance
export const rulesEngine = new RulesEngine()

// Export for testing
export { RulesEngine }
