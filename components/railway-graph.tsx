"use client"

import { useMemo, useState } from "react"

const circuitoViasParteSuperiorY = 275
const circuitoViasParteInferiorY = 400
const altoCatenaria = 15
const altoCircuitoVias = 25
const altoTrack = 7.5
const altoSignal = 20
const trackSuperiorY = 310
const trackInferiorY = 382.5
const catenariaSuperiorY = 332.5
const catenariaInferiorY = 352.5
const switchSuperiorY = 265
const switchInferiorY = 425
const altoSwitch = 10
const signalSuperiorY = 220
const signalSuperiorY2 = 240
const signalInferiorY = 440
const signalInferiorY2 = 460

interface RailwayGraphProps {
  coloredElements: Record<string, string>
  onMouseMove?: (x: number, y: number) => void
}

type LabelPosition = "start" | "center" | "end"

interface Element {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  label?: string
  rotate?: boolean
  labelPosition?: LabelPosition
}

// Track configuration for automatic positioning
interface TrackConfig {
  y: number
  defaultElementWidth: number
  defaultGap: number
  startX: number
}

// Element sequence for positioning
interface SequenceElement {
  id: string
  type: string
  width?: number
  label?: string
  labelPosition?: LabelPosition
  gap?: number // Custom gap after this element
}

interface StationConfig {
  id: string
  x: number
  y: number
  label: string
}

function generateStationWithBlocks(config: StationConfig): Element[] {
  const stationWidth = 75
  const stationHeight = 80
  const blockWidth = 10
  const blockHeight = 100
  const bottomBlockHeight = 10
  const sideBlockWidth = 5
  const sideBlockHeight = 75

  return [
    { 
      id: config.id, 
      type: "station", 
      x: config.x, 
      y: config.y,  
      width: stationWidth, 
      height: stationHeight, 
      label: config.label 
    },
    { 
      id: `${config.id}1`, 
      type: "stationBlock", 
      x: config.x - stationWidth/2, 
      y: config.y, 
      width: blockWidth, 
      height: blockHeight 
    },
    { 
      id: `${config.id}2`, 
      type: "stationBlock", 
      x: config.x - stationWidth/2, 
      y: config.y + blockHeight, 
      width: 7*stationWidth/4 + blockWidth, 
      height: bottomBlockHeight 
    },
    { 
      id: `${config.id}3`, 
      type: "stationBlock", 
      x: config.x + stationWidth + stationWidth/4, 
      y: config.y, 
      width: blockWidth, 
      height: blockHeight 
    },
    //Punta derecha de la estación
    { 
      id: `${config.id}4`, 
      type: "triangleLeft", 
      x: config.x + stationWidth + stationWidth/4, 
      y: config.y - blockHeight/10, 
      width: blockWidth*2, 
      height: blockHeight/10,
    },
    //Punta izquierda de la estación
    { 
      id: `${config.id}5`, 
      type: "triangleRight", 
      x: config.x - stationWidth/2, 
      y: config.y - blockHeight/10, 
      width: blockWidth*2, 
      height: blockHeight/10,
    },
    //Energy
    { 
      id: `${config.id}6`, 
      type: "energyBlock", 
      x: config.x + stationWidth + 10, 
      y: config.y, 
      width: sideBlockWidth, 
      height: sideBlockHeight,
    },
  ]
}

function generatePozosWithBlocks(config: StationConfig): Element[] {
  const stationWidth = 50
  const stationHeight = 80
  const sideBlockWidth = 5
  const sideBlockHeight = 75
  const blockHeight = 100
  const bottomBlockHeight = 10

  return [
    { 
      id: config.id, 
      type: "station", 
      x: config.x, 
      y: config.y,  
      width: stationWidth, 
      height: stationHeight, 
      label: config.label 
    },
    { 
      id: `${config.id}2`, 
      type: "stationBlock", 
      x: config.x, 
      y: config.y + blockHeight, 
      width: stationWidth, 
      height: bottomBlockHeight 
    },
    //Energy
    { 
      id: `${config.id}6`, 
      type: "energyBlock", 
      x: config.x + stationWidth - sideBlockWidth, 
      y: config.y, 
      width: sideBlockWidth, 
      height: sideBlockHeight,
    },
  ]
}

