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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/education"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium mb-4 inline-block"
          >
            ← Back to Categories
          </a>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
            Quiz
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <Suspense fallback={<div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading quiz...</div>}>
            <QuizContent quizId={quizId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
