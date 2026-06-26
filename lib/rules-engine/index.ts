/**
 * Rules Engine Module
 * Central export point for rules engine, rulesets, and utilities
 */

export * from './types'
export { RulesEngine, rulesEngine } from './engine'
export {
  healthcareTriage,
  healthcareTriageSimplified,
  computeSeverityScore,
} from './healthcare-rules'
export {
  educationAdaptive,
  educationScoring,
  educationCategorySelection,
  computeAdaptiveDifficulty,
  computeQuizScore,
} from './education-rules'
