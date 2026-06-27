'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface QuestionRendererProps {
  question: string
  options: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  onSubmit: (selectedOption: string) => void
  loading?: boolean
}

const DIFFICULTY_COLOR = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
}

export function QuestionRenderer({
  question,
  options,
  difficulty,
  onSubmit,
  loading = false,
}: QuestionRendererProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSubmit(selectedOption)
      setSelectedOption(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Difficulty Badge */}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${DIFFICULTY_COLOR[difficulty]}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
        </span>
      </div>

      {/* Question */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
        <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !loading && setSelectedOption(option)}
            disabled={loading}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedOption === option
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedOption === option
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedOption === option && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-base font-medium text-slate-900 dark:text-white">
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={selectedOption === null || loading}
        className="w-full mt-4"
        size="lg"
      >
        {loading ? 'Loading next question...' : 'Submit Answer'}
      </Button>
    </div>
  )
}
