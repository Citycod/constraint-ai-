import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edge AI System
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Phase 1 MVP
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Offline-First AI System
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Rule-based decision engines optimized for edge devices. Quick, reliable, and designed to work without internet.
        </p>

        {/* Pilot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Healthcare Pilot */}
          <Link href="/healthcare">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-5xl mb-4">🏥</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Healthcare Triage
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Symptom-based severity assessment using decision trees. Get immediate guidance on medical urgency.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 text-left">
                <p>✓ Evidence-based rules</p>
                <p>✓ Offline capable</p>
                <p>✓ &lt;50ms evaluation</p>
              </div>
              <Button className="w-full">Start Assessment</Button>
            </div>
          </Link>

          {/* Education Pilot */}
          <Link href="/education">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Adaptive Quiz
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Difficulty adjusts based on your performance. Learn at the optimal challenge level.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 text-left">
                <p>✓ Adaptive difficulty</p>
                <p>✓ Multiple categories</p>
                <p>✓ Real-time scoring</p>
              </div>
              <Button className="w-full">Start Quiz</Button>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Built for Edge Constraints
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Performance
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sub-100ms decisions optimized for low-end phones, edge devices, and Raspberry Pi
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Offline-First
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All computation happens on-device with optional server sync when connected
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">📊</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Measurable
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track Core Web Vitals and custom metrics across constraint profiles
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p className="mb-4">Built with:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">Next.js 16</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">TypeScript</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">IndexedDB</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">Custom Rules Engine</span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">PWA</span>
          </div>
        </div>
      </div>
    </main>
  )
}
