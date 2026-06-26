/**
 * Quiz Data and Question Bank
 * Organized by category and difficulty level
 */

export interface Question {
  id: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: string[]
  correctAnswerIndex: number
  explanation: string
}

export const QUIZ_QUESTIONS: Question[] = [
  // Science - Easy
  {
    id: 'sci-easy-1',
    category: 'Science',
    difficulty: 'easy',
    question: 'What is the smallest unit of life?',
    options: ['Atom', 'Cell', 'Molecule', 'Organism'],
    correctAnswerIndex: 1,
    explanation: 'The cell is the basic unit of life, capable of independent functioning.',
  },
  {
    id: 'sci-easy-2',
    category: 'Science',
    difficulty: 'easy',
    question: 'What gas do plants absorb from the atmosphere?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    correctAnswerIndex: 2,
    explanation:
      'Plants absorb carbon dioxide during photosynthesis and release oxygen as a byproduct.',
  },
  {
    id: 'sci-easy-3',
    category: 'Science',
    difficulty: 'easy',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswerIndex: 1,
    explanation: 'Mars is called the Red Planet due to iron oxide on its surface.',
  },

  // Science - Medium
  {
    id: 'sci-med-1',
    category: 'Science',
    difficulty: 'medium',
    question: 'What is the process by which water changes from liquid to gas?',
    options: ['Condensation', 'Evaporation', 'Sublimation', 'Freezing'],
    correctAnswerIndex: 1,
    explanation: 'Evaporation is the transformation of water from liquid to vapor state.',
  },
  {
    id: 'sci-med-2',
    category: 'Science',
    difficulty: 'medium',
    question: 'Which scientist developed the theory of evolution?',
    options: ['Isaac Newton', 'Charles Darwin', 'Albert Einstein', 'Marie Curie'],
    correctAnswerIndex: 1,
    explanation: 'Charles Darwin developed the theory of natural selection and evolution.',
  },

  // Science - Hard
  {
    id: 'sci-hard-1',
    category: 'Science',
    difficulty: 'hard',
    question: 'What is the name of the process by which plants convert light energy to chemical energy?',
    options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Oxidation'],
    correctAnswerIndex: 1,
    explanation:
      'Photosynthesis uses light energy, water, and carbon dioxide to produce glucose and oxygen.',
  },

  // History - Easy
  {
    id: 'hist-easy-1',
    category: 'History',
    difficulty: 'easy',
    question: 'In what year did Christopher Columbus arrive in the Americas?',
    options: ['1490', '1491', '1492', '1493'],
    correctAnswerIndex: 2,
    explanation: 'Columbus arrived in 1492, marking the beginning of European exploration.',
  },
  {
    id: 'hist-easy-2',
    category: 'History',
    difficulty: 'easy',
    question: 'Which country did France ally with during the American Revolution?',
    options: ['Spain', 'Britain', 'America', 'Netherlands'],
    correctAnswerIndex: 2,
    explanation: 'France supported the American colonies against British rule.',
  },

  // History - Medium
  {
    id: 'hist-med-1',
    category: 'History',
    difficulty: 'medium',
    question: 'Which empire fell in 1453 with the fall of Constantinople?',
    options: ['Roman Empire', 'Byzantine Empire', 'Ottoman Empire', 'Persian Empire'],
    correctAnswerIndex: 1,
    explanation: 'The Byzantine Empire ended with the Ottoman conquest of Constantinople.',
  },

  // Literature - Easy
  {
    id: 'lit-easy-1',
    category: 'Literature',
    difficulty: 'easy',
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Jane Austen', 'William Shakespeare', 'Charles Dickens', 'Mark Twain'],
    correctAnswerIndex: 1,
    explanation: 'William Shakespeare wrote this famous tragedy about two star-crossed lovers.',
  },
  {
    id: 'lit-easy-2',
    category: 'Literature',
    difficulty: 'easy',
    question: 'What is the first book in the Harry Potter series?',
    options: [
      "Harry Potter and the Chamber of Secrets",
      "Harry Potter and the Philosopher's Stone",
      'Harry Potter and the Prisoner of Azkaban',
      'Harry Potter and the Goblet of Fire',
    ],
    correctAnswerIndex: 1,
    explanation: "The Philosopher's Stone (or Sorcerer's Stone in the US) is the first book.",
  },

  // Literature - Medium
  {
    id: 'lit-med-1',
    category: 'Literature',
    difficulty: 'medium',
    question: 'Who is the narrator of "The Great Gatsby"?',
    options: ['Jay Gatsby', 'Nick Carraway', 'Daisy Buchanan', 'Tom Buchanan'],
    correctAnswerIndex: 1,
    explanation: 'Nick Carraway narrates the story from his perspective.',
  },

  // Math - Easy
  {
    id: 'math-easy-1',
    category: 'Math',
    difficulty: 'easy',
    question: 'What is 7 × 8?',
    options: ['54', '55', '56', '57'],
    correctAnswerIndex: 2,
    explanation: '7 times 8 equals 56.',
  },
  {
    id: 'math-easy-2',
    category: 'Math',
    difficulty: 'easy',
    question: 'What is 25% of 100?',
    options: ['10', '20', '25', '50'],
    correctAnswerIndex: 2,
    explanation: '25% means one quarter, so 25% of 100 is 25.',
  },

  // Math - Medium
  {
    id: 'math-med-1',
    category: 'Math',
    difficulty: 'medium',
    question: 'What is the square root of 144?',
    options: ['10', '11', '12', '13'],
    correctAnswerIndex: 2,
    explanation: '12 × 12 = 144, so the square root of 144 is 12.',
  },

  // Math - Hard
  {
    id: 'math-hard-1',
    category: 'Math',
    difficulty: 'hard',
    question: 'If x² + 4x + 4 = 0, what is the value of x?',
    options: ['-2', '0', '2', '4'],
    correctAnswerIndex: 0,
    explanation: 'x² + 4x + 4 = (x + 2)² = 0, so x = -2.',
  },
]

