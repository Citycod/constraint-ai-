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
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
        <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
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
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedOption === option
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {selectedOption === option && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-base font-medium text-gray-900 dark:text-white">
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
        className="w-full"
        size="lg"
      >
        {loading ? 'Loading next question...' : 'Submit Answer'}
      </Button>
    </div>
  )
}
