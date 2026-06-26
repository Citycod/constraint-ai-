/**
 * Healthcare Triage Ruleset
 * Implements decision tree for symptom-based severity assessment.
 * Returns severity level: 'urgent', 'moderate', or 'mild'
 */

import { DecisionNode, ResultNode, Ruleset } from './types'

// Helper to create result nodes
const createResult = (
  id: string,
  severity: 'urgent' | 'moderate' | 'mild',
  recommendation: string,
  reason: string
): ResultNode => ({
  id,
  type: 'result',
  description: recommendation,
  data: {
    severity,
    recommendation,
    reason,
    timestamp: Date.now(),
  },
})

// Helper to create decision nodes
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
 * Main healthcare triage ruleset
 * Assessment flow:
 * 1. Check for life-threatening symptoms (urgent)
 * 2. Check for serious symptoms (moderate)
 * 3. Everything else (mild)
 */
export const healthcareTriage: Ruleset = {
  id: 'healthcare-triage-v1',
  name: 'Healthcare Symptom Triage',
  description:
    'Rule-based symptom severity assessment for initial triage guidance',
  version: '1.0.0',
  metadata: {
    author: 'Edge AI System',
    tags: ['healthcare', 'triage', 'offline-first'],
  },
  root: createDecision(
    'check-critical-symptoms',
    'Check for critical life-threatening symptoms',
    {
      logic: 'OR',
      conditions: [
        { field: 'symptoms', operator: 'contains', value: 'chest_pain' },
        { field: 'symptoms', operator: 'contains', value: 'severe_shortness_breath' },
        { field: 'symptoms', operator: 'contains', value: 'loss_consciousness' },
        { field: 'symptoms', operator: 'contains', value: 'severe_bleeding' },
        { field: 'symptoms', operator: 'contains', value: 'difficulty_speaking' },
      ],
    },
    // URGENT PATH
    createResult(
      'urgent-critical',
      'urgent',
      'Call 911 or go to nearest emergency room immediately',
      'Critical symptoms detected'
    ),
    // Continue to secondary check
    createDecision(
      'check-serious-symptoms',
      'Check for serious symptoms requiring urgent care',
      {
        logic: 'OR',
        conditions: [
          { field: 'symptoms', operator: 'contains', value: 'high_fever' },
          { field: 'symptoms', operator: 'contains', value: 'severe_pain' },
          { field: 'symptoms', operator: 'contains', value: 'persistent_vomiting' },
          { field: 'symptoms', operator: 'contains', value: 'confusion' },
          { field: 'age', operator: 'less_than', value: 5 },
          { field: 'age', operator: 'greater_than', value: 65 },
        ],
      },
      // MODERATE PATH
      createDecision(
        'check-fever-combination',
        'Check for fever with additional symptoms',
        {
          logic: 'AND',
          conditions: [
            { field: 'symptoms', operator: 'contains', value: 'fever' },
            {
              logic: 'OR',
              conditions: [
                { field: 'symptoms', operator: 'contains', value: 'cough' },
                { field: 'symptoms', operator: 'contains', value: 'sore_throat' },
              ],
            },
          ],
        },
        createResult(
          'moderate-fever-combo',
          'moderate',
          'Visit urgent care or doctor within 24 hours',
          'Fever with respiratory symptoms'
        ),
        createResult(
          'moderate-serious',
          'moderate',
          'Visit doctor or urgent care as soon as possible',
          'Serious symptoms detected'
        )
      ),
      // MILD PATH
      createDecision(
        'check-common-symptoms',
        'Check for common mild symptoms',
        {
          logic: 'OR',
          conditions: [
            { field: 'symptoms', operator: 'contains', value: 'mild_cough' },
            { field: 'symptoms', operator: 'contains', value: 'runny_nose' },
            { field: 'symptoms', operator: 'contains', value: 'sneezing' },
            { field: 'symptoms', operator: 'contains', value: 'minor_ache' },
          ],
        },
        createResult(
          'mild-common',
          'mild',
          'Rest, hydrate, and monitor symptoms. Call doctor if symptoms persist or worsen.',
          'Common cold symptoms'
        ),
        createResult(
          'mild-no-symptoms',
          'mild',
          'No concerning symptoms detected. Monitor your health.',
          'No significant symptoms'
        )
      )
    )
  ),
}

/**
 * Alternative simplified ruleset for quick assessment
 * Used when performance is critical
 */
export const healthcareTriageSimplified: Ruleset = {
  id: 'healthcare-triage-simple',
  name: 'Healthcare Symptom Triage (Simplified)',
  description: 'Lightweight symptom severity assessment',
  version: '1.0.0',
  root: createDecision(
    'quick-check',
    'Quick severity check',
    {
      logic: 'OR',
      conditions: [
        { field: 'severity_score', operator: 'greater_equal', value: 8 },
      ],
    },
    createResult(
      'quick-urgent',
      'urgent',
      'Seek emergency care',
      'High severity score'
    ),
    createDecision(
      'moderate-check',
      'Check moderate severity',
      {
        logic: 'OR',
        conditions: [
          { field: 'severity_score', operator: 'greater_equal', value: 5 },
        ],
      },
      createResult(
        'quick-moderate',
        'moderate',
        'Visit urgent care',
        'Moderate severity'
      ),
      createResult(
        'quick-mild',
        'mild',
        'Rest and monitor',
        'Mild symptoms'
      )
    )
  ),
}

/**
 * Compute severity score from symptoms
 * Used as input to simplified ruleset or as auxiliary metric
 */
export function computeSeverityScore(symptoms: string[]): number {
  const criticalSymptoms = new Set([
    'chest_pain',
    'severe_shortness_breath',
    'loss_consciousness',
    'severe_bleeding',
    'difficulty_speaking',
  ])

  const seriousSymptoms = new Set([
    'high_fever',
    'severe_pain',
    'persistent_vomiting',
    'confusion',
  ])

  const commonSymptoms = new Set([
    'mild_cough',
    'runny_nose',
    'sneezing',
    'minor_ache',
    'fever',
    'cough',
    'sore_throat',
  ])

  let score = 0

  for (const symptom of symptoms) {
    if (criticalSymptoms.has(symptom)) {
      score += 10
    } else if (seriousSymptoms.has(symptom)) {
      score += 6
    } else if (commonSymptoms.has(symptom)) {
      score += 2
    }
  }

  return Math.min(score, 10) // Cap at 10
}
