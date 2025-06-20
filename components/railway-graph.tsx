"use client"

import { useMemo, useState } from "react"

import {
  cv_upper_sq_part1, cv_upper_sq_part2, cv_lower_sq_part1, cv_lower_sq_part2, track_upper_sq_part1,
  track_upper_sq_part2, track_lower_sq_part1, track_lower_sq_part2, ct_upper_sq_part1, ct_upper_sq_part2,
  ct_lower_sq_part1, ct_lower_sq_part2,
  sw_upper_sq_part2,
  sw_upper_sq_part1,
  sw_lower_sq_part1,
  sw_lower_sq_part2,
  sig_upper_sq_part1,
  sig_lower_sq_part1,
  sig_upper_sq2_part1,
  sig_lower_sq2_part1,
  sig_lower_sq2_part2,
  sig_upper_sq2_part2,
  sig_upper_sq_part3,
  sw_upper_sq_part3,
  cv_upper_sq_part3,
  track_upper_sq_part3,
  track_lower_sq_part3,
  ct_upper_sq_part3,
  ct_lower_sq_part3,
  sw_lower_sq_part3,
  cv_lower_sq_part3,
  sig_lower_sq_part3
} from '../lib/data/railway-data'
import { railwayDataParams, elementsConfigs_part1, elementsConfigs_part2, elementsConfigs_part3 } from "@/lib/data/railway-data-params"
import { stations, Station } from "@/lib/data/railway-stations"
import { pozos } from "@/lib/data/railway-pozos"

interface RailwayGraphProps {
  coloredElements: Record<string, string>
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
  fontSize?: number
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

function generateStationWithBlocks(config: Station): Element[] {
  const stationWidth = config.width || 60
  const stationHeight = config.height || 80
  const blockWidth = (config.width || 50) * 0.2 || 5
  const bottomBlockHeight = (config.height || 100) * 0.1 || 10
  const sideBlockWidth = 5
  const sideBlockHeight = ((config.height || 150) * 0.5) || 75 
  const fontSize = config.fontSize || 12

  return [
    { 
      id: config.id,
      type: "station",
      x: config.x,
      y: config.y,
      width: stationWidth,
      height: stationHeight,
      label: config.label,
      fontSize: fontSize
    },
    { 
      id: `${config.id}_1`, 
      type: "stationBlock", 
      x: config.x - stationWidth/2, 
      y: config.y, 
      width: blockWidth, 
      height: stationHeight 
    },
    { 
      id: `${config.id}_2`, 
      type: "stationBlock", 
      x: config.x - stationWidth/2, 
      y: config.y + stationHeight, 
      width: 7*stationWidth/4 + blockWidth, 
      height: bottomBlockHeight 
    },
    { 
      id: `${config.id}_3`, 
      type: "stationBlock", 
      x: config.x + stationWidth + stationWidth/4, 
      y: config.y, 
      width: blockWidth, 
      height: stationHeight 
    },
    //Punta derecha de la estación
    { 
      id: `${config.id}_4`, 
      type: "triangleLeft", 
      x: config.x + stationWidth + stationWidth/4, 
      y: config.y - stationHeight/10, 
      width: blockWidth*2, 
      height: stationHeight/10,
    },
    //Punta izquierda de la estación
    { 
      id: `${config.id}_5`, 
      type: "triangleRight", 
      x: config.x - stationWidth/2, 
      y: config.y - stationHeight/10, 
      width: blockWidth*2, 
      height: stationHeight/10,
    },
    //Energy
    { 
      id: `${config.id}_6`, 
      type: "energyBlock", 
      x: config.x + stationWidth + 10, 
      y: config.y, 
      width: sideBlockWidth, 
      height: sideBlockHeight,
    },
  ]
}

function generatePozosWithBlocks(config: Station): Element[] {
  const stationWidth = 50
  const stationHeight = config.height || 80
  const sideBlockWidth = 5
  const sideBlockHeight = ((config.height || 150) * 0.5) || 75 
  const bottomBlockHeight = ((config.height || 100) * 0.1) || 10

  return [
    { 
      id: config.id, 
      type: "station", 
      x: config.x, 
      y: config.y,  
      width: stationWidth, 
      height: stationHeight, 
      label: config.label,
    },
    { 
      id: `${config.id}_2`, 
      type: "stationBlock", 
      x: config.x, 
      y: config.y + stationHeight, 
      width: stationWidth, 
      height: bottomBlockHeight 
    },
    //Energy
    { 
      id: `${config.id}_6`, 
      type: "energyBlock", 
      x: config.x + stationWidth - sideBlockWidth, 
      y: config.y, 
      width: sideBlockWidth, 
      height: sideBlockHeight,
    },
  ]
}



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
      console.log("Element", element, "is duplicated", ids.has(element.id))
      throw new Error(`Duplicate element ID found: ${element.id}`)
    }
    ids.add(element.id)
  })
}

