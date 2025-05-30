import { describe, test, expect } from '@jest/globals'
import fetch from 'node-fetch'

// Import the CV sequences from the railway-graph test
import {
  upperCVSequence_part1,
  upperCVSequence_part2,
  lowerCVSequence_part1,
  lowerCVSequence_part2
} from '../lib/data/railway-data'

interface RailwayData {
  "Fecha Inicio:": string
  "Fecha Fin:": string
  "Horario:": string
  "Mantenedor:": string
  "Tipo MEX:": string
  "Ubicación:": string
  "Catenaria Desenergizada:": string[]
  "Catenaria Neutra:": string[]
  "CV": string[]
  "Agujas:": string[]
  "Señales:": string[]
  "Tramos de Vía": string[]
  "Superior Altura Hombre: ": string
  "Trenes: ": string[]
  "Sistema Trenes: ": string[]
  "Vía trabajo tren: ": string
  "Estaciones: ": string[]
  "Desen. Estación": string
  "Sistema Estaciones: ": string[]
  "Desen. Cuarto": string
  "Pozos: ": string[]
  "Desen. Pozo": string
  "Sistema Pozos: ": string[]
  "Desen. Sistema": string
  "Detalle trabajos": string
}

describe('API CV Validation', () => {
  test('all CVs from API exist in our defined sequences', async () => {
    // Fetch data from API
    const response = await fetch('https://mimico.onrender.com/datos')
    const data: RailwayData[] = await response.json()

    // Collect all CVs from API data
    const apiCVs = new Set<string>()
    data.forEach(record => {
      record.CV.forEach(cv => apiCVs.add(cv))
    })

    // Collect all CVs from our sequences
    const sequenceCVs = new Set<string>()
    const allSequences = [
      ...upperCVSequence_part1,
      ...upperCVSequence_part2,
      ...lowerCVSequence_part1,
      ...lowerCVSequence_part2
    ]
    allSequences.forEach(cv => sequenceCVs.add(cv.id))

    // Check if all API CVs exist in our sequences
    const missingCVs = Array.from(apiCVs).filter(cv => !sequenceCVs.has(cv))
    
    if (missingCVs.length > 0) {
      console.log('Missing CVs:', missingCVs)
    }
    
    expect(missingCVs.length).toBe(0)
  })

  test('all CVs from API follow the correct pattern', async () => {
    const response = await fetch('https://mimico.onrender.com/datos')
    const data: RailwayData[] = await response.json()

    const cvPattern = /^CV[A-Z0-9]+$/
    const invalidCVs: string[] = []

    data.forEach(record => {
      record.CV.forEach(cv => {
        if (!cvPattern.test(cv)) {
          invalidCVs.push(cv)
        }
      })
    })

    if (invalidCVs.length > 0) {
      console.log('Invalid CVs:', invalidCVs)
    }

    expect(invalidCVs.length).toBe(0)
  })
}) 