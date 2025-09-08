import React from 'react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  children
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1_000_000) {
        return `${(val / 1_000_000).toFixed(2)}M`
      }
      if (val >= 1_000) {
        return `${(val / 1_000).toFixed(2)}K`
      }
      return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }
    // If string, try to extract number and detect if it's money
    const isMoney = val.includes('$')
    const cleaned = val.replace(/[^0-9.\-]/g, '')
    const num = cleaned ? Number(cleaned) : NaN

    if (!isNaN(num) && cleaned.length > 0) {
      const formatted = formatValue(num)
      return isMoney ? `$${formatted.replace(/^\$/, '')}` : formatted
    }
    return val
  }

  

  const getTrendData = (direction: string) => {
    switch (direction) {
      case 'up':
        return {
          color: 'text-green-500',
          icon: '→',
          angle: '-rotate-45',
          bgGradient: 'from-green-50 to-green-50'
        }
      case 'down':
        return {
          color: 'text-rose-500',
          icon: '→',
          angle: 'rotate-45',
          bgGradient: 'from-rose-50 to-red-50'
        }
      default:
        return {
          color: 'text-slate-500',
          icon: '→',
          angle: '',
          bgGradient: 'from-slate-50 to-gray-50'
        }
    }
  }

  const getCardGradient = () => {
    const gradients = [
      'from-gray-50/80 to-indigo-50/80',
      'from-gray-50/80 to-teal-50/80',
      'from-gray-50/80 to-violet-50/80',
      'from-orange-50/80 to-amber-50/80',
      'from-pink-50/80 to-rose-50/80',
      'from-cyan-50/80 to-gray-50/80'
    ]

    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)

    return gradients[Math.abs(hash) % gradients.length]
  }

  const getIconStyle = () => {
    const styles = [
      { bg: 'bg-gray-500', text: 'text-white', shadow: 'shadow-gray-500/25' },
      { bg: 'bg-gray-500', text: 'text-white', shadow: 'shadow-gray-500/25' },
      { bg: 'bg-gray-500', text: 'text-white', shadow: 'shadow-gray-500/25' },
      { bg: 'bg-orange-500', text: 'text-white', shadow: 'shadow-orange-500/25' },
      { bg: 'bg-pink-500', text: 'text-white', shadow: 'shadow-pink-500/25' },
      { bg: 'bg-indigo-500', text: 'text-white', shadow: 'shadow-indigo-500/25' }
    ]

    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)

    return styles[Math.abs(hash) % styles.length]
  }

  const trendData = trend ? getTrendData(trend.direction) : null
  const cardGradient = getCardGradient()
  const iconStyle = getIconStyle()

  return (
    <div className={cn(
      'group relative overflow-hidden transition-all duration-500 ease-out',
      'bg-gradient-to-br', cardGradient,
      'border border-white/60 backdrop-blur-sm',
      'rounded-2xl p-6',
      'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/5',
      'hover:border-white/80',
      className
    )}>
      {/* Floating Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 transition-transform duration-700 group-hover:translate-x-12 group-hover:-translate-y-12" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10 transition-transform duration-700 group-hover:-translate-x-5 group-hover:translate-y-5" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-center space-x-4 flex-1">
          {icon && (
            <div className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300',
              'shadow-lg', iconStyle.shadow,
              iconStyle.bg, iconStyle.text,
              'group-hover:scale-110 group-hover:rotate-3'
            )}>
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })
                : icon}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-600 mb-1">
                {title}
              </h3>
              {/* Inline Trend Indicator in Header */}
              {trendData && (
                <div className={cn(
                  'flex items-center space-x-1.5 px-2.5 py-1 rounded-lg',
                  'bg-white/40 backdrop-blur-sm border border-white/30',
                  'text-xs font-semibold transition-all duration-300',
                  'group-hover:bg-white/60 group-hover:scale-105'
                )}>
                  <span className={cn('text-sm leading-none font-bold', trendData.angle, trendData.color)}>
                    {trendData.icon}
                  </span>
                  <span className={cn('font-bold', trendData.color)}>
                    {trend!.direction === 'up' ? '+' : trend!.direction === 'down' ? '-' : ''}
                    {Math.abs(trend!.value).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Value Display */}
      <div className="relative mb-2">
        <div className="flex items-end space-x-3 mb-2">
          <span className="text-4xl font-bold text-slate-800 leading-none tracking-tight">
            {formatValue(value)}
          </span>
          {trendData && (
            <span className={cn('text-sm font-semibold mb-1', trendData.color)}>
              {trend!.direction === 'up' ? '+' : trend!.direction === 'down' ? '-' : ''}
              {Math.abs(trend!.value).toFixed(2)}%
            </span>
          )}
        </div>

        {trend && (
          <p className="text-xs text-slate-500">
            {trend.label}
          </p>
        )}
      </div>

      {/* Visual Progress Indicator */}
      <div className="relative">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">Activity</span>
          <span className="font-semibold">
            {Math.min(Math.round((typeof value === 'number' ? value : 0) / 10), 100)}%
          </span>
        </div>
        <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out',
              'bg-gradient-to-r from-white/60 to-white/90',
              'shadow-sm'
            )}
            style={{
              width: `${Math.min((typeof value === 'number' ? value : 0) / 10, 100)}%`
            }}
          />
          {/* Animated glow effect */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
            style={{
              width: `${Math.min((typeof value === 'number' ? value : 0) / 10, 100)}%`
            }}
          />
        </div>
      </div>

      {/* Children Content */}
      {children && (
        <div className="mt-6 pt-4 border-t border-white/30">
          {children}
        </div>
      )}

      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
    </div>
  )
}

