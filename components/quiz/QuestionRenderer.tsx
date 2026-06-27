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
  easy: 'bg-green-500/20 text-green-300 border border-green-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  hard: 'bg-red-500/20 text-red-300 border border-red-500/30',
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
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 shadow-inner">
        <p className="text-xl font-bold text-white leading-relaxed">
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
            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
              selectedOption === option
                ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] transform scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedOption === option
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-white/30'
                }`}
              >
                {selectedOption === option && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-lg font-medium text-gray-100">
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
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 text-lg py-6 mt-4"
        size="lg"
      >
        {loading ? 'Loading next question...' : 'Submit Answer'}
      </Button>
    </div>
  )
}
