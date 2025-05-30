"use client"

import { useState } from "react"
import RailwayGraph from "@/components/railway-graph"
import ColorChanger from "@/components/color-changer"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function Home() {

  const [coloredElements, setColoredElements] = useState<Record<string, string>>({})
  const [isCatenariasActive, setIsCatenariasActive] = useState(false)
  const [isCircuitosViasActive, setIsCircuitosViasActive] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedSchedule, setSelectedSchedule] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Calculate date range
  const today = new Date()
  const oneWeekBefore = subDays(today, 30)
  const oneWeekAfter = addDays(today, 30)

  const handleToggling = async (isElementActive: boolean, type:string, fnSetActive: (active: boolean) => void, fnSetColoredElements: (elements: Record<string, string>) => void, color: string) => {
    try {
      if(isElementActive) {
        setColoredElements({})
        fnSetActive(false)
        return
      }

      setIsLoading(true)
      const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
      const response = await fetch(`/api/railway?date=${formattedDate}&schedule=${selectedSchedule}&type=${type}`)
      const data = await response.json()
      
      if(!data.success) {
        toast.error("No hay datos disponibles") 
        return
      }

      // Gather all unique CV values from the response data
      const allElements = new Set<string>(data.data.flat())
      console.log(allElements)

      // Create colored elements object with red color for each CV
      const newColoredElements = Array.from(allElements).reduce((acc: Record<string, string>, element: string) => {
        acc[element] = color
        return acc
      }, {})

      fnSetColoredElements({...coloredElements, ...newColoredElements})
      fnSetActive(!isElementActive)
    } catch (error) {
      console.error('Failed to fetch labels:', error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start p-4 bg-gray-900">
      <LoadingOverlay isLoading={isLoading} />
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
              onSelect={(date) => {
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
              }}
              disabled={(date) => {
                return date < oneWeekBefore || date > oneWeekAfter
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
          <SelectTrigger className="w-[180px] mb-4 text-white">
            <SelectValue placeholder="Seleccionar horario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comercial">COMERCIAL</SelectItem>
            <SelectItem value="no comercial">NO COMERCIAL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-row gap-4">
        <Button
          disabled={isLoading || !selectedDate || !selectedSchedule}
          onClick={() => handleToggling(isCircuitosViasActive, "CV", setIsCircuitosViasActive, setColoredElements, "#e97132")}
          className={`font-bold py-2 px-4 rounded mb-4 ${
            isCircuitosViasActive
              ? "bg-blue-500 hover:bg-blue-700 text-white"
              : "bg-gray-500 hover:bg-gray-700 text-white"
          }`}
        >
          {!isCircuitosViasActive ? "Mostrar Circuitos de vía" : "Ocultar Circuitos de vía"}
        </Button>

        <Button
          disabled={isLoading || !selectedDate || !selectedSchedule}
          onClick={() => handleToggling(isCatenariasActive, "Catenaria Desenergizada:", setIsCatenariasActive, setColoredElements, "#00FF00")}
          className={`font-bold py-2 px-4 rounded mb-4 ${
            isCatenariasActive
              ? "bg-blue-500 hover:bg-blue-700 text-white"
              : "bg-gray-500 hover:bg-gray-700 text-white"
          }`}
        >
          {!isCatenariasActive ? "Mostrar Catenarias" : "Ocultar Catenarias"}
        </Button>
      </div>

      <div className="flex flex-row gap-4">
        <span className="text-white">
          {`Monstrando: ${isCatenariasActive ? "Catenarias" : isCircuitosViasActive ? "Circuitos de vía" : "Ninguno"}`}
          {` | Fecha: ${selectedDate ? format(selectedDate, "PPP") : "Seleccionar fecha"}`}
          {` | Horario: ${selectedSchedule}`}
          
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
        <RailwayGraph coloredElements={coloredElements} />
      </div>

      <Toaster />
    </main>
  )
}
