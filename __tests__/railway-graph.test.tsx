import { describe, test, expect } from '@jest/globals'

// Test data - these should match the data in railway-graph.tsx
import { upperCVSequence_part1, upperCVSequence_part2, lowerCVSequence_part1, lowerCVSequence_part2 } from '../lib/data/railway-data'

describe('Railway Graph CV Sequences', () => {
  test('all CVs in upperCVSequence_part1 have an ID', () => {
    upperCVSequence_part1.forEach(cv => {
      expect(cv.id).toBeDefined()
      expect(typeof cv.id).toBe('string')
      expect(cv.id.length).toBeGreaterThan(0)
    })
  })

  test('all CVs in upperCVSequence_part2 have an ID', () => {
    upperCVSequence_part2.forEach(cv => {
      expect(cv.id).toBeDefined()
      expect(typeof cv.id).toBe('string')
      expect(cv.id.length).toBeGreaterThan(0)
    })
  })

  test('all CVs in lowerCVSequence_part1 have an ID', () => {
    lowerCVSequence_part1.forEach(cv => {
      expect(cv.id).toBeDefined()
      expect(typeof cv.id).toBe('string')
      expect(cv.id.length).toBeGreaterThan(0)
    })
  })

  test('all CVs in lowerCVSequence_part2 have an ID', () => {
    lowerCVSequence_part2.forEach(cv => {
      expect(cv.id).toBeDefined()
      expect(typeof cv.id).toBe('string')
      expect(cv.id.length).toBeGreaterThan(0)
    })
  })

  test('all CVs follow the correct ID pattern', () => {
    const cvPattern = /^CV[A-Z0-9]+$/
    const allSequences = [
      ...upperCVSequence_part1,
      ...upperCVSequence_part2,
      ...lowerCVSequence_part1,
      ...lowerCVSequence_part2
    ]

    allSequences.forEach(cv => {
      expect(cv.id).toMatch(cvPattern)
    })
  })

  test('all CVs have unique IDs', () => {
    const allSequences = [
      ...upperCVSequence_part1,
      ...upperCVSequence_part2,
      ...lowerCVSequence_part1,
      ...lowerCVSequence_part2
    ]

    const ids = allSequences.map(cv => cv.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })
}) 