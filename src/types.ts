export type Sillage = 'light' | 'moderate' | 'heavy' | 'strong'

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'any'
export type Weather = 'hot' | 'humid' | 'cool' | 'cold' | 'any'
export type TimeOfDay = 'day' | 'evening'
export type Occasion =
  | 'casual'
  | 'date'
  | 'formal'
  | 'statement'
  | 'work'
  | 'semi-formal'
  | 'playful'
export type Mood =
  | 'confident'
  | 'sexy'
  | 'cozy'
  | 'sharp'
  | 'fresh'
  | 'playful'

export interface PerfumeNotes {
  top: string[]
  heart: string[]
  base: string[]
}

export interface Perfume {
  id: string
  name: string
  house: string
  concentration: string
  bottleSizeMl: number | null
  mlRemaining: number | null
  family: string
  notes: PerfumeNotes
  sillage: Sillage
  longevityHours: number | null
  sweetness: number
  season: Season[]
  weather: Weather[]
  timeOfDay: TimeOfDay[]
  occasion: Occasion[]
  mood: Mood[]
  lastWorn: string | null
  wearCount: number
  rating: number | null
  notesText: string
}

export interface RecommendInput {
  weather: Weather
  occasion: Occasion
  mood: Mood
}

export interface ScoredPerfume extends Perfume {
  score: number
  reasons: string[]
}

export type View =
  | { name: 'today' }
  | { name: 'catalog' }
  | { name: 'detail'; id: string }
  | { name: 'form'; id?: string }
  | { name: 'insights' }
