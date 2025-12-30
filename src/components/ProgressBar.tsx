interface ProgressBarProps {
  value: number // 0-1
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'blue' | 'amber'
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = 'md',
  color = 'primary',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value * 100))

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const colors = {
    primary: 'bg-gradient-to-r from-primary-500 to-secondary-500',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
  }

  return (
    <div className="space-y-1">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercentage && <span className="text-gray-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-dark-800 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
