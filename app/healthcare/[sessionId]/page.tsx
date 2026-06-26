import { TriageFlow } from '@/components/triage/TriageFlow'

interface HealthcareSessionPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function HealthcareSessionPage({ params }: HealthcareSessionPageProps) {
  const { sessionId } = await params

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/healthcare"
            className="text-blue-600 hover:underline text-sm font-medium mb-4 inline-block"
          >
            ← Back to Healthcare
          </a>
          <h1 className="text-3xl font-bold text-black">
            Symptom Assessment
          </h1>
        </div>

        {/* Main Content */}
        <TriageFlow sessionId={sessionId} />
      </div>
    </div>
  )
}
