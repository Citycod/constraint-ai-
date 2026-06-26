'use client'

import { Suspense } from 'react'
import { QuizFlow } from '@/components/quiz/QuizFlow'
import { useSearchParams } from 'next/navigation'

function QuizContent({ quizId }: { quizId: string }) {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || undefined

  return <QuizFlow quizId={quizId} category={category || undefined} />
}

export default async function EducationQuizPage({
  params,
}: {
  params: Promise<{
    quizId: string
  }>
}) {
  const { quizId } = await params

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/education"
            className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium mb-4 inline-block"
          >
            ← Back to Categories
          </a>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quiz
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <Suspense fallback={<div>Loading quiz...</div>}>
            <QuizContent quizId={quizId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
