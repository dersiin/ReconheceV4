import React from 'react'
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import Card from '../ui/Card'
import Tooltip from '../ui/Tooltip'

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  description?: string
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  description 
}: MetricCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <p className={cn(
              'text-sm font-medium',
              className?.includes('text-white') ? 'text-white/80' : 'text-gray-600'
            )}>
              {title}
            </p>
            {description && (
              <Tooltip content={description}>
                <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                  ?
                </div>
              </Tooltip>
            )}
          </div>
          
          <p className={cn(
            'text-3xl font-bold mb-2',
            className?.includes('text-white') ? 'text-white' : 'text-gray-900'
          )}>
            {value}
          </p>
          
          {trend && (
            <div className={cn(
              'flex items-center text-sm font-medium',
              trend.isPositive 
                ? (className?.includes('text-white') ? 'text-white/90' : 'text-success-600')
                : (className?.includes('text-white') ? 'text-white/90' : 'text-danger-600')
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend.value)}% vs mês anterior
            </div>
          )}
        </div>
        
        <div className={cn(
          'p-3 rounded-lg',
          className?.includes('text-white') 
            ? 'bg-white/20' 
            : 'bg-gray-100'
        )}>
          <Icon className={cn(
            'h-6 w-6',
            className?.includes('text-white') ? 'text-white' : 'text-gray-600'
          )} />
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-16 -translate-y-16" />
      </div>
    </Card>
  )
}