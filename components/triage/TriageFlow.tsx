'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SymptomSelector, SYMPTOMS } from './SymptomSelector'
import { SeverityDisplay } from './SeverityDisplay'
import type { TriageResponse } from '@/app/api/triage/route'

type Step = 'symptoms' | 'demographics' | 'result'

interface TriageFlowProps {
  sessionId: string
}

export function TriageFlow({ sessionId }: TriageFlowProps) {
  const [step, setStep] = useState<Step>('symptoms')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [age, setAge] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TriageResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSymptomChange = (newSymptoms: string[]) => {
    setSymptoms(newSymptoms)
  }

  const handleNextStep = async () => {
    if (step === 'symptoms') {
      if (symptoms.length === 0) {
        setError('Please select at least one symptom')
        return
      }
      setError(null)
      setStep('demographics')
    } else if (step === 'demographics') {
      setError(null)
      setLoading(true)

      try {
        const response = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symptoms,
            age: age ? parseInt(age) : undefined,
            duration: duration ? parseInt(duration) : undefined,
          }),
        })

        if (!response.ok) {
          throw new Error('Triage assessment failed')
        }

        const data: TriageResponse = await response.json()
        setResult(data)
        setStep('result')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleReset = () => {
    setStep('symptoms')
    setSymptoms([])
    setAge('')
    setDuration('')
    setResult(null)
    setError(null)
    setCopied(false)
  }

  const handleCopyResults = () => {
    if (!result) return
    const symptomLabels = symptoms.map(
      (id) => SYMPTOMS.find((s) => s.id === id)?.label || id
    )
    
    const text = `Symptom Assessment Results
--------------------------
Symptoms: ${symptomLabels.join(', ')}
${age ? `Age: ${age}\n` : ''}${duration ? `Duration: ${duration} hours\n` : ''}
Assessment: ${result.severity.toUpperCase()}
Recommendation: ${result.recommendation}
Reasoning: ${result.reason}
--------------------------
*Note: This is an automated assessment and does not constitute medical advice.*`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className={`text-sm ${step === 'symptoms' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>1. Symptoms</span>
          <span className={`text-sm ${step === 'demographics' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>2. Details</span>
          <span className={`text-sm ${step === 'result' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>3. Result</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: step === 'symptoms' ? '33%' : step === 'demographics' ? '66%' : '100%' }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div key={step} className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {step === 'symptoms' && (
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">What symptoms are you experiencing?</h2>
            <SymptomSelector
              selected={symptoms}
              onChange={handleSymptomChange}
              disabled={loading}
            />
          </div>
        )}

        {step === 'demographics' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black mb-4">Additional Information</h2>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Age (optional)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500"
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Duration of symptoms (hours, optional)
              </label>
              <input
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500"
                placeholder="e.g., 24"
              />
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black mb-4">Assessment Result</h2>
            <SeverityDisplay
              severity={result.severity}
              recommendation={result.recommendation}
              reason={result.reason}
              evaluationTime={result.evaluationTime}
              symptoms={symptoms.map(id => SYMPTOMS.find(s => s.id === id)?.label || id)}
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6 text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-between">
        {step !== 'symptoms' && (
          <Button variant="outline" onClick={() => setStep(step === 'demographics' ? 'symptoms' : 'symptoms')}>
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step === 'result' ? (
          <div className="flex gap-3">
            <Button onClick={handleCopyResults} variant="outline">
              {copied ? 'Copied!' : 'Copy Results'}
            </Button>
            <Button onClick={handleReset} variant="default">
              Start Over
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleNextStep}
            disabled={loading || (step === 'symptoms' && symptoms.length === 0)}
          >
            {loading ? 'Assessing...' : step === 'demographics' ? 'Get Assessment' : 'Next'}
          </Button>
        )}
      </div>

      {/* Session ID Display */}
      <div className="mt-6 text-xs text-black text-center">Session ID: {sessionId}</div>
    </div>
  )
}