interface SimpleChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  type: 'bar' | 'pie' | 'line' | 'doughnut' | 'area'
  height?: number
  className?: string
}

export function SimpleChart({ data, type, height = 200, className }: SimpleChartProps) {
  // Safety checks
  if (!data || data.length === 0) {
    return <div className={cn('flex items-center justify-center', className)} style={{ height }}>No data available</div>
  }

  const validData = data.filter(d => typeof d.value === 'number' && !isNaN(d.value))
  if (validData.length === 0) {
    return <div className={cn('flex items-center justify-center', className)} style={{ height }}>No valid data</div>
  }

  const maxValue = Math.max(...validData.map(d => d.value))
  const width = 300 // Define a default width

  // Define a proper color palette
  const colorPalette = [
    '#3B82F6', // gray
    '#10B981', // gray
    '#8B5CF6', // gray
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1'  // Indigo
  ]

  if (type === 'bar') {
    return (
      <div className={cn('space-y-3', className)} style={{ height }}>
        {validData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color || colorPalette[index % colorPalette.length]
                }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-right">{item.value}</div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'pie') {
    const total = validData.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) {
      return <div className={cn('flex items-center justify-center', className)} style={{ height }}>No data to display</div>
    }

    let currentAngle = 0

    return (
      <div className={cn('flex items-center gap-6', className)}>
        <div className="relative" style={{ width: height, height }}>
          <svg width={height} height={height} className="transform -rotate-90">
            {validData.map((item, index) => {
              const angle = (item.value / total) * 360
              const radius = (height - 20) / 2
              const centerX = height / 2
              const centerY = height / 2

              const startAngle = (currentAngle * Math.PI) / 180
              const endAngle = ((currentAngle + angle) * Math.PI) / 180

              const x1 = centerX + radius * Math.cos(startAngle)
              const y1 = centerY + radius * Math.sin(startAngle)
              const x2 = centerX + radius * Math.cos(endAngle)
              const y2 = centerY + radius * Math.sin(endAngle)

              const largeArc = angle > 180 ? 1 : 0

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')

              const sliceColor = item.color || colorPalette[index % colorPalette.length]
              currentAngle += angle

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={sliceColor}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              )
            })}
          </svg>
        </div>

        <div className="space-y-2">
          {validData.map((item, index) => {
            const sliceColor = item.color || colorPalette[index % colorPalette.length]
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sliceColor }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium">({((item.value / total) * 100).toFixed(1)}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Line chart (simplified)
  if (type === 'line') {
    if (maxValue === 0) {
      return <div className={cn('flex items-center justify-center', className)} style={{ height }}>No data to display</div>
    }

    const points = validData.map((item, index) => {
      const x = validData.length > 1 ? (index / (validData.length - 1)) * (width - 40) + 20 : width / 2
      const y = height - 20 - ((item.value / maxValue) * (height - 40))
      return `${x},${y}`
    }).join(' ')

    const lineColor = validData[0]?.color || colorPalette[0]

    return (
      <div className={className} style={{ height }}>
        <svg width={width} height={height}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" opacity="0.3" />

          {/* Line */}
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-sm"
          />

          {/* Points */}
          {validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * (width - 40) + 20 : width / 2
            const y = height - 20 - ((item.value / maxValue) * (height - 40))
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={lineColor}
                stroke="white"
                strokeWidth="2"
                className="hover:r-6 transition-all duration-200 cursor-pointer drop-shadow-sm"
              />
            )
          })}
        </svg>
      </div>
    )
  }

  return null
}

interface SkeletonLoaderProps {
  type?: 'dashboard' | 'table' | 'cards' | 'detailed'
  className?: string
}

