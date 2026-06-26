/**
 * Education Quiz API Endpoint
 * POST /api/quiz
 * Processes answers and returns next question with adaptive difficulty
 */

import { rulesEngine, educationAdaptive, computeAdaptiveDifficulty } from '@/lib/rules-engine'
import { getRandomQuestion, QUIZ_QUESTIONS } from '@/lib/quiz-data'
import { profiler } from '@/lib/metrics'

export interface QuizRequest {
  quizId: string
  questionId: string
  answer: string
  recentCorrectCount: number
  recentTotalCount: number
  currentDifficulty: 'easy' | 'medium' | 'hard'
  answeredQuestionIds: string[]
}

export interface QuizResponse {
  correct: boolean
  explanation: string
  nextQuestion: {
    id: string
    question: string
    options: string[]
    difficulty: 'easy' | 'medium' | 'hard'
  }
  difficulty: 'easy' | 'medium' | 'hard'
  score: number
  timestamp: number
  evaluationTime: number
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: QuizRequest = await request.json()

    // Validate input
    if (!body.quizId || !body.questionId || body.answer === undefined) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the current question
    const currentQuestion = QUIZ_QUESTIONS.find((q) => q.id === body.questionId)
    if (!currentQuestion) {
      return Response.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if answer is correct
    const isCorrect = body.answer === currentQuestion.options[currentQuestion.correctAnswerIndex]

    // Update correctness count
    const newCorrectCount = isCorrect ? body.recentCorrectCount + 1 : body.recentCorrectCount
    const newTotalCount = body.recentTotalCount + 1

    // Profile the difficulty adaptation
    const newDifficulty = await profiler.profileAsync(
      'quiz-difficulty-adaptation',
      async () => {
        // Use rules engine to determine new difficulty
        const result = rulesEngine.evaluate(educationAdaptive, {
          recent_correct_count: newCorrectCount,
          recent_total_count: newTotalCount,
          current_difficulty: body.currentDifficulty,
        })

        if (result.success) {
          return (result.data.difficulty as 'easy' | 'medium' | 'hard') || body.currentDifficulty
        }

        // Fallback to simple computation
        return computeAdaptiveDifficulty(newCorrectCount, newTotalCount, body.currentDifficulty)
      }
    )

    // Get next question (avoiding already answered ones)
    const nextQuestion = getRandomQuestion(undefined, newDifficulty)
    if (!nextQuestion) {
      return Response.json(
        { error: 'No more questions available' },
        { status: 400 }
      )
    }

    // Calculate score
    const score = Math.round((newCorrectCount / newTotalCount) * 100)

    const response: QuizResponse = {
      correct: isCorrect,
      explanation: currentQuestion.explanation,
      nextQuestion: {
        id: nextQuestion.id,
        question: nextQuestion.question,
        options: nextQuestion.options,
        difficulty: nextQuestion.difficulty,
      },
      difficulty: newDifficulty,
      score,
      timestamp: Date.now(),
      evaluationTime: 0, // Will be set by caller
    }

    return Response.json(response)
  } catch (error) {
    console.error('[quiz/route] Error:', error)
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
 * GET endpoint for quiz info and available questions
 */
export async function GET(): Promise<Response> {
  return Response.json({
    endpoint: '/api/quiz',
    method: 'POST',
    description: 'Adaptive education quiz with difficulty adjustment',
    totalQuestions: QUIZ_QUESTIONS.length,
    categories: Array.from(new Set(QUIZ_QUESTIONS.map((q) => q.category))),
    difficulties: ['easy', 'medium', 'hard'],
    example: {
      quizId: 'quiz-123',
      questionId: 'sci-easy-1',
      answer: 'Cell',
      recentCorrectCount: 1,
      recentTotalCount: 2,
      currentDifficulty: 'easy',
      answeredQuestionIds: ['sci-easy-1'],
    },
  })
}
