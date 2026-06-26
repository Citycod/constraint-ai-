/**
 * Healthcare Triage API Endpoint
 * POST /api/triage
 * Evaluates symptoms and returns severity assessment
 */

import { rulesEngine, healthcareTriage } from '@/lib/rules-engine'
import { profiler } from '@/lib/metrics'

export interface TriageRequest {
  symptoms: string[] // e.g., ['fever', 'cough', 'sore_throat']
  age?: number
  duration?: number // hours
}

export interface TriageResponse {
  severity: 'urgent' | 'moderate' | 'mild'
  recommendation: string
  reason: string
  timestamp: number
  evaluationTime: number
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: TriageRequest = await request.json()

    // Validate input
    if (!body.symptoms || !Array.isArray(body.symptoms) || body.symptoms.length === 0) {
      return Response.json(
        { error: 'symptoms array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Profile the evaluation
    const result = await profiler.profileAsync('triage-evaluation', async () => {
      return rulesEngine.evaluate(healthcareTriage, {
        symptoms: body.symptoms,
        age: body.age || 0,
        duration: body.duration || 0,
      })
    })

    if (!result.success) {
      return Response.json(
        {
          error: 'Failed to evaluate triage',
          details: result.error,
        },
        { status: 500 }
      )
    }

    const response: TriageResponse = {
      severity: (result.data.severity as 'urgent' | 'moderate' | 'mild') || 'mild',
      recommendation: (result.data.recommendation as string) || 'Consult a healthcare provider',
      reason: (result.data.reason as string) || 'Assessment complete',
      timestamp: Date.now(),
      evaluationTime: result.evaluationTime,
    }

    return Response.json(response)
  } catch (error) {
    console.error('[triage/route] Error:', error)
    return Response.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for health check / examples
 */
export async function GET(): Promise<Response> {
  return Response.json({
    endpoint: '/api/triage',
    method: 'POST',
    description: 'Healthcare symptom severity triage assessment',
    example: {
      symptoms: ['fever', 'cough', 'sore_throat'],
      age: 35,
      duration: 2,
    },
    availableSymptoms: [
      'fever',
      'high_fever',
      'mild_cough',
      'cough',
      'sore_throat',
      'runny_nose',
      'sneezing',
      'chest_pain',
      'severe_shortness_breath',
      'loss_consciousness',
      'severe_bleeding',
      'difficulty_speaking',
      'severe_pain',
      'persistent_vomiting',
      'confusion',
      'minor_ache',
    ],
  })
}
