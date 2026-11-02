import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface RingProgressProps {
  percent: number
  size?: number
  stroke?: number
  color?: string
  trackClassName?: string
  children?: ReactNode
  className?: string
}

export function RingProgress({
  percent,
  size = 240,
  stroke = 12,
  color = 'var(--primary)',
  trackClassName = 'var(--surface-3)',
  children,
  className,
}: RingProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackClassName}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}
