import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DepartmentMetricsChartProps {
  data: Array<{
    department: string
    count: number
    averageScore: number
    highRisk: number
  }>
}

export default function DepartmentMetricsChart({ data }: DepartmentMetricsChartProps) {
  const chartData = data.map(item => ({
    ...item,
    department: item.department.length > 15 
      ? item.department.substring(0, 15) + '...' 
      : item.department
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="department" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{data.department}</p>
                    <p className="text-sm text-gray-600">Total: {data.count} colaboradores</p>
                    <p className="text-sm text-gray-600">Score médio: {data.averageScore.toFixed(1)}</p>
                    <p className="text-sm text-danger-600">Alto risco: {data.highRisk}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Bar 
            dataKey="count" 
            fill="#0ea5e9" 
            name="Total de Colaboradores"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="highRisk" 
            fill="#ef4444" 
            name="Alto Risco"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}