const elementsConfigs = {
  upperCircuitoVias: {
    y: circuitoViasParteSuperiorY,
    defaultElementWidth: 50,
    defaultGap: 5,
    startX: 175
  },
  lowerCircuitoVias: {
    y: circuitoViasParteInferiorY,
    defaultElementWidth: 50,
    defaultGap: 5,
    startX: 175
  },
  upperTrack: {
    y: trackSuperiorY,
    defaultElementWidth: 310,
    defaultGap: 5,
    startX: 175
  },
  lowerTrack: {
    y: trackInferiorY,
    defaultElementWidth: 310,
    defaultGap: 5,
    startX: 175
  },
  upperCatenaria: {
    y: catenariaSuperiorY,
    defaultElementWidth: 310,
    defaultGap: 5,
    startX: 175
  },
  lowerCatenaria: {
    y: catenariaInferiorY,
    defaultElementWidth: 310,
    defaultGap: 5,
    startX: 175
  },
  upperSwitch: {
    y: switchSuperiorY,
    defaultElementWidth: 100,
    defaultGap: 5,
    startX: 175
  },
  lowerSwitch: {
    y: switchInferiorY,
    defaultElementWidth: 100,
    defaultGap: 5,
    startX: 175
  },
  upperSignal: {
    y: signalSuperiorY,
    defaultElementWidth: 5,
    defaultGap: 50,
    startX: 275,
  },
  upperSignal2: {
    y: signalSuperiorY2,
    defaultElementWidth: 5,
    defaultGap: 50,
    startX: 480
  },
  lowerSignal: {
    y: signalInferiorY,
    defaultElementWidth: 5,
    defaultGap: 50,
    startX: 480
  },
  lowerSignal2: {
    y: signalInferiorY2,
    defaultElementWidth: 5,
    defaultGap: 50,
    startX: 480
  }
} as const

function calculatePositions(sequence: SequenceElement[], config: TrackConfig, height: number): Element[] {
  let currentX = config.startX
  
  return sequence.map((seqElement) => {
    const element: Element = {
      id: seqElement.id,
      type: seqElement.type,
      x: currentX,
      y: config.y,
      width: seqElement.width || config.defaultElementWidth,
      height: height,
      label: seqElement.label,
      labelPosition: seqElement.labelPosition
    }
    
    // Update x position for next element
    currentX += element.width + (seqElement.gap || config.defaultGap)
    
    return element
  })
}

// Helper to shift a sequence of elements
function shiftSequence(elements: Element[], startId: string, shiftAmount: number): Element[] {
  let shifting = false
  
  return elements.map(element => {
    // Start shifting when we find the start element
    if (element.id === startId) {
      shifting = true
    }
    
    if (shifting) {
      return {
        ...element,
        x: element.x + shiftAmount
      }
    }
    
    return element
  })
}

function validateElements(elements: Element[]): void {
  // Check for duplicate IDs
  const ids = new Set<string>()
  const labels = new Set<string>()
  
  elements.forEach((element) => {
    // Check for duplicate IDs
    if (ids.has(element.id)) {
      throw new Error(`Duplicate element ID found: ${element.id}`)
    }
    ids.add(element.id)

    // Check for duplicate labels (only if label exists and is not empty)
    // if (element.label && element.label.trim()) {
      // if (labels.has(element.label)) {
        // throw new Error(`Duplicate element label found: ${element.label}`)
      // }
      // labels.add(element.label)
    // }
  })
}

