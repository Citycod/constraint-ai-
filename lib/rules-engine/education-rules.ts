/**
 * Education Quiz Ruleset
 * Implements adaptive question selection and difficulty adjustment.
 * Tracks performance and adjusts question difficulty in real-time.
 */

import { DecisionNode, ResultNode, Ruleset } from './types'

// Helper functions
const createResult = (
  id: string,
  action: string,
  difficulty: 'easy' | 'medium' | 'hard',
  reasoning: string
): ResultNode => ({
  id,
  type: 'result',
  description: action,
  data: {
    action,
    difficulty,
    reasoning,
    timestamp: Date.now(),
  },
})

const createDecision = (
  id: string,
  description: string,
  condition: any,
  onTrue: DecisionNode | ResultNode,
  onFalse: DecisionNode | ResultNode
): DecisionNode => ({
  id,
  type: 'decision',
  description,
  condition,
  onTrue,
  onFalse,
})

/**
 * Education quiz difficulty adaptation ruleset
 * Flow:
 * 1. Check recent performance (last 3 questions)
 * 2. Adjust difficulty up if correct streak
 * 3. Adjust difficulty down if wrong streak
 * 4. Maintain if mixed performance
 */
export const educationAdaptive: Ruleset = {
  id: 'education-adaptive-v1',
  name: 'Education Quiz Adaptive Difficulty',
  description: 'Adjusts question difficulty based on performance',
  version: '1.0.0',
  metadata: {
    author: 'Edge AI System',
    tags: ['education', 'adaptive', 'quiz'],
  },
  root: createDecision(
    'check-correctness-streak',
    'Check answer correctness streak',
    {
      logic: 'AND',
      conditions: [
        { field: 'recent_correct_count', operator: 'greater_equal', value: 2 },
        { field: 'current_difficulty', operator: 'not_equals', value: 'hard' },
      ],
    },
    // INCREASE DIFFICULTY
    createDecision(
      'can-increase-difficulty',
      'Verify can increase difficulty',
      {
        logic: 'OR',
        conditions: [
          { field: 'current_difficulty', operator: 'equals', value: 'easy' },
          { field: 'current_difficulty', operator: 'equals', value: 'medium' },
        ],
      },
      createResult(
        'increase-difficulty',
        'Increase question difficulty and select harder question',
        'hard' as const,
        'User showing strong performance'
      ),
      createResult(
        'maintain-hard',
        'Maintain hard difficulty',
        'hard' as const,
        'Already at maximum difficulty'
      )
    ),
    // Check for wrong streak
    createDecision(
      'check-wrong-streak',
      'Check error streak',
      {
        logic: 'AND',
        conditions: [
          { field: 'recent_correct_count', operator: 'less_equal', value: 0 },
          { field: 'recent_total_count', operator: 'greater_equal', value: 2 },
          { field: 'current_difficulty', operator: 'not_equals', value: 'easy' },
        ],
      },
      // DECREASE DIFFICULTY
      createDecision(
        'can-decrease-difficulty',
        'Verify can decrease difficulty',
        {
          logic: 'OR',
          conditions: [
            { field: 'current_difficulty', operator: 'equals', value: 'hard' },
            { field: 'current_difficulty', operator: 'equals', value: 'medium' },
          ],
        },
        createResult(
          'decrease-difficulty',
          'Decrease question difficulty and select easier question',
          'easy' as const,
          'User struggling with current difficulty'
        ),
        createResult(
          'maintain-easy',
          'Maintain easy difficulty',
          'easy' as const,
          'Already at minimum difficulty'
        )
      ),
      // MAINTAIN DIFFICULTY
      createResult(
        'maintain-difficulty',
        'Maintain current difficulty and select similar question',
        'medium' as const,
        'Performance trending toward expected level'
      )
    )
  ),
}

/**
 * Scoring ruleset for quiz completion
 */
