'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { QuestionRenderer } from './QuestionRenderer'
import { getRandomQuestion } from '@/lib/quiz-data'
import type { QuizResponse } from '@/app/api/quiz/route'

interface QuizFlowProps {
  quizId: string
  category?: string
}

interface QuestionData {
  id: string
  question: string
  options: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export function QuizFlow({ quizId, category }: QuizFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [recentCorrect, setRecentCorrect] = useState(0)
  const [recentTotal, setRecentTotal] = useState(0)
  const [answeredIds, setAnsweredIds] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean
    explanation: string
  } | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  // Load initial question
  useEffect(() => {
    const question = getRandomQuestion(category, difficulty)
    if (question) {
      setCurrentQuestion({
        id: question.id,
        question: question.question,
        options: question.options,
        difficulty: question.difficulty,
      })
    }
  }, [category])

  const handleAnswer = async (selectedOption: string) => {
    if (!currentQuestion) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          questionId: currentQuestion.id,
          answer: selectedOption,
          recentCorrectCount: recentCorrect,
          recentTotalCount: recentTotal,
          currentDifficulty: difficulty,
          answeredQuestionIds: answeredIds,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process answer')
      }

      const data: QuizResponse = await response.json()

      // Update stats
      setRecentTotal(recentTotal + 1)
      if (data.correct) {
        setRecentCorrect(recentCorrect + 1)
      }

      setScore(data.score)
      setQuestionCount(questionCount + 1)
      setDifficulty(data.difficulty)

      // Show feedback
      setLastFeedback({
        correct: data.correct,
        explanation: data.explanation,
      })
      setShowFeedback(true)

      // After brief delay, load next question
      setTimeout(() => {
        setAnsweredIds([...answeredIds, currentQuestion.id])
        setCurrentQuestion({
          id: data.nextQuestion.id,
          question: data.nextQuestion.question,
          options: data.nextQuestion.options,
          difficulty: data.nextQuestion.difficulty,
        })
        setShowFeedback(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const handleFinish = () => {
    setIsFinished(true)
  }

  const handleRestart = () => {
    window.location.href = '/education'
  }

  if (isFinished) {
    return (
      <div className="text-center space-y-6 animate-in zoom-in duration-500 p-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Quiz Complete!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            You answered {questionCount} questions
          </p>

          {/* Score Display */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-slate-200 dark:text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                  className="text-blue-600 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white">{score}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Message */}
          <p className="text-xl font-semibold text-slate-900 dark:text-white mb-8">
            {score >= 90
              ? 'Excellent Performance!'
              : score >= 70
                ? 'Good Job!'
                : score >= 50
                  ? 'Keep Practicing!'
                  : 'Try Again!'}
          </p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart} variant="outline">
              Try Another Quiz
            </Button>
            <Button onClick={handleRestart}>
              Back to Quizzes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-slate-500 dark:text-slate-400 text-lg">Loading quiz...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            <span>Question {questionCount + 1}</span>
            <span>Score: {score}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(questionCount + 1) * 10}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Feedback Box (shown after answer) */}
      {showFeedback && lastFeedback && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            lastFeedback.correct
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
              : 'bg-red-50 dark:bg-red-900/20 border-red-500'
          }`}
        >
          <p className={`font-semibold mb-2 ${lastFeedback.correct ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
            {lastFeedback.correct ? 'Correct!' : 'Incorrect'}
          </p>
          <p className={`text-sm ${lastFeedback.correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {lastFeedback.explanation}
          </p>
        </div>
      )}

      {/* Question */}
      {!showFeedback && (
        <div className="p-2 md:p-0 animate-in fade-in duration-500">
          <QuestionRenderer
            question={currentQuestion.question}
            options={currentQuestion.options}
            difficulty={currentQuestion.difficulty}
            onSubmit={handleAnswer}
            loading={loading}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Finish Button */}
      {questionCount >= 5 && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={handleFinish}>
            Finish Quiz
          </Button>
        </div>
      )}
    </div>
  )
}
