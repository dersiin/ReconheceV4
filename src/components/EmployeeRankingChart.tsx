import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Employee } from '../types'

interface EmployeeRankingChartProps {
  employees: Employee[]
}

export default function EmployeeRankingChart({ employees }: EmployeeRankingChartProps) {
  const data = employees.map(emp => ({
    name: emp.nome?.split(' ')[0] || 'N/A',
    score: emp.score,
    fullName: emp.nome,
    area: emp.area
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
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
                    <p className="font-semibold text-gray-900">{data.fullName}</p>
                    <p className="text-sm text-gray-600">{data.area}</p>
                    <p className="text-sm">
                      <span className="text-primary-600 font-medium">Score: {data.score.toFixed(1)}</span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar 
            dataKey="score" 
            fill="#0ea5e9"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}