export const educationScoring: Ruleset = {
  id: 'education-scoring-v1',
  name: 'Education Quiz Scoring',
  description: 'Calculates quiz score based on performance',
  version: '1.0.0',
  root: createDecision(
    'check-accuracy',
    'Check overall accuracy',
    {
      logic: 'OR',
      conditions: [
        { field: 'accuracy_percentage', operator: 'greater_equal', value: 90 },
      ],
    },
    // HIGH SCORE
    createDecision(
      'check-perfect',
      'Check for perfect score',
      {
        logic: 'OR',
        conditions: [
          { field: 'accuracy_percentage', operator: 'equals', value: 100 },
        ],
      },
      createResult(
        'perfect-score',
        'Award perfect score badge',
        'hard' as const,
        'Perfect performance'
      ),
      createResult(
        'excellent-score',
        'Award excellent score badge',
        'hard' as const,
        'Excellent performance (90%+)'
      )
    ),
    // Check medium scores
    createDecision(
      'check-medium',
      'Check medium accuracy',
      {
        logic: 'AND',
        conditions: [
          { field: 'accuracy_percentage', operator: 'greater_equal', value: 70 },
          { field: 'accuracy_percentage', operator: 'less_than', value: 90 },
        ],
      },
      createResult(
        'good-score',
        'Award good score badge',
        'medium' as const,
        'Good performance (70-89%)'
      ),
      // LOW SCORE
      createResult(
        'fair-score',
        'Recommend review of material',
        'easy' as const,
        'Fair performance (below 70%)'
      )
    )
  ),
}

/**
 * Question category selection ruleset
 * Routes to appropriate question pool based on performance and user profile
 */
export const educationCategorySelection: Ruleset = {
  id: 'education-category-v1',
  name: 'Education Category Selection',
  description: 'Selects question category based on user profile and performance',
  version: '1.0.0',
  root: createDecision(
    'check-user-strength',
    'Check user strength area',
    {
      logic: 'AND',
      conditions: [
        { field: 'high_performance_category', operator: 'not_equals', value: null },
        { field: 'category_confidence', operator: 'greater_equal', value: 0.75 },
      ],
    },
    // Select from high-performance area
    createDecision(
      'strengthen-or-branch',
      'Strengthen or branch to new area',
      {
        logic: 'AND',
        conditions: [
          { field: 'questions_in_category', operator: 'less_than', value: 5 },
        ],
      },
      createResult(
        'stay-in-category',
        'Continue in high-performance category',
        'hard' as const,
        'User showing strength, deepen knowledge'
      ),
      createResult(
        'branch-category',
        'Introduce adjacent category',
        'medium' as const,
        'Sufficient practice in strength area, explore new topic'
      )
    ),
    // Select from weak area or random
    createDecision(
      'target-weakness',
      'Check if targeting weak area',
      {
        logic: 'OR',
        conditions: [
          { field: 'low_performance_category', operator: 'not_equals', value: null },
        ],
      },
      createResult(
        'remediate-weak',
        'Select from low-performance category for remediation',
        'easy' as const,
        'Focus on improvement areas'
      ),
      createResult(
        'balanced-selection',
        'Select from balanced category mix',
        'medium' as const,
        'Maintain balanced learning'
      )
    )
  ),
}

/**
 * Compute adaptive difficulty level based on performance
 */
export function computeAdaptiveDifficulty(
  recentCorrect: number,
  recentTotal: number,
  currentDifficulty: 'easy' | 'medium' | 'hard'
): 'easy' | 'medium' | 'hard' {
  if (recentTotal === 0) return currentDifficulty

  const correctPercentage = (recentCorrect / recentTotal) * 100

  // Increase difficulty if performing well
  if (correctPercentage >= 80 && currentDifficulty !== 'hard') {
    return currentDifficulty === 'easy' ? 'medium' : 'hard'
  }

  // Decrease difficulty if struggling
  if (correctPercentage <= 40 && currentDifficulty !== 'easy') {
    return currentDifficulty === 'hard' ? 'medium' : 'easy'
  }

  // Maintain current difficulty
  return currentDifficulty
}

/**
 * Compute quiz score with bonus for difficulty
 */
export function computeQuizScore(
  correctAnswers: number,
  totalQuestions: number,
  averageDifficulty: 'easy' | 'medium' | 'hard'
): number {
  const baseAccuracy = (correctAnswers / totalQuestions) * 100
  const difficultyMultiplier =
    averageDifficulty === 'easy' ? 1 : averageDifficulty === 'medium' ? 1.1 : 1.2

  return Math.min(Math.round(baseAccuracy * difficultyMultiplier), 100)
}