export default function RailwayGraph({ coloredElements }: RailwayGraphProps) {
  const [showGrid, setShowGrid] = useState(false)
  

  const cvUpperSqPart1: SequenceElement[] = useMemo(() => [
    ...cv_upper_sq_part1,
  ], [])

  const cvUpperSqPart2: SequenceElement[] = useMemo(() => [
    ...cv_upper_sq_part2,
  ], [])

  const cvLowerSqPart1: SequenceElement[] = useMemo(() => [
    ...cv_lower_sq_part1,
  ], [])

  const cvLowerSqPart2: SequenceElement[] = useMemo(() => [
    ...cv_lower_sq_part2,
  ], [])


  const trUpperSqPart1: SequenceElement[] = useMemo(() => [
    ...track_upper_sq_part1
  ], [])

  const trUpperSqPart2: SequenceElement[] = useMemo(() => [
    ...track_upper_sq_part2
      
  ], [])

  const trLowerSqPart1: SequenceElement[] = useMemo(() => [
    ...track_lower_sq_part1
  ], [])

  const trLowerSqPart2: SequenceElement[] = useMemo(() => [
    ...track_lower_sq_part2
  ], [])

  const ctUpperSqPart1: SequenceElement[] = useMemo(() => [
    ...ct_upper_sq_part1
  ], [])

  const ctUpperSqPart2: SequenceElement[] = useMemo(() => [
    ...ct_upper_sq_part2
  ], [])

  const ctLowerSqPart1: SequenceElement[] = useMemo(() => [
    ...ct_lower_sq_part1
  ], [])

  const ctLowerSqPart2: SequenceElement[] = useMemo(() => [
    ...ct_lower_sq_part2
  ], [])

  const swUpperSqPart1: SequenceElement[] = useMemo(() => [
    ...sw_upper_sq_part1

  ], [])

  const swUpperSqPart2: SequenceElement[] = useMemo(() => [
    ...sw_upper_sq_part2
  ], [])

  const swLowerSqPart1: SequenceElement[] = useMemo(() => [
    ...sw_lower_sq_part1
  ], [])

  const swLowerSqPart2: SequenceElement[] = useMemo(() => [
    ...sw_lower_sq_part2
  ], [])

  const sigUpperSqPart1: SequenceElement[] = useMemo(() => [
    ...sig_upper_sq_part1
  ], [])

  const sigLowerSqPart1: SequenceElement[] = useMemo(() => [
    ...sig_lower_sq_part1

  ], [])

  const sigUpperSq2Part1: SequenceElement[] = useMemo(() => [
    ...sig_upper_sq2_part1
  ], [])

  const sigLowerSq2_part1: SequenceElement[] = useMemo(() => [
    ...sig_lower_sq2_part1
  ], [])

  const sigLowerSq2_part2: SequenceElement[] = useMemo(() => [
    ...sig_lower_sq2_part2
  ], [])

  const sigUpperSq2Part2: SequenceElement[] = useMemo(() => [
    ...sig_upper_sq2_part2
  ], [])

  const sigUpperSqPart3: SequenceElement[] = useMemo(() => [
    ...sig_upper_sq_part3
  ], [])

  const swUpperSqPart3: SequenceElement[] = useMemo(() => [
    ...sw_upper_sq_part3
  ], [])

  const cvUpperSqPart3: SequenceElement[] = useMemo(() => [
    ...cv_upper_sq_part3
  ], [])

  const trUpperSqPart3: SequenceElement[] = useMemo(() => [
    ...track_upper_sq_part3
  ], [])

  const trLowerSqPart3: SequenceElement[] = useMemo(() => [
    ...track_lower_sq_part3
  ], [])

  const ctUpperSqPart3: SequenceElement[] = useMemo(() => [
    ...ct_upper_sq_part3
  ], [])

  const ctLowerSqPart3: SequenceElement[] = useMemo(() => [
    ...ct_lower_sq_part3
  ], [])

  const swLowerSqPart3: SequenceElement[] = useMemo(() => [
    ...sw_lower_sq_part3
  ], [])

  const cvLowerSqPart3: SequenceElement[] = useMemo(() => [
    ...cv_lower_sq_part3
  ], [])

  const sigLowerSqPart3: SequenceElement[] = useMemo(() => [
    ...sig_lower_sq_part3
  ], [])


  // Calculate positions for all elements
  const elements = useMemo<Element[]>(() => {
    const elementsList: Element[] = [
      //First part of the graph

      { id: "TYC", type: "station", x: 40, y: 316, width: 100, height: 60, label: "TYC\nPLAYA DE VIAS" },
      { id: "TYC1", type: "stationBlock", x: 75, y: 300, width: 80, height: 10 },
      { id: "TYC2", type: "stationBlock", x: 145, y: 300, width: 10, height: 100 },
      { id: "TYC3", type: "stationBlock", x: 75, y: 390, width: 80, height: 10 },
      { id: "TYC4", type: "triangleUp", x: 65, y: 300, width: 20, height: 10},
      { id: "TYC5", type: "triangleDown", x: 65, y: 390, width: 20, height: 10},

      ...stations.map(station => generateStationWithBlocks(station)).flat(),
      ...pozos.map(pozo => generatePozosWithBlocks(pozo)).flat(),

      // Generate positions for upper and lower tracks
      ...calculatePositions(cvUpperSqPart1, elementsConfigs_part1.cv_upper, railwayDataParams.cv_height),
      ...calculatePositions(cvLowerSqPart1, elementsConfigs_part1.cv_lower, railwayDataParams.cv_height),
      ...calculatePositions(trUpperSqPart1, elementsConfigs_part1.tr_upper, railwayDataParams.tr_height),
      ...calculatePositions(trLowerSqPart1, elementsConfigs_part1.tr_lower, railwayDataParams.tr_height),
      ...calculatePositions(ctUpperSqPart1, elementsConfigs_part1.ct_upper, railwayDataParams.ct_height),
      ...calculatePositions(ctLowerSqPart1, elementsConfigs_part1.ct_lower, railwayDataParams.ct_height),
      ...calculatePositions(swUpperSqPart1, elementsConfigs_part1.sw_upper, railwayDataParams.sw_height),
      ...calculatePositions(swLowerSqPart1, elementsConfigs_part1.sw_lower, railwayDataParams.sw_height),
      ...calculatePositions(sigUpperSqPart1, elementsConfigs_part1.sig_upper, railwayDataParams.sig_height),
      ...calculatePositions(sigUpperSq2Part1, elementsConfigs_part1.sig_upper2, railwayDataParams.sig_height),
      ...calculatePositions(sigLowerSqPart1, elementsConfigs_part1.sig_lower, railwayDataParams.sig_height),
      ...calculatePositions(sigLowerSq2_part1, elementsConfigs_part1.sig_lower2, railwayDataParams.sig_height),

      { id: "FINRECREO", type: "station", x: 4050, y: 316, width: 100, height: 60, label: "FIN DE\nESTACIÓN RECREO" },

      //Second part of the graph
      { id: "INICIO_TRAMO_RE_MA", type: "station", x: 250, y: 750, width: 100, height: 60, label: "INICIO TRAMO RE-MA" },
      ...calculatePositions(cvUpperSqPart2, elementsConfigs_part2.cv_upper, railwayDataParams.cv_height),
      ...calculatePositions(cvLowerSqPart2, elementsConfigs_part2.cv_lower, railwayDataParams.cv_height),
      ...calculatePositions(trUpperSqPart2, elementsConfigs_part2.tr_upper, railwayDataParams.tr_height),
      ...calculatePositions(trLowerSqPart2, elementsConfigs_part2.tr_lower, railwayDataParams.tr_height),
      ...calculatePositions(swLowerSqPart2, elementsConfigs_part2.sw_lower, railwayDataParams.sw_height),
      ...calculatePositions(swUpperSqPart2, elementsConfigs_part2.sw_upper, railwayDataParams.sw_height),
      ...calculatePositions(sigUpperSq2Part2, elementsConfigs_part2.sig_upper2, railwayDataParams.sig_height),
      ...calculatePositions(sigLowerSq2_part2, elementsConfigs_part2.sig_lower2, railwayDataParams.sig_height),
      ...calculatePositions(ctUpperSqPart2, elementsConfigs_part2.ct_upper, railwayDataParams.ct_height),
      ...calculatePositions(ctLowerSqPart2, elementsConfigs_part2.ct_lower, railwayDataParams.ct_height),

      //Third part of the graph
      ...calculatePositions(sigUpperSqPart3, elementsConfigs_part3.sig_upper, railwayDataParams.sig_height),
      ...calculatePositions(swUpperSqPart3, elementsConfigs_part3.sw_upper, railwayDataParams.sw_height),
      ...calculatePositions(cvUpperSqPart3, elementsConfigs_part3.cv_upper, railwayDataParams.cv_height),
      ...calculatePositions(trUpperSqPart3, elementsConfigs_part3.tr_upper, railwayDataParams.tr_height),
      ...calculatePositions(trLowerSqPart3, elementsConfigs_part3.tr_lower, railwayDataParams.tr_height),
      ...calculatePositions(ctUpperSqPart3, elementsConfigs_part3.ct_upper, railwayDataParams.ct_height),
      ...calculatePositions(ctLowerSqPart3, elementsConfigs_part3.ct_lower, railwayDataParams.ct_height),
      ...calculatePositions(swLowerSqPart3, elementsConfigs_part3.sw_lower, railwayDataParams.sw_height),
      ...calculatePositions(cvLowerSqPart3, elementsConfigs_part3.cv_lower, railwayDataParams.cv_height),
      ...calculatePositions(sigLowerSqPart3, elementsConfigs_part3.sig_lower, railwayDataParams.sig_height),

      {id: "SLA118", type: "signal", x: 3155, y: 1140, width: 5, height: railwayDataParams.sig_height, label: "SLA118" },
      {id: "SLA122", type: "signal", x: 3312.5, y: 1140, width: 5, height: railwayDataParams.sig_height, label: "SLA122" },
      {id: "TPLA4", type: "signal", x: 3500, y: 1140, width: 5, height: railwayDataParams.sig_height, label: "TPLA4" },
      {id: "CVLA112", type: "cv", x: 3125, y: 1160, width: 187.5, height: railwayDataParams.ct_height, label: "CVLA112" },
      {id: "CVLA114", type: "cv", x: 3317.5, y: 1160, width: 182.5, height: railwayDataParams.ct_height, label: "CVLA114" },
      {id: "C26(4)", type: "catenaria-track", x: 3125, y: 1205, width: 375, height: railwayDataParams.ct_height, label: "C26" },
      {id: "TRACK_100", type: "track", x: 3125, y: 1185, width: 375, height: railwayDataParams.tr_height },

      {id: "SLA117", type: "signal", x: 3155, y: 1545, width: 5, height: railwayDataParams.sig_height, label: "SLA117" },
      {id: "SLA119", type: "signal", x: 3312.5, y: 1545, width: 5, height: railwayDataParams.sig_height, label: "SLA119" },
      {id: "TPLA3", type: "signal", x: 3500, y: 1545, width: 5, height: railwayDataParams.sig_height, label: "TPLA3" },
      {id: "CVLA111", type: "cv", x: 3125, y:1528, width: 187.5, height: railwayDataParams.ct_height, label: "CVLA111" },
      {id: "CVLA113", type: "cv", x: 3317.5, y: 1528, width: 182.5, height: railwayDataParams.ct_height, label: "CVLA113" },
      {id: "C26(3-1)", type: "catenaria-track", x: 3125, y: 1480, width: 185, height: railwayDataParams.ct_height, label: "C26" },
      {id: "C26(3-2)", type: "catenaria-track", x: 3315, y: 1480, width: 185, height: railwayDataParams.ct_height, label: "C26" },
      {id: "TRACK_99", type: "track", x: 3125, y: 1505, width: 375, height: railwayDataParams.tr_height },

    ]

    validateElements(elementsList)
    return elementsList
  }, [])

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
    <div className="relative h-[2000px] overflow-auto">
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
                  width: element.width + 10,
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
                fontSize: element.fontSize || getFontSize(element.type),
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
        {/* A130 */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          {generateXCrossing(280, 312.5).map((path, index) => (
            <path key={`x1-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AQU102 */}
          {generateXCrossing(935, 312.5).map((path, index) => (
            <path key={`x2-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AQU106 */}
          {generateXCrossing(1320, 312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AMV102 */}
          {generateX1Crossing(2200, 312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AMV104 */}
          {generateX1Crossing(2845, 312.5).map((path, index) => (
              <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
            ))}
        {/* ACA102 */}
          {generateX1Crossing(3835, 312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* ARE102 */}
        {generateX1Crossing(490, 732.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AMA102 */}
        {generateX1Crossing(1300, 732.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* ASF102 */}
        {generateX1Crossing(2070, 732.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AAL102 */}
        {generateX1Crossing(2920, 732.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* ALC102 */}
        {generateX1Crossing(380, 1312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AAL102 */}
        {generateX1Crossing(1070, 1312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
        {/* AJI102 */}
        {generateX1Crossing(1950, 1312.5).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateXCrossing(2335, 1312.5).map((path, index) => (
            <path key={`x1-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateXCrossing(2670, 1312.5).map((path, index) => (
            <path key={`x1-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateX3Crossing(2975, 1190, 150).map((path, index) => (
            <path key={`x3-${index}`} d={path} stroke="white" strokeWidth="1" fill="none" />
          ))}
          {generateX4Crossing(2975, 1457, 210).map((path, index) => (
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
    // </div>
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
      return "#BBBBBB"
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
      return "#FFFFFF"
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

function generateX2Crossing(startX: number, startY: number, width: number = 205, height: number = 75): string[] {
  const endX = startX + width;
  const topY = startY;
  const bottomY = startY + height;
  
  const controlPoint1X = startX + (width * 0.3);
  const controlPoint2X = startX + (width * 0.7);
  
  return [
    `M${startX},${bottomY} C${controlPoint1X},${bottomY} ${controlPoint2X},${topY} ${endX},${topY}`
  ];
}

function generateX3Crossing(startX: number, startY: number, width: number = 205, height: number = 75): string[] {
  const endX = startX + width;
  const topY = startY - 22.5 ;
  const bottomY = startY + height;
  
  const controlPoint1X = startX + (width * 0.3);
  const controlPoint2X = startX + (width * 0.7);
  
  return [
    `M${startX},${bottomY} C${controlPoint1X},${bottomY} ${controlPoint2X},${topY} ${endX},${topY}`
  ];
}

function generateX4Crossing(startX: number, startY: number, width: number = 205, height: number = 75): string[] {
  const endX = startX + width;
  const topY = startY - 22.5 ;
  const bottomY = startY + height;
  
  const controlPoint1X = startX + (width * 0.3);
  const controlPoint2X = startX + (width * 0.7);
  
  return [
    `M${startX},${topY} C${controlPoint1X},${topY} ${controlPoint2X-50},${bottomY} ${endX-60},${bottomY}`,
  ];
}