export const QUIZ_CATEGORIES = Array.from(
  new Set(QUIZ_QUESTIONS.map((q) => q.category))
).sort()

/**
 * Get questions by difficulty
 */
export function getQuestionsByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): Question[] {
  return QUIZ_QUESTIONS.filter((q) => q.difficulty === difficulty)
}

/**
 * Get questions by category
 */
export function getQuestionsByCategory(category: string): Question[] {
  return QUIZ_QUESTIONS.filter((q) => q.category === category)
}

/**
 * Get random question
 */
export function getRandomQuestion(
  category?: string,
  difficulty?: 'easy' | 'medium' | 'hard'
): Question | null {
  let questions = QUIZ_QUESTIONS

  if (category) {
    questions = questions.filter((q) => q.category === category)
  }

  if (difficulty) {
    questions = questions.filter((q) => q.difficulty === difficulty)
  }

  if (questions.length === 0) return null

  return questions[Math.floor(Math.random() * questions.length)]
}

/**
 * Get random questions (excluding provided IDs)
 */
export function getRandomQuestions(
  count: number,
  excludeIds: string[] = [],
  category?: string,
  difficulty?: 'easy' | 'medium' | 'hard'
): Question[] {
  let questions = QUIZ_QUESTIONS.filter((q) => !excludeIds.includes(q.id))

  if (category) {
    questions = questions.filter((q) => q.category === category)
  }

  if (difficulty) {
    questions = questions.filter((q) => q.difficulty === difficulty)
  }

  const selected: Question[] = []
  while (selected.length < count && questions.length > 0) {
    const idx = Math.floor(Math.random() * questions.length)
    selected.push(questions[idx])
    questions.splice(idx, 1)
  }

  return selected
}
