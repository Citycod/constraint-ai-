'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SymptomSelectorProps {
  selected: string[]
  onChange: (symptoms: string[]) => void
  disabled?: boolean
}

export const SYMPTOMS = [
  // General & Respiratory
  { id: 'fever', label: 'Fever', category: 'General' },
  { id: 'high_fever', label: 'High Fever (103+°F)', category: 'General' },
  { id: 'minor_ache', label: 'Minor Ache', category: 'General' },
  { id: 'mild_cough', label: 'Mild Cough', category: 'Respiratory' },
  { id: 'cough', label: 'Severe Cough', category: 'Respiratory' },
  { id: 'sore_throat', label: 'Sore Throat', category: 'Respiratory' },
  { id: 'runny_nose', label: 'Runny Nose', category: 'Respiratory' },
  { id: 'sneezing', label: 'Sneezing', category: 'Respiratory' },
  
  // Gastrointestinal
  { id: 'nausea', label: 'Nausea', category: 'Gastrointestinal' },
  { id: 'diarrhea', label: 'Diarrhea', category: 'Gastrointestinal' },
  { id: 'abdominal_cramping', label: 'Abdominal Cramping', category: 'Gastrointestinal' },
  { id: 'bloody_stool', label: 'Bloody Stool', category: 'Gastrointestinal (Critical)' },
  { id: 'persistent_vomiting', label: 'Persistent Vomiting', category: 'Gastrointestinal' },
  
  // Neurological/Head
  { id: 'dizziness', label: 'Dizziness', category: 'Neurological' },
  { id: 'severe_headache', label: 'Severe Headache', category: 'Neurological' },
  { id: 'blurred_vision', label: 'Blurred Vision', category: 'Neurological' },
  { id: 'sudden_numbness_weakness', label: 'Sudden Numbness/Weakness', category: 'Neurological (Critical)' },
  { id: 'confusion', label: 'Confusion', category: 'Neurological' },
  { id: 'loss_consciousness', label: 'Loss of Consciousness', category: 'Neurological (Critical)' },
  { id: 'difficulty_speaking', label: 'Difficulty Speaking', category: 'Neurological (Critical)' },
  
  // Skin/Allergy
  { id: 'new_rash', label: 'New Rash', category: 'Skin/Allergy' },
  { id: 'severe_itching', label: 'Severe Itching', category: 'Skin/Allergy' },
  { id: 'swelling_face_lips', label: 'Swelling of Face/Lips', category: 'Skin/Allergy (Critical)' },
  
  // Musculoskeletal
  { id: 'joint_pain', label: 'Joint Pain', category: 'Musculoskeletal' },
  { id: 'muscle_weakness', label: 'Muscle Weakness', category: 'Musculoskeletal' },
  { id: 'severe_pain', label: 'Severe Pain', category: 'Musculoskeletal' },

  // Other Critical
  { id: 'chest_pain', label: 'Chest Pain', category: 'Critical' },
  { id: 'severe_shortness_breath', label: 'Severe Shortness of Breath', category: 'Critical' },
  { id: 'severe_bleeding', label: 'Severe Bleeding', category: 'Critical' },
]

export function SymptomSelector({
  selected,
  onChange,
  disabled = false,
}: SymptomSelectorProps) {
  const toggleSymptom = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const [searchQuery, setSearchQuery] = useState('')

  const categories = Array.from(new Set(SYMPTOMS.map((s) => s.category)))
  
  const filteredCategories = categories.map(category => {
    return {
      category,
      symptoms: SYMPTOMS.filter(s => 
        s.category === category && 
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
  }).filter(c => c.symptoms.length > 0)

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search symptoms (e.g. fever, cough)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {filteredCategories.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No symptoms match your search.</p>
      ) : (
        filteredCategories.map(({ category, symptoms: categorySymptoms }) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-black mb-3">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categorySymptoms.map((symptom) => (
                <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                disabled={disabled}
                className={`p-3 text-left rounded-md border-2 transition-all ${
                  selected.includes(symptom.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      selected.includes(symptom.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selected.includes(symptom.id) && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-black">{symptom.label}</span>
                </div>
              </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
