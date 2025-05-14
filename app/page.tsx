"use client"

import { useState } from "react"
import RailwayGraph from "@/components/railway-graph"
import ColorChanger from "@/components/color-changer"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [selectedElement, setSelectedElement] = useState("")
  const [newColor, setNewColor] = useState("#FF0000")
  const [coloredElements, setColoredElements] = useState<Record<string, string>>({})
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [isCatenariasActive, setIsCatenariasActive] = useState(false)
  const [isCircuitosViasActive, setIsCircuitosViasActive] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedType, setSelectedType] = useState<string>("")

  const handleColorChange = () => {
    console.log({
      ...coloredElements,
      [selectedElement]: newColor,
    })
    if (selectedElement) {
      setColoredElements({
        ...coloredElements,
        [selectedElement]: newColor,
      })
    }
  }

  const handleMouseMove = (x: number, y: number) => {
    setMousePosition({ x, y })
  }

  return (
    <main className="flex min-h-screen flex-col items-start p-4 bg-gray-900">
      <h1 className="text-2xl font-bold text-white mb-4">Mímico</h1>

      <div className="flex flex-row gap-4">

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className={cn(
      "justify-start text-left font-normal",
      !selectedDate && "text-muted-foreground"
    )}>
      <CalendarIcon className="mr-2 h-4 w-4" />
      {selectedDate ? format(selectedDate, "PPP") : <span>Seleccionar fecha</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={ (date) => {
        setSelectedDate(date)
        if(isCatenariasActive) {
          setColoredElements({})
          setIsCatenariasActive(false)
          console.log("desactivando catenarias")
          return
        }
        if(isCircuitosViasActive) {
          setColoredElements({})
          setIsCircuitosViasActive(false)
          console.log("desactivando circuitos de vias")
          return
        }
      }
      }
      initialFocus
    />
  </PopoverContent>
</Popover>

<Select>
<SelectTrigger className="w-[180px] mb-4 text-white">
  <SelectValue placeholder="Seleccionar tipo" />
</SelectTrigger>
<SelectContent>
  <SelectItem value="comercial" onSelect={() => setSelectedType('comercial')}>COMERCIAL</SelectItem>
  <SelectItem value="non-comercial" onSelect={() => setSelectedType('non-comercial')}>NON COMERCIAL</SelectItem>
</SelectContent>
</Select>

</div>

      <div className="flex flex-row gap-4">

      <Button
        onClick={async () => {
          try {
            if(isCatenariasActive) {
              setColoredElements({})
              setIsCatenariasActive(false)
              return
            }
            const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
            const response = await fetch(`http://localhost:8000/catenarias?date=${formattedDate}&type=${selectedType}`)
            const data = await response.json()
            if(data.status === "error") {
              toast.error("No hay datos disponibles") 
              return
            }
            const newColoredElements = data.message.reduce((acc: Record<string, string>, catenaria: any) => {
              // Check if element already exists and toggle between active/inactive colors
              acc[catenaria.symbol] = "#ff5733"
              return acc
            }, {})
            setColoredElements({...coloredElements, ...newColoredElements})
            setIsCatenariasActive(!isCatenariasActive)
          } catch (error) {
            console.error('Failed to fetch labels:', error)
          }
        }
      }
        className={`font-bold py-2 px-4 rounded mb-4 ${
          isCatenariasActive
            ? "bg-green-500 hover:bg-green-700 text-white" // Active state
            : "bg-gray-500 hover:bg-gray-700 text-white"   // Inactive state
        }`}
      >
        {isCatenariasActive ? "Desactivar Catenarias" : "Activar Catenarias"}
      </Button>

      <Button
        onClick={async () => {
          try {
            if(isCircuitosViasActive) {
              setColoredElements({})
              setIsCircuitosViasActive(false)
              return
            }
            const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
            const response = await fetch(`http://localhost:8000/circuitos-vias?date=${formattedDate}&type=${selectedType}`)
            const data = await response.json()
            if(data.status === "error") {
              toast.error("No hay datos disponibles")
              return
            }
            const newColoredElements = data.message.reduce((acc: Record<string, string>, catenaria: any) => {
              // Check if element already exists and toggle between active/inactive colors
              acc[catenaria.symbol] = "#ff5733"
              return acc
            }, {})
            setColoredElements({...coloredElements, ...newColoredElements})
            setIsCircuitosViasActive(!isCircuitosViasActive)
          } catch (error) {
            console.error('Failed to fetch labels:', error)
          }
        }}
        className={`font-bold py-2 px-4 rounded mb-4 ${
          isCircuitosViasActive
            ? "bg-green-500 hover:bg-green-700 text-white" // Active state
            : "bg-gray-500 hover:bg-gray-700 text-white"   // Inactive state
        }`}
      >
        Circuitos de Vias
      </Button>
      </div>

      

      <div className="w-full bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
        <RailwayGraph coloredElements={coloredElements} onMouseMove={handleMouseMove} />
      </div>

      <ColorChanger
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        newColor={newColor}
        setNewColor={setNewColor}
        handleColorChange={handleColorChange}
        mousePosition={mousePosition}
      />
      <Toaster />
    </main>
  )
}
