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
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4 drop-shadow-sm">
            Quiz Complete!
          </h2>
          <p className="text-purple-200 text-lg mb-8">
            You answered {questionCount} questions
          </p>

          {/* Score Display */}
          <div className="flex justify-center mb-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                  className="drop-shadow-lg"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">{score}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Message */}
          <p className="text-2xl font-bold text-white mb-8">
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
    )
  }

  if (!currentQuestion) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-purple-200 animate-pulse text-xl font-medium">Preparing your adaptive quiz...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm font-semibold text-purple-200 mb-2">
            <span>Question {questionCount + 1}</span>
            <span>Score: {score}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm border border-white/5">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ width: `${(questionCount + 1) * 10}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Feedback Box (shown after answer) */}
      {showFeedback && lastFeedback && (
        <div
          className={`p-6 rounded-xl border animate-in slide-in-from-top-4 duration-300 ${
            lastFeedback.correct
              ? 'bg-green-500/20 border-green-500/50 backdrop-blur-md'
              : 'bg-red-500/20 border-red-500/50 backdrop-blur-md'
          }`}
        >
          <p className={`text-lg font-bold mb-2 ${lastFeedback.correct ? 'text-green-300' : 'text-red-300'}`}>
            {lastFeedback.correct ? 'Correct! 🎉' : 'Incorrect 💡'}
          </p>
          <p className="text-gray-200 leading-relaxed text-base">
            {lastFeedback.explanation}
          </p>
        </div>
      )}

      {/* Question */}
      {!showFeedback && (
        <div className="bg-white/5 rounded-2xl p-2 md:p-6 animate-in fade-in duration-500">
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
