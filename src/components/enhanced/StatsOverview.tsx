import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Card from '../ui/Card'

interface StatsOverviewProps {
  totalEmployees: number
  filteredCount: number
  riskDistribution: {
    alto: number
    medio: number
    baixo: number
  }
}

export default function StatsOverview({ totalEmployees, filteredCount, riskDistribution }: StatsOverviewProps) {
  const riskPercentages = {
    alto: totalEmployees > 0 ? (riskDistribution.alto / totalEmployees) * 100 : 0,
    medio: totalEmployees > 0 ? (riskDistribution.medio / totalEmployees) * 100 : 0,
    baixo: totalEmployees > 0 ? (riskDistribution.baixo / totalEmployees) * 100 : 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card padding="sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{filteredCount}</div>
          <div className="text-sm text-gray-600">de {totalEmployees} colaboradores</div>
        </div>
      </Card>

      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-danger-600">{riskDistribution.alto}</div>
            <div className="text-xs text-gray-600">Alto Risco</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-danger-600">
              {riskPercentages.alto.toFixed(1)}%
            </div>
            <TrendingUp className="h-4 w-4 text-danger-500 ml-auto" />
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-warning-600">{riskDistribution.medio}</div>
            <div className="text-xs text-gray-600">Médio Risco</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-warning-600">
              {riskPercentages.medio.toFixed(1)}%
            </div>
            <Minus className="h-4 w-4 text-warning-500 ml-auto" />
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-success-600">{riskDistribution.baixo}</div>
            <div className="text-xs text-gray-600">Baixo Risco</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-success-600">
              {riskPercentages.baixo.toFixed(1)}%
            </div>
            <TrendingDown className="h-4 w-4 text-success-500 ml-auto" />
          </div>
        </div>
      </Card>
    </div>
  )
}