export default function RailwayGraph({ coloredElements, onMouseMove }: RailwayGraphProps) {
  const [showGrid, setShowGrid] = useState(false)
  
  // Define sequences for each track
  const upperCVSequence: SequenceElement[] = useMemo(() => [
    { id: "CV154", type: "block", width: 100, label: "CV154" },
    { id: "CV156", type: "block", width: 205, label: "CV156" },
    { id: "CV158", type: "block", width: 205, label: "CV158" },
    { id: "CV160", type: "block", label: "CV160"}, // Custom gap after CV160
    { id: "CVQU104", type: "block", label: "CVQU104" },
    { id: "CVQU106", type: "block", label: "CVQU106" },
    { id: "CVQU108", type: "block", width: 275, label: "CVQU108" },
    { id: "CVQ102", type: "block", label: "CVQ102" },
    { id: "CVQU110", type: "block", width: 275, label: "CVQU110" },
    { id: "CVQ112", type: "block", label: "CVQ112" },
    { id: "CVQU114", type: "block", label: "CVQU114" },
    { id: "CVQU116", type: "block", label: "CVQU116" },
    { id: "CVQU118", type: "block", label: "CVQU118" },
    { id: "CVQU120", type: "block", label: "CVQU120" },
    { id: "CVQU122", type: "block", label: "CVQU122" },
    { id: "CVQU124", type: "block", label: "CVQU124" },
    { id: "CVQU126", type: "block", label: "CVQU126" },
    { id: "CVMV102", type: "block", label: "CVMV102" },
    { id: "CVMV104", type: "block", width: 275, label: "CVMV104" },
    { id: "CVMV106", type: "block", label: "CVMV106" },
    { id: "CVMV108", type: "block", label: "CVMV108" },
    { id: "CVMV110", type: "block", label: "CVMV110" },
    { id: "CVMV112", type: "block", label: "CVMV112" },
    { id: "CVMV114", type: "block", label: "CVMV114" },
    { id: "CVMV116", type: "block", label: "CVMV116" },
    { id: "CVMV118", type: "block", label: "CVMV118" },
    { id: "CVMV120", type: "block", width: 275, label: "CVMV120" },
    { id: "CVSO102", type: "block", label: "CVSO102" },
    { id: "CVSO104", type: "block", label: "CVSO104" },
    { id: "CVSO106", type: "block", label: "CVSO106" },
    { id: "CVSO108", type: "block", label: "CVSO108" },
    { id: "CVCA102", type: "block", label: "CVCA102" },
    { id: "CVCA104", type: "block", label: "CVCA104" },
    { id: "CVCA106", type: "block", label: "CVCA106" },
    { id: "CVCA108", type: "block", label: "CVCA108" },
    { id: "CVCA110", type: "block", label: "CVCA110" },
    { id: "CVCA112", type: "block", label: "CVCA112" },
    { id: "CVCA114", type: "block", label: "CVCA114" },
    { id: "CVCA116", type: "block", width: 275, label: "CVCA116" },
    { id: "CVRE102", type: "block", label: "CVRE102" },
  ], [])

  const lowerCVSequence: SequenceElement[] = useMemo(() => [
    { id: "CV129", type: "block", width: 100, label: "CV129" },
    { id: "CV131", type: "block", width: 205, label: "CV131" },
    { id: "CV133", type: "block", width: 205, label: "CV133" },
    { id: "CV135", type: "block", label: "CV135"},
    { id: "CVQU103", type: "block", label: "CVQU103" },
    { id: "CVQU105", type: "block", label: "CVQU105" },
    { id: "CVQU107", type: "block", width: 275, label: "CVQU107" },
    { id: "CVQU101", type: "block", label: "CVQU101" },
    { id: "CVQU109", type: "block", width: 275, label: "CVQU109" },
    { id: "CVQ111", type: "block", label: "CVQ111" },
    { id: "CVQU113", type: "block", label: "CVQU113" },
    { id: "CVQU115", type: "block", label: "CVQU115" },
    { id: "CVQU117", type: "block", label: "CVQU117" },
    { id: "CVQU119", type: "block", label: "CVQU119" },
    { id: "CVQU121", type: "block", label: "CVQU121" },
    { id: "CVQU123", type: "block", label: "CVQU123" },
    { id: "CVQU125", type: "block", label: "CVQU125" },
    { id: "CVMV101", type: "block", label: "CVMV101" },
    { id: "CVMV103", type: "block", width: 275, label: "CVMV103" },
    { id: "CVMV105", type: "block", label: "CVMV105" },
    { id: "CVMV107", type: "block", label: "CVMV107" },
    { id: "CVMV109", type: "block", label: "CVMV109" },
    { id: "CVMV111", type: "block", label: "CVMV111" },
    { id: "CVMV113", type: "block", label: "CVMV113" },
    { id: "CVMV115", type: "block", label: "CVMV115" },
    { id: "CVMV117", type: "block", label: "CVMV117" },
    { id: "CVMV119", type: "block", width: 275, label: "CVMV119" },
    { id: "CVSO101", type: "block", label: "CVSO101" },
    { id: "CVSO103", type: "block", label: "CVSO103" },
    { id: "CVSO105", type: "block", label: "CVSO105" },
    { id: "CVSO107", type: "block", label: "CVSO107" },
    { id: "CVCA101", type: "block", label: "CVCA101" },
    { id: "CVCA103", type: "block", label: "CVCA103" },
    { id: "CVCA105", type: "block", label: "CVCA105" },
    { id: "CVCA107", type: "block", label: "CVCA107" },
    { id: "CVCA109", type: "block", label: "CVCA109" },
    { id: "CVCA111", type: "block", label: "CVCA111" },
    { id: "CVCA113", type: "block", label: "CVCA113" },
    { id: "CVCA115", type: "block", width: 275, label: "CVCA115" },
    { id: "CVRE101", type: "block", label: "CVRE101" },
  ], [])

  const upperTrackSequence: SequenceElement[] = useMemo(() => [
    { id: "TRACK_2", type: "track", height: altoTrack },
      { id: "TRACK_4", type: "track", height: altoTrack, width: 650 },
      { id: "TRACK_6", type: "track", height: altoTrack, width: 50 },
      { id: "TRACK_8", type: "track", height: altoTrack, width: 715 },
      { id: "TRACK_10", type: "track", height: altoTrack, width: 50 },
      { id: "TRACK_12", type: "track", height: altoTrack, width: 940 },
      { id: "TRACK_14", type: "track", height: altoTrack, width: 50 },
      { id: "TRACK_16", type: "track", height: altoTrack, width: 160 },
      { id: "TRACK_18", type: "track", height: altoTrack, width: 660 },
      { id: "TRACK_20", type: "track", height: altoTrack, width: 50 },
      
      
  ], [])

  const lowerTrackSequence: SequenceElement[] = useMemo(() => [
    { id: "TRACK_1", type: "track", height: altoTrack },
    { id: "TRACK_3", type: "track", height: altoTrack, width: 650 },
    { id: "TRACK_5", type: "track", height: altoTrack, width: 50 },
    { id: "TRACK_7", type: "track", height: altoTrack, width: 715 },
    { id: "TRACK_9", type: "track", height: altoTrack, width: 50 },
    { id: "TRACK_11", type: "track", height: altoTrack, width: 940 },
    { id: "TRACK_13", type: "track", height: altoTrack, width: 50 },
    { id: "TRACK_15", type: "track", height: altoTrack, width: 160 },
    { id: "TRACK_17", type: "track", height: altoTrack, width: 660 },
    { id: "TRACK_19", type: "track", height: altoTrack, width: 50 },
  ], [])

  const upperCatenariaSequence: SequenceElement[] = useMemo(() => [
    { id: "C4(2)", type: "catenaria-track", height: altoCatenaria, label: "C4" },
    { id: "C5(2)", type: "catenaria-track", width: 990, height: altoCatenaria, label: "C5" },
    { id: "C6(2)", type: "catenaria-track", width: 265, height: altoCatenaria, label: "C6" },
    { id: "C7(2)", type: "catenaria-track", width: 495, height: altoCatenaria, label: "C7" },
    { id: "C8(2)", type: "catenaria-track", width: 270, height: altoCatenaria, label: "C8" },
    { id: "C9(2)", type: "catenaria-track", width: 440, height: altoCatenaria, label: "C9" },
    { id: "C10(2)", type: "catenaria-track", width: 215, height: altoCatenaria, label: "C10" },
    { id: "C11(2)", type: "catenaria-track", width: 660, height: altoCatenaria, label: "C11" },
  ], [])

  const upperSwitchSequence: SequenceElement[] = useMemo(() => [
    { id: "A128", type: "switch", height: altoSwitch, width: 100, label: "A128" },
    { id: "A130", type: "switch", height: altoSwitch, width: 50, label: "A130", gap: 105 },
    { id: "A132", type: "switch", height: altoSwitch, width: 50, label: "A132", gap: 160 },
    { id: "C102", type: "switch", height: altoSwitch, width: 50, label: "C102", gap: 55 },
    { id: "SQ102", type: "signal", height: altoSignal, label: "SQ102", width: 5, gap:180 },
    { id: "AQU102", type: "switch", height: altoSwitch, width: 50, label: "AQU102", gap: 105 },
    { id: "AQU104", type: "switch", height: altoSwitch, width: 50, label: "AQU104", gap: 130 },
    { id: "AQU106", type: "switch", height: altoSwitch, width: 50, label: "AQU106", gap: 105 },
    { id: "AQU108", type: "switch", height: altoSwitch, width: 50, label: "AQU108", gap: 225 },
    { id: "CTV1", type: "ctv", height: altoSwitch, width: 50, label: "CTV1", gap: 335 },
    { id: "AMV102", type: "switch", height: altoSwitch, width: 50, label: "AMV102", gap: 340},
    { id: "CTV2", type: "ctv", height: altoSwitch, width: 50, label: "CTV2", gap: 215 },
    { id: "AMV104", type: "switch", height: altoSwitch, width: 50, label: "AMV104", gap: 400 },
    { id: "SCA104", type: "signal", height: altoSignal, label: "SCA104", width: 5, gap:435 },
    { id: "ACA102", type: "switch", height: altoSwitch, width: 50, label: "ACA102", gap: 120 },
    { id: "SRE106", type: "signal", height: altoSignal, label: "SRE106", width: 5 },

  ], [])

  const lowerSwitchSequence: SequenceElement[] = useMemo(() => [
    { id: "A119", type: "switch", height: altoSwitch, width: 100, label: "A119" },
    { id: "A121", type: "switch", height: altoSwitch, width: 50, label: "A121", gap: 105 },
    { id: "A123", type: "switch", height: altoSwitch, width: 50, label: "A123", gap: 160 },
    { id: "C101", type: "switch", height: altoSwitch, width: 50, label: "C101", gap: 110 },
    { id: "SQ101", type: "signal", height: altoSignal, label: "SQ101", width: 5, gap:50 },
    { id: "SQ105", type: "signal", height: altoSignal, label: "SQ105", width: 5, gap:70 },
    { id: "AQU101", type: "switch", height: altoSwitch, width: 50, label: "AQU101", gap: 105 },
    { id: "AQU103", type: "switch", height: altoSwitch, width: 50, label: "AQU103", gap: 130 },
    { id: "AQU105", type: "switch", height: altoSwitch, width: 50, label: "AQU105", gap: 105 },
    { id: "AQU107", type: "switch", height: altoSwitch, width: 50, label: "AQU107", gap: 230 },
    { id: "CTV3", type: "ctv", height: altoSwitch, width: 50, label: "CTV1", gap: 215 },
    { id: "SMV105", type: "signal", height: altoSignal, label: "SMV105", width: 5, gap:115},
    { id: "AMV101", type: "switch", height: altoSwitch, width: 50, label: "AMV101", gap: 340 },
    { id: "CTV4", type: "ctv", height: altoSwitch, width: 50, label: "CTV2", gap: 215 },
    { id: "AMV103", type: "switch", height: altoSwitch, width: 50, label: "AMV103", gap: 840 },
    { id: "ACA101", type: "switch", height: altoSwitch, width: 50, label: "ACA101", gap: 120 },

  ], [])

  const lowerCatenariaSequence: SequenceElement[] = useMemo(() => [
    { id: "C4(1)", type: "catenaria-track", height: altoCatenaria, label: "C4" },
    { id: "C5(1)", type: "catenaria-track", width: 370, height: altoCatenaria, label: "C5" },
    { id: "C6(1)", type: "catenaria-track", width: 885, height: altoCatenaria, label: "C6" },
    { id: "C7(1)", type: "catenaria-track", width: 160, height: altoCatenaria, label: "C7" },
    { id: "C8(1)", type: "catenaria-track", width: 605, height: altoCatenaria, label: "C8" },
    { id: "C9(1)", type: "catenaria-track", width: 105, height: altoCatenaria, label: "C9" },
    { id: "C10(1)", type: "catenaria-track", width: 495, height: altoCatenaria, label: "C10" },
    { id: "C11(1)", type: "catenaria-track", width: 380, height: altoCatenaria, label: "C11" },
    { id: "C12(1)", type: "catenaria-track", width: 330, height: altoCatenaria, label: "C12" },
  ], [])

  const upperSignalSequence: SequenceElement[] = useMemo(() => [
    { id: "S128", type: "signal", height: altoSignal, label: "S128", gap: 200 },
    { id: "S132", type: "signal", height: altoSignal, label: "S132", gap: 160 },
    { id: "S134", type: "signal", height: altoSignal, label: "S134", gap: 1320 },
    { id: "SMV104", type: "signal", height: altoSignal, label: "SMV104" },
  ], [])

  const lowerSignalSequence: SequenceElement[] = useMemo(() => [
    { id: "S129", type: "signal", height: altoSignal, label: "S129", gap: 265 },
    { id: "S135", type: "signal", height: altoSignal, label: "S135", gap: 50 },
    { id: "SQ103", type: "signal", height: altoSignal, label: "SQ103", gap: 330 },
    { id: "SQ107", type: "signal", height: altoSignal, label: "SQ107", gap: 50 },
    { id: "SQU109", type: "signal", height: altoSignal, label: "SQU109", gap: 275 },
    { id: "SQU111", type: "signal", height: altoSignal, label: "SQU111", gap: 380 },
    { id: "SMV101", type: "signal", height: altoSignal, label: "SMV101", gap: 105 },
    { id: "SMV103", type: "signal", height: altoSignal, label: "SMV103", gap: 275 },
    { id: "SMV107", type: "signal", height: altoSignal, label: "SMV107", gap:385 },
    { id: "SSO101", type: "signal", height: altoSignal, label: "SSO101", gap: 270 },
    { id: "SSO103", type: "signal", height: altoSignal, label: "SSO103", gap: 50 },
    { id: "SSO105", type: "signal", height: altoSignal, label: "SSO105", gap: 215 },
    { id: "SCA101", type: "signal", height: altoSignal, label: "SCA101", gap: 325 },
    { id: "SRE101", type: "signal", height: altoSignal, label: "SRE101", gap: 275 },

  ], [])

  const upperSignalSequence2: SequenceElement[] = useMemo(() => [
    { id: "S130", type: "signal", height: altoSignal, label: "S130", gap: 210 },
    { id: "S136", type: "signal", height: altoSignal, label: "S136" },
    { id: "SQU104", type: "signal", height: altoSignal, label: "SQU104", gap:385 },
    { id: "SQU108", type: "signal", height: altoSignal, label: "SQU108" },
    { id: "SQU110", type: "signal", height: altoSignal, label: "SQU110", gap:275 },
    { id: "SQU112", type: "signal", height: altoSignal, label: "SQU112",gap: 435 },
    { id: "SMV102", type: "signal", height: altoSignal, label: "SMV102", gap:335 },
    { id: "SMV106", type: "signal", height: altoSignal, label: "SMV106", gap:375 },
    { id: "SSO102", type: "signal", height: altoSignal, label: "SSO102", gap:275 },
    { id: "SSO104", type: "signal", height: altoSignal, label: "SSO104", gap:215 },
    { id: "SCA102", type: "signal", height: altoSignal, label: "SCA102", gap:105	 },
    { id: "SCA106", type: "signal", height: altoSignal, label: "SCA106", gap:270 },
    { id: "SRE102", type: "signal", height: altoSignal, label: "SRE102", gap:275 },
    { id: "SRE104", type: "signal", height: altoSignal, label: "SRE104" },
  ], [])

  const lowerSignalSequence2: SequenceElement[] = useMemo(() => [
    { id: "S131", type: "signal", height: altoSignal, label: "S131", gap: 160 },
    { id: "S133", type: "signal", height: altoSignal, label: "S133", gap: 45 },
  ], [])

  

  // Calculate positions for all elements
  const elements = useMemo<Element[]>(() => {
    const elementsList: Element[] = [
      // Stations
      { id: "TYC", type: "station", x: 40, y: 316, width: 100, height: 60, label: "TYC\nPLAYA DE VIAS" },
      { id: "TYC1", type: "stationBlock", x: 75, y: 300, width: 80, height: 10 },
      { id: "TYC2", type: "stationBlock", x: 145, y: 300, width: 10, height: 100 },
      { id: "TYC3", type: "stationBlock", x: 75, y: 390, width: 80, height: 10 },
      { id: "TYC4", type: "triangleUp", x: 65, y: 300, width: 20, height: 10},
      { id: "TYC5", type: "triangleDown", x: 65, y: 390, width: 20, height: 10},

      ...generateStationWithBlocks({ 
        id: "INSTALACION", 
        x: 180, 
        y: 100, 
        label: "INSTALACIÓN\nTALLERES Y\nCOCHERAS" 
      }),
      ...generateStationWithBlocks({ 
        id: "QUIUMBE", 
        x: 1175, 
        y: 100, 
        label: "QUIUMBE" 
      }),
      ...generateStationWithBlocks({ 
        id: "MORÁN VALVERDE", 
        x: 1960, 
        y: 100, 
        label: "MORÁN VALDERDE" 
      }),
      ...generateStationWithBlocks({ 
        id: "SOLANDA", 
        x: 2960, 
        y: 100, 
        label: "SOLANDA" 
      }),
      ...generateStationWithBlocks({ 
        id: "CARDENAL DE LA TORRE", 
        x: 3180, 
        y: 100, 
        label: "CARDENAL DE LA TORRE" 
      }),
      ...generateStationWithBlocks({ 
        id: "RECREO", 
        x: 3845, 
        y: 100, 
        label: "RECREO" 
      }),
      ...generatePozosWithBlocks({ 
        id: "SE1", 
        x: 1535, 
        y: 100, 
        label: "SE1" 
      }),
      ...generatePozosWithBlocks({ 
        id: "PV1", 
        x: 1700, 
        y: 100, 
        label: "PV1" 
      }),
      ...generatePozosWithBlocks({ 
        id: "SE2", 
        x: 1810, 
        y: 100, 
        label: "SE2" 
      }),
      ...generatePozosWithBlocks({ 
        id: "SE3", 
        x: 2310, 
        y: 100, 
        label: "SE3" 
      }),
      ...generatePozosWithBlocks({ 
        id: "PV2", 
        x: 2475, 
        y: 100, 
        label: "PV2" 
      }),
      ...generatePozosWithBlocks({ 
        id: "PV2 + SE4", 
        x: 2530, 
        y: 100, 
        label: "PV2 + SE4" 
      }),

      

      // Generate positions for upper and lower tracks
      ...calculatePositions(upperCVSequence, elementsConfigs.upperCircuitoVias, altoCircuitoVias),
      ...calculatePositions(lowerCVSequence, elementsConfigs.lowerCircuitoVias, altoCircuitoVias),
      ...calculatePositions(upperTrackSequence, elementsConfigs.upperTrack, altoTrack),
      ...calculatePositions(lowerTrackSequence, elementsConfigs.lowerTrack, altoTrack),
      ...calculatePositions(upperCatenariaSequence, elementsConfigs.upperCatenaria, altoCatenaria),
      ...calculatePositions(lowerCatenariaSequence, elementsConfigs.lowerCatenaria, altoCatenaria),
      ...calculatePositions(upperSwitchSequence, elementsConfigs.upperSwitch, altoSwitch),
      ...calculatePositions(lowerSwitchSequence, elementsConfigs.lowerSwitch, altoSwitch),
      ...calculatePositions(upperSignalSequence, elementsConfigs.upperSignal, altoSignal),
      ...calculatePositions(upperSignalSequence2, elementsConfigs.upperSignal2, altoSignal),
      ...calculatePositions(lowerSignalSequence, elementsConfigs.lowerSignal, altoSignal),
      ...calculatePositions(lowerSignalSequence2, elementsConfigs.lowerSignal2, altoSignal),

      { id: "FINRECREO", type: "station", x: 3875, y: 316, width: 100, height: 60, label: "FIN DE\nESTACIÓN RECREO" },


      // // Track crossings
      // { id: "CROSSING_1", type: "crossing", x: 300, y: 325, width: 100, height: 40 },
      // { id: "CROSSING_2", type: "crossing", x: 1250, y: 325, width: 100, height: 40 },
      // { id: "CROSSING_3", type: "crossing", x: 1300, y: 325, width: 100, height: 40 },
      // { id: "CROSSING_4", type: "crossing", x: 1250, y: 325, width: 100, height: 40 },
    ]

    validateElements(elementsList)
    return elementsList
  }, [upperCVSequence, lowerCVSequence])

  // Add a new compositeObjects array after the elements array definition
  const compositeObjects = useMemo(
    () => [
      {
        id: "COMPOSITE1",
        label: "Diamond-Rectangle-Diamond",
        elements: ["DIAMOND1", "RECT1", "DIAMOND2"],
      },
      {
        id: "COMPOSITE2",
        label: "Track Section 1",
        elements: ["CV154", "CV156", "S128"],
      },
      {
        id: "COMPOSITE3",
        label: "Track Section 2",
        elements: ["CV158", "CV160", "C102"],
      },
      {
        id: "SIGNAL_GROUP1",
        label: "Signal Group 1",
        elements: ["SIGNAL1", "SIGNAL2", "SIGNAL3"],
      },
    ],
    [],
  )

  return (
    <div className="relative h-[800px] overflow-auto">
      <div className="absolute top-2 right-2 z-50">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="bg-gray-700 text-white px-2 py-1 text-xs rounded hover:bg-gray-600"
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
      </div>
      <div
        className="relative w-[4100px] h-[800px] bg-gray-900"
        onMouseMove={(e) => {
          // Get the position relative to the container
          const rect = e.currentTarget.getBoundingClientRect()
          const x = Math.round(e.clientX - rect.left)
          const y = Math.round(e.clientY - rect.top)
          onMouseMove?.(x, y)
        }}
      >
        {/* Render the grid directly in the container */}
        {showGrid && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* 5px grid - very light */}
            <div
              className="absolute inset-0"
              style={{
                backgroundSize: "5px 5px",
                backgroundImage:
                  "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                zIndex: 10,
              }}
            />

            {/* 10px grid - light */}
            <div
              className="absolute inset-0"
              style={{
                backgroundSize: "10px 10px",
                backgroundImage:
                  "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                zIndex: 11,
              }}
            />

            {/* 50px grid - medium */}
            <div
              className="absolute inset-0"
              style={{
                backgroundSize: "50px 50px",
                backgroundImage:
                  "linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
                zIndex: 12,
              }}
            />

            {/* 100px grid - bold */}
            <div
              className="absolute inset-0"
              style={{
                backgroundSize: "100px 100px",
                backgroundImage:
                  "linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)",
                zIndex: 13,
              }}
            />

            {/* Grid coordinates */}
            {Array.from({ length: Math.ceil(1500 / 50) + 1 }, (_, i) => i * 50).map((x) => (
              <div
                key={`coord-x-${x}`}
                className="absolute text-white text-xs"
                style={{ left: `${x + 2}px`, top: "2px", zIndex: 14 }}
              >
                {x}
              </div>
            ))}

            {Array.from({ length: Math.ceil(500 / 50) + 1 }, (_, i) => i * 50).map((y) => (
              <div
                key={`coord-y-${y}`}
                className="absolute text-white text-xs"
                style={{ left: "2px", top: `${y + 2}px`, zIndex: 14 }}
              >
                {y}
              </div>
            ))}
          </div>
        )}

        {elements.map((element) => {
          // Check if this element is part of a colored composite
          let color = coloredElements[element.id] || getDefaultColor(element.type)

          // Check if any composite containing this element has been colored
          compositeObjects.forEach((composite) => {
            if (composite.elements.includes(element.id) && coloredElements[composite.id]) {
              color = coloredElements[composite.id]
            }
          })

          if (element.type === "diamond") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  zIndex: getZIndex(element.type),
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: color,
                    transform: "rotate(45deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {element.label}
                </div>
              </div>
            )
          }

          if (element.type === "triangleRight") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  zIndex: getZIndex(element.type),
                }}
              >
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderRight: `${element.width/2}px solid transparent`,
                    borderBottom: `${element.height}px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    width: "100%",
                    textAlign: "center",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}>
                    {element.label}
                  </span>
                </div>
              </div>
            )
          }

          if (element.type === "triangleLeft") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  zIndex: getZIndex(element.type),
                }}
              >
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderLeft: `${element.width/2}px solid transparent`,
                    borderBottom: `${element.height}px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    width: "100%",
                    textAlign: "center",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}>
                    {element.label}
                  </span>
                </div>
              </div>
            )
          }

          if (element.type === "triangleUp") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  zIndex: getZIndex(element.type),
                }}
              >
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderBottom: `${element.width/2}px solid transparent`,
                    borderRight: `${element.height}px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    width: "100%",
                    textAlign: "center",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}>
                    {element.label}
                  </span>
                </div>
              </div>
            )
          }

          if (element.type === "triangleDown") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  zIndex: getZIndex(element.type),
                }}
              >
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderBottom: `${element.width/2}px solid transparent`,
                    borderRight: `${element.height}px solid ${color}`,
                    transform: "rotate(90deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    width: "100%",
                    textAlign: "center",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                  }}>
                    {element.label}
                  </span>
                </div>
              </div>
            )
          }

          if (element.type === "signal") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  backgroundColor: color,
                  zIndex: getZIndex(element.type),
                  border: getBorder(element.type),
                }}
              >
              <span style={{
                    position: "absolute",
                    color: "white",
                    fontSize: "10px",
                    width: "100%",
                    top: "50%",
                    left: "50%",
                    transform: "translate(100%, -50%)",
                  }}>
                    {element.label}
                  </span>
              </div>
            )
          }

          if (element.type === "ctv") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  backgroundColor: "transparent",
                  zIndex: getZIndex(element.type),
                  border: getBorder(element.type),
                  color: "white",
                  fontSize: "10px",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                    {element.label}
              </div>
            )
          }

          return (
            <div
              key={element.id}
              className={`absolute ${element.rotate ? "flex items-center justify-center" : ""}`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                backgroundColor: color,
                border: getBorder(element.type),
                borderRadius: getBorderRadius(element.type),
                transform: element.rotate ? "rotate(-90deg)" : "none",
                color: getTextColor(element.type),
                fontSize: getFontSize(element.type),
                display: "flex",
                alignItems: "center",
                justifyContent: element.labelPosition === "start" ? "flex-start" : 
                             element.labelPosition === "end" ? "flex-end" : "center",
                textAlign: "center",
                whiteSpace: "pre-line",
                zIndex: getZIndex(element.type),
                padding: element.labelPosition ? "0 4px" : undefined,
              }}
            >
              {element.label}
            </div>
          )
        })}

        {/* Track crossings (X pattern) */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
          {generateXCrossing(280, 312.5).map((path, index) => (
            <path key={`x1-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateXCrossing(935, 312.5).map((path, index) => (
            <path key={`x2-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateXCrossing(1275, 312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateX1Crossing(2090, 312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateX1Crossing(2750, 312.5).map((path, index) => (
              <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
            ))}
          {generateX1Crossing(3635, 312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        </svg>
        

        {/* <div className="absolute bottom-2 left-2 z-50 bg-gray-800 p-2 rounded text-xs text-white">
          <div className="font-bold mb-1">Composite Objects:</div>
          {compositeObjects.map((composite) => (
            <div key={composite.id} className="mb-1">
              {composite.id}: {composite.label}
            </div>
          ))}
        </div> */}
      </div>
    </div>
  )
}

function getDefaultColor(type: string): string {
  switch (type) {
    case "station":
      return "transparent"
    case "stationBlock":
      return "#BBBBBB"
    case "block":
      return "#BBBBBB"
    case "connector":
      return "#FFFFFF"
    case "track":
      return "#BBBBBB"
    case "catenaria-track":
      return "#FF0000"
    case "crossing":
      return "transparent"
    case "diamond":
      return "#FFCC00"
    case "signal":
      return "#FFFFFF"
    case "energyBlock":
      return "#FF0000"
    default:
      return "#CCCCCC"
  }
}

function getBorder(type: string): string {
  switch (type) {
    case "ctv":
      return "0px solid #FFFFFF"
    case "station":
      return "0px solid #FFFFFF"
    case "block":
      return "1px solid #333333"
    case "connector":
      return "1px solid #FFFFFF"
    case "signal":
      return "1px solid #000000"
    default:
      return "none"
  }
}

function getBorderRadius(type: string): string {
  switch (type) {
    case "station":
      return "0px"
    default:
      return "0"
  }
}

function getTextColor(type: string): string {
  switch (type) {
    case "station":
    case "track":
      return "#FFFFFF"
    case "connector":
      return "#000000"
    case "catenaria-track":
      return "#FFFFFF"
    default:
      return "#000000"
  }
}

function getFontSize(type: string): string {
  switch (type) {
    case "station":
      return "12px"
    case "connector":
      return "10px"
    default:
      return "11px"
  }
}

function getZIndex(type: string): number {
  switch (type) {
    case "station":
      return 10
    case "block":
      return 5
    case "track":
      return 2
    case "catenaria-track":
      return 1
    default:
      return 3
  }
}

function generateXCrossing(startX: number, startY: number, width: number = 205, height: number = 75): string[] {
  const endX = startX + width;
  const topY = startY;
  const bottomY = startY + height;
  
  const controlPoint1X = startX + (width * 0.3);
  const controlPoint2X = startX + (width * 0.7);
  
  return [
    `M${startX},${topY} C${controlPoint1X},${topY} ${controlPoint2X},${bottomY} ${endX},${bottomY}`,
    `M${startX},${bottomY} C${controlPoint1X},${bottomY} ${controlPoint2X},${topY} ${endX},${topY}`
  ];
}

function generateX1Crossing(startX: number, startY: number, width: number = 205, height: number = 75): string[] {
  const endX = startX + width;
  const topY = startY;
  const bottomY = startY + height;
  
  const controlPoint1X = startX + (width * 0.3);
  const controlPoint2X = startX + (width * 0.7);
  
  return [
    `M${startX},${topY} C${controlPoint1X},${topY} ${controlPoint2X-50},${bottomY} ${endX-60},${bottomY}`,
  ];
}
