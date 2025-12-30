import { useState } from 'react'
import { Card, Button, Input } from './ui'
import type { CheckInFormData, AlcoholIntake } from '@/types'

interface CheckInFormProps {
  onSubmit: (data: CheckInFormData) => Promise<void>
  initialData?: Partial<CheckInFormData>
  isLoading?: boolean
}

export function CheckInForm({ onSubmit, initialData, isLoading }: CheckInFormProps) {
  const [formData, setFormData] = useState<CheckInFormData>({
    weight: initialData?.weight || 0,
    bloating_level: initialData?.bloating_level || 3,
    energy: initialData?.energy || 3,
    alcohol_intake: initialData?.alcohol_intake || 'none',
    movement_done: initialData?.movement_done || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const alcoholOptions: { value: AlcoholIntake; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'high', label: 'High' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-5">
        <div>
          <Input
            type="number"
            label="Weight (kg)"
            step="0.1"
            min="30"
            max="300"
            value={formData.weight || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bloating Level
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bloating_level: level }))}
                className={`
                  flex-1 py-2 rounded-lg border-2 transition-colors font-medium
                  ${formData.bloating_level === level
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Energy Level
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, energy: level }))}
                className={`
                  flex-1 py-2 rounded-lg border-2 transition-colors font-medium
                  ${formData.energy === level
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alcohol Intake
          </label>
          <div className="flex gap-2">
            {alcoholOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, alcohol_intake: option.value }))}
                className={`
                  flex-1 py-2 rounded-lg border-2 transition-colors font-medium
                  ${formData.alcohol_intake === option.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.movement_done}
              onChange={(e) => setFormData(prev => ({ ...prev, movement_done: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">I moved today</span>
          </label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !formData.weight}>
          {isLoading ? 'Saving...' : 'Complete Check-in'}
        </Button>
      </Card>
    </form>
  )
}
