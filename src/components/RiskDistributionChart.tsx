import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface RiskDistributionChartProps {
  data: {
    alto: number
    medio: number
    baixo: number
  }
}

const COLORS = {
  alto: '#ef4444',
  medio: '#f59e0b',
  baixo: '#22c55e'
}

export default function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const chartData = [
    { name: 'Alto Risco', value: data.alto, color: COLORS.alto },
    { name: 'Médio Risco', value: data.medio, color: COLORS.medio },
    { name: 'Baixo Risco', value: data.baixo, color: COLORS.baixo }
  ].filter(item => item.value > 0)

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{data.name}</p>
                    <p className="text-sm">
                      <span className="font-medium">{data.value} colaboradores</span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}