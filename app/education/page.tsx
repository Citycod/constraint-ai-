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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Adaptive Learning Quiz
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test your knowledge with difficulty that adapts to your performance
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Adaptive Difficulty
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Questions adjust based on your answers
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Real-Time Scoring
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your progress throughout the quiz
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Offline-First
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn without internet connection
            </p>
          </div>
        </div>

        {/* Quiz Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Choose a Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUIZ_CATEGORIES.map((category) => (
              <form key={category} action={handleStartQuiz}>
                <input type="hidden" name="category" value={category} />
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full py-6 text-base font-semibold hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">
                      {category === 'Science'
                        ? '🔬'
                        : category === 'History'
                          ? '📚'
                          : category === 'Literature'
                            ? '✍️'
                            : '🔢'}
                    </span>
                    <span>{category}</span>
                  </div>
                </Button>
              </form>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How Adaptive Learning Works
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="font-bold text-purple-600 dark:text-purple-300">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Start at Medium Difficulty
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every quiz begins with moderate questions to assess your level
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="font-bold text-purple-600 dark:text-purple-300">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Real-Time Adjustment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get 2 questions correct and difficulty increases; miss 2 and it decreases
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="font-bold text-purple-600 dark:text-purple-300">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Personalized Challenge
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You&apos;ll always be at the edge of your knowledge, optimizing learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
