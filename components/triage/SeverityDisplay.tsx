'use client'

interface SeverityDisplayProps {
  severity: 'urgent' | 'moderate' | 'mild'
  recommendation: string
  reason: string
  evaluationTime: number
  symptoms: string[]
}

const SEVERITY_CONFIG = {
  urgent: {
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-900',
    label: 'URGENT',
    icon: '🚨',
    description: 'Immediate medical attention required',
  },
  moderate: {
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-900',
    label: 'MODERATE',
    icon: '⚠️',
    description: 'Medical attention recommended soon',
  },
  mild: {
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-900',
    label: 'MILD',
    icon: '✓',
    description: 'Monitor and rest',
  },
}

export function SeverityDisplay({
  severity,
  recommendation,
  reason,
  evaluationTime,
  symptoms,
}: SeverityDisplayProps) {
  const config = SEVERITY_CONFIG[severity]

  return (
    <div className={`rounded-lg border-2 p-6 ${config.color}`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{config.icon}</div>
        <div className="flex-1">
          <div className={`text-sm font-bold uppercase tracking-wide ${config.textColor}`}>
            {config.label}
          </div>
          <p className={`text-sm mb-2 ${config.textColor}`}>{config.description}</p>

          <div className={`p-4 rounded-md bg-white mt-4 mb-4 ${config.textColor}`}>
            <p className="font-semibold mb-2">Recommendation:</p>
            <p className="text-sm leading-relaxed">{recommendation}</p>
          </div>

          <details className="text-xs">
            <summary className={`cursor-pointer font-semibold ${config.textColor}`}>Details</summary>
            <div className={`mt-2 pl-4 border-l-2 border-current opacity-75 ${config.textColor}`}>
              <p className="mb-1">
                <strong>Symptoms Analyzed:</strong> {symptoms.join(', ')}
              </p>
              <p className="mb-1">
                <strong>Rule Triggered:</strong> {reason}
              </p>
              <p>
                <strong>Evaluation Time:</strong> {evaluationTime.toFixed(2)}ms
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
