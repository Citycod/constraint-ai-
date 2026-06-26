import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function HealthcarePage() {
  const handleStartTriage = async () => {
    'use server'
    const sessionId = `triage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    redirect(`/healthcare/${sessionId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Healthcare Triage System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Quick symptom assessment to help determine the urgency of medical attention needed
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🏥</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Evidence-Based
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Assessment based on established medical guidelines
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Offline-First
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Works without internet connection
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Educational
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn about symptom severity levels
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400 p-6 mb-8 rounded">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Important Disclaimer
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This system is for educational purposes only and does not provide medical advice. 
            For any suspected medical emergency, always call emergency services (911 in the US) 
            or go to the nearest emergency room immediately.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <form action={handleStartTriage}>
            <Button type="submit" size="lg" className="px-8 py-3">
              Start Symptom Assessment
            </Button>
          </form>
        </div>

        {/* Features */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Select Your Symptoms
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose all symptoms you are currently experiencing
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="font-bold text-blue-600 dark:text-blue-300">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Provide Details
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optionally share your age and how long you&apos;ve had symptoms
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="font-bold text-blue-600 dark:text-blue-300">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Get Assessment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive guidance on urgency and recommended next steps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
