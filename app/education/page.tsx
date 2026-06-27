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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6 drop-shadow-sm">
            Adaptive Learning Quiz
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Test your knowledge with an intelligent system that adapts its difficulty to your performance in real-time.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-xl text-white mb-2">
              Adaptive Difficulty
            </h3>
            <p className="text-gray-300">
              Questions adjust intelligently based on your answers
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-bold text-xl text-white mb-2">
              Real-Time Scoring
            </h3>
            <p className="text-gray-300">
              Track your progress and performance instantly throughout the quiz
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-xl text-white mb-2">
              Offline-First
            </h3>
            <p className="text-gray-300">
              Keep learning anywhere, even without an internet connection
            </p>
          </div>
        </div>

        {/* Quiz Categories */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Choose Your Challenge
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUIZ_CATEGORIES.map((category) => (
              <form key={category} action={handleStartQuiz}>
                <input type="hidden" name="category" value={category} />
                <button
                  type="submit"
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-8 text-lg font-bold text-white hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl drop-shadow-md">
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
        <div className="mt-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 animate-in fade-in duration-700 delay-500 fill-mode-both">
          <h2 className="text-2xl font-bold text-white mb-8">
            How Adaptive Learning Works
          </h2>
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center">
                <span className="font-bold text-blue-300">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">
                  Start at Medium Difficulty
                </h3>
                <p className="text-gray-400">
                  Every quiz begins with moderate questions to assess your baseline knowledge.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center">
                <span className="font-bold text-purple-300">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">
                  Real-Time Adjustment
                </h3>
                <p className="text-gray-400">
                  Get 2 questions correct and the difficulty increases. Miss 2 and it decreases to keep you engaged.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400/50 flex items-center justify-center">
                <span className="font-bold text-pink-300">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">
                  Personalized Challenge
                </h3>
                <p className="text-gray-400">
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
