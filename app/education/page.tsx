import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QUIZ_CATEGORIES } from '@/lib/quiz-data'

export default function EducationPage() {
  const handleStartQuiz = async (formData: FormData) => {
    'use server'
    const category = formData.get('category') as string
    const quizId = `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    redirect(`/education/${quizId}?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">
            Adaptive Learning Quiz
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Test your knowledge with an intelligent system that adapts its difficulty to your performance in real-time.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
              Adaptive Difficulty
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Questions adjust intelligently based on your answers
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
              Real-Time Scoring
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Track your progress and performance instantly throughout the quiz
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
              Offline-First
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Keep learning anywhere, even without an internet connection
            </p>
          </div>
        </div>

        {/* Quiz Categories */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Choose Your Challenge
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUIZ_CATEGORIES.map((category) => (
              <form key={category} action={handleStartQuiz}>
                <input type="hidden" name="category" value={category} />
                <button
                  type="submit"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-8 text-lg font-bold text-slate-900 dark:text-white hover:border-blue-500 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {category === 'Science'
                        ? '🔬'
                        : category === 'History'
                          ? '🏛️'
                          : category === 'Literature'
                            ? '📚'
                            : '🔢'}
                    </span>
                    <span className="tracking-wide">{category}</span>
                  </div>
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-sm animate-in fade-in duration-700 delay-500 fill-mode-both">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            How Adaptive Learning Works
          </h2>
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                  Start at Medium Difficulty
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Every quiz begins with moderate questions to assess your baseline knowledge.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                  Real-Time Adjustment
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Get 2 questions correct and the difficulty increases. Miss 2 and it decreases to keep you engaged.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                  Personalized Challenge
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  You&apos;ll always be at the edge of your knowledge, optimizing your learning curve perfectly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
