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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/education"
            className="text-purple-300 hover:text-white transition-colors text-sm font-medium mb-4 inline-block"
          >
            ← Back to Categories
          </a>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Quiz
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <Suspense fallback={<div className="text-center py-10 text-purple-200">Loading quiz...</div>}>
            <QuizContent quizId={quizId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