export function SkeletonLoader({ type = 'dashboard', className }: SkeletonLoaderProps) {
  const shimmerAnimation = `
    relative overflow-hidden
    before:absolute before:inset-0 
    before:-translate-x-full before:animate-[shimmer_2s_infinite] 
    before:bg-gradient-to-r before:from-transparent 
    before:via-white/60 before:to-transparent
  `

  if (type === 'dashboard') {
    return (
      <div className={cn('p-8 space-y-8', className)}>
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className={cn(
              'h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl w-80',
              shimmerAnimation
            )} />
            <div className={cn(
              'h-5 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded-lg w-96',
              shimmerAnimation
            )} />
          </div>
          <div className="flex gap-3">
            <div className={cn(
              'h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl',
              shimmerAnimation
            )} />
            <div className={cn(
              'h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl',
              shimmerAnimation
            )} />
          </div>
        </div>

        {/* Enhanced Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="group relative bg-gradient-to-br from-white via-gray-50/30 to-white rounded-3xl border border-gray-200/60 p-7 overflow-hidden hover:shadow-xl transition-all duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-100/40 to-transparent rounded-full blur-3xl transform translate-x-16 -translate-y-8" />
              </div>

              <div className="relative z-10 space-y-4">
                {/* Icon + Title Section */}
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200',
                    shimmerAnimation
                  )} />
                  <div className="flex-1 space-y-2">
                    <div className={cn(
                      'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-24',
                      shimmerAnimation
                    )} />
                    <div className={cn(
                      'h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded-md w-32',
                      shimmerAnimation
                    )} />
                  </div>
                </div>

                {/* Value Section */}
                <div className="flex items-baseline gap-3">
                  <div className={cn(
                    'h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl w-20',
                    shimmerAnimation
                  )} />
                  <div className={cn(
                    'h-6 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full',
                    shimmerAnimation
                  )} />
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn(
                      'h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-3/4',
                      shimmerAnimation
                    )} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[85, 67, 92].map((_, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full bg-gradient-to-r',
                              idx === 0 ? 'from-gray-200 via-gray-300 to-gray-200' :
                                idx === 1 ? 'from-gray-200 via-gray-300 to-gray-200' :
                                  'from-gray-200 via-gray-300 to-gray-200',
                              shimmerAnimation
                            )}
                            style={{ width: `${70 + idx * 5}%` }}
                          />
                        </div>
                        <div className={cn(
                          'h-2 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded-sm w-8 mx-auto',
                          shimmerAnimation
                        )} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl',
                  shimmerAnimation
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200/60">
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg',
                    shimmerAnimation,
                    i === 0 ? 'w-3/4' : i === 1 ? 'w-5/6' : 'w-2/3'
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200/60">
            {[...Array(8)].map((_, rowIndex) => (
              <div key={rowIndex} className="px-6 py-5 hover:bg-gray-50/30 transition-colors duration-200">
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Payment Method Column */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg',
                      shimmerAnimation
                    )} />
                    <div className="space-y-2">
                      <div className={cn(
                        'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-24',
                        shimmerAnimation
                      )} />
                      <div className={cn(
                        'h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded-sm w-16',
                        shimmerAnimation
                      )} />
                    </div>
                  </div>

                  {/* User Column */}
                  <div className="space-y-2">
                    <div className={cn(
                      'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-20',
                      shimmerAnimation
                    )} />
                    <div className={cn(
                      'h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded-sm w-28',
                      shimmerAnimation
                    )} />
                  </div>

                  {/* Details Column */}
                  <div className="space-y-2">
                    <div className={cn(
                      'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-18',
                      shimmerAnimation
                    )} />
                    <div className={cn(
                      'h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded-sm w-14',
                      shimmerAnimation
                    )} />
                  </div>

                  {/* Status Column */}
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full',
                      shimmerAnimation
                    )} />
                    <div className={cn(
                      'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-12',
                      shimmerAnimation
                    )} />
                  </div>

                  {/* Transactions Column */}
                  <div className="text-center space-y-1">
                    <div className={cn(
                      'h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-8 mx-auto',
                      shimmerAnimation
                    )} />
                    <div className={cn(
                      'h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded-sm w-10 mx-auto',
                      shimmerAnimation
                    )} />
                  </div>

                  {/* Date Column */}
                  <div className={cn(
                    'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-16',
                    shimmerAnimation
                  )} />

                  {/* Actions Column */}
                  <div className={cn(
                    'w-8 h-8 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full ml-auto',
                    shimmerAnimation
                  )} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-200/60 flex items-center justify-between">
            <div className={cn(
              'h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-48',
              shimmerAnimation
            )} />
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg',
                    shimmerAnimation
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Add other skeleton types here (table, cards, detailed) if needed
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

interface DataTableProps {
  data: Array<Record<string, any>>
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
    sortable?: boolean
  }>
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  className?: string
}

export function DataTable({ data, columns, pagination, className }: DataTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-gray-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m2-1h6.5"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">No data available</p>
                      <p className="text-xs text-gray-500">There are no records to display at this time.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
