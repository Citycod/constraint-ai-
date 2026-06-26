/**
 * Core types and interfaces for the rules-based decision engine.
 * Supports tree-based decision making with memoization for performance.
 */

// Decision node types
export type NodeType = 'decision' | 'result' | 'branch'

// Rule condition operators
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'in_set'
  | 'not_in_set'
  | 'contains'
  | 'not_contains'

// A single condition (e.g., symptom === 'fever')
export interface Condition {
  field: string
  operator: ConditionOperator
  value: unknown
}

// A combination of conditions with AND/OR logic
export interface ConditionGroup {
  logic: 'AND' | 'OR'
  conditions: (Condition | ConditionGroup)[]
}

// A decision node that branches based on conditions
export interface DecisionNode {
  id: string
  type: NodeType
  description?: string
  // For decision nodes
  condition?: ConditionGroup
  onTrue?: DecisionNode | ResultNode
  onFalse?: DecisionNode | ResultNode
  // For branch nodes (multiple outcomes)
  branches?: Array<{
    condition: ConditionGroup
    node: DecisionNode | ResultNode
  }>
}

// A terminal node containing the decision result
export interface ResultNode {
  id: string
  type: 'result'
  description?: string
  data: Record<string, unknown>
}

// Context passed to rule evaluation
export interface RuleContext {
  [key: string]: unknown
}

// Result from evaluating a decision tree
export interface DecisionResult {
  nodeId: string
  success: boolean
  data: Record<string, unknown>
  evaluationTime: number // milliseconds
  error?: string
}

// Memoization cache entry
export interface MemoEntry {
  contextHash: string
  result: DecisionResult
  timestamp: number
}

// Rule evaluation options
export interface EvaluationOptions {
  memoize?: boolean
  timeout?: number // milliseconds, default 5000
  verbose?: boolean
}

// Decision tree ruleset
export interface Ruleset {
  id: string
  name: string
  description: string
  version: string
  root: DecisionNode | ResultNode
  metadata?: {
    author?: string
    createdAt?: string
    updatedAt?: string
    tags?: string[]
  }
}
