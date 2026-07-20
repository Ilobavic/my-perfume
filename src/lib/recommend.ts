import type {
  Mood,
  Occasion,
  Perfume,
  RecommendInput,
  ScoredPerfume,
  Weather,
} from '../types'
import { daysSince } from './storage'

function matchesWeather(bottle: Perfume, weather: Weather): boolean {
  return bottle.weather.includes('any') || bottle.weather.includes(weather)
}

function matchesOccasion(bottle: Perfume, occasion: Occasion): boolean {
  return bottle.occasion.includes(occasion)
}

export function matchesHardFilters(
  bottle: Perfume,
  weather: Weather,
  occasion: Occasion,
): boolean {
  return matchesWeather(bottle, weather) && matchesOccasion(bottle, occasion)
}

function rotationBonus(bottle: Perfume): { points: number; reason: string | null } {
  const days = daysSince(bottle.lastWorn)
  if (days === null) {
    return { points: 25, reason: 'not worn yet' }
  }
  if (days >= 30) {
    return { points: 20, reason: `hasn't worn in ${days} days` }
  }
  if (days >= 14) {
    return { points: 12, reason: `last worn ${days} days ago` }
  }
  if (days >= 7) {
    return { points: 6, reason: `last worn ${days} days ago` }
  }
  if (days === 0) {
    return { points: -15, reason: 'already worn today' }
  }
  return { points: 0, reason: null }
}

function moodScore(bottle: Perfume, mood: Mood): { points: number; reason: string | null } {
  if (bottle.mood.includes(mood)) {
    return { points: 40, reason: `matches ${mood}` }
  }
  return { points: 0, reason: null }
}

function timeOfDayNudge(bottle: Perfume): number {
  const hour = new Date().getHours()
  const isEvening = hour >= 17 || hour < 5
  if (isEvening && bottle.timeOfDay.includes('evening')) return 5
  if (!isEvening && bottle.timeOfDay.includes('day')) return 5
  return 0
}

function weatherSweetnessNudge(bottle: Perfume, weather: Weather): number {
  if ((weather === 'hot' || weather === 'humid') && bottle.sweetness >= 4) {
    return -5
  }
  if ((weather === 'cold' || weather === 'cool') && bottle.sweetness >= 4) {
    return 3
  }
  return 0
}

function explain(
  bottle: Perfume,
  mood: Mood,
  weather: Weather,
): string[] {
  const reasons: string[] = []
  const moodResult = moodScore(bottle, mood)
  if (moodResult.reason) reasons.push(moodResult.reason)

  const rot = rotationBonus(bottle)
  if (rot.reason) reasons.push(rot.reason)

  if (bottle.weather.includes('any')) {
    reasons.push('works in any weather')
  } else {
    reasons.push(`fits ${weather} weather`)
  }

  if (bottle.sillage === 'heavy' || bottle.sillage === 'strong') {
    reasons.push('strong presence')
  }

  return reasons
}

export function computeScore(bottle: Perfume, input: RecommendInput): number {
  let score = 0
  score += moodScore(bottle, input.mood).points
  score += rotationBonus(bottle).points
  score += timeOfDayNudge(bottle)
  score += weatherSweetnessNudge(bottle, input.weather)

  if (bottle.longevityHours != null && bottle.longevityHours >= 10) {
    score += 3
  }

  return score
}

export function recommend(
  bottles: Perfume[],
  input: RecommendInput,
  limit = 3,
): ScoredPerfume[] {
  return bottles
    .filter((b) => matchesHardFilters(b, input.weather, input.occasion))
    .map((b) => ({
      ...b,
      score: computeScore(b, input),
      reasons: explain(b, input.mood, input.weather),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
}
