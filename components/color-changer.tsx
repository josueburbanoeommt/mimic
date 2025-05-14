"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ColorChangerProps {
  selectedElement: string
  setSelectedElement: (value: string) => void
  newColor: string
  setNewColor: (value: string) => void
  handleColorChange: () => void
  mousePosition: { x: number; y: number } | null
}

export default function ColorChanger({
  selectedElement,
  setSelectedElement,
  newColor,
  setNewColor,
  handleColorChange,
  mousePosition,
}: ColorChangerProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl bg-gray-800 p-4 rounded-lg">
      <div className="flex-1">
        <label htmlFor="element-id" className="block text-sm font-medium text-gray-300 mb-1">
          Element ID (e.g., C5(2), CV154, A128)
        </label>
        <Input
          id="element-id"
          value={selectedElement}
          onChange={(e) => setSelectedElement(e.target.value)}
          placeholder="Enter element ID"
          className="bg-gray-700 text-white border-gray-600"
        />
        <div className="mt-1 text-xs text-gray-400">
          Try composite IDs: COMPOSITE1, COMPOSITE2, COMPOSITE3, SIGNAL_GROUP1
        </div>
      </div>

      <div className="w-24">
        <label htmlFor="color-picker" className="block text-sm font-medium text-gray-300 mb-1">
          Color
        </label>
        <Input
          id="color-picker"
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="h-10 p-1 bg-gray-700 border-gray-600"
        />
      </div>

      <div className="flex items-end">
        <Button onClick={handleColorChange} className="bg-blue-600 hover:bg-blue-700 text-white">
          Change Color
        </Button>
        {mousePosition && (
          <div className="ml-4 text-gray-300 text-sm">
            Position: x: {mousePosition.x}, y: {mousePosition.y}
          </div>
        )}
      </div>
    </div>
  )
}
