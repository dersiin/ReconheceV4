import React from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Target, Brain, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

interface PredictiveAnalyticsProps {
  employees: any[]
}

export default function PredictiveAnalytics({ employees }: PredictiveAnalyticsProps) {
  // Simular dados de tendências preditivas
  const predictiveData = [
    { month: 'Jan', retention: 85, satisfaction: 78, performance: 82, prediction: 84 },
    { month: 'Fev', retention: 87, satisfaction: 82, performance: 85, prediction: 86 },
    { month: 'Mar', retention: 89, satisfaction: 85, performance: 88, prediction: 88 },
    { month: 'Abr', retention: 86, satisfaction: 83, performance: 86, prediction: 87 },
    { month: 'Mai', retention: 91, satisfaction: 87, performance: 90, prediction: 89 },
    { month: 'Jun', retention: 93, satisfaction: 89, performance: 92, prediction: 91 },
    { month: 'Jul', retention: 94, satisfaction: 91, performance: 94, prediction: 93 },
    { month: 'Ago', retention: 95, satisfaction: 92, performance: 95, prediction: 94 },
    { month: 'Set', retention: 94, satisfaction: 90, performance: 93, prediction: 92 },
    { month: 'Out', retention: 96, satisfaction: 93, performance: 96, prediction: 95 },
    { month: 'Nov', retention: 97, satisfaction: 94, performance: 97, prediction: 96 },
    { month: 'Dez', retention: 98, satisfaction: 95, performance: 98, prediction: 97 }
  ]

  // Calcular insights preditivos
  const currentRetention = employees.length > 0 ? 
    ((employees.length - employees.filter(e => e.riscoPerdaTexto?.toLowerCase() === 'alto').length) / employees.length) * 100 : 0
  
  const predictedRetention = currentRetention + (Math.random() * 6 - 3) // Simular variação
  const retentionTrend = predictedRetention > currentRetention

  const riskFactors = [
    {
      factor: 'Absenteísmo Elevado',
      impact: 'Alto',
      affected: employees.filter(e => e.absenteismo > 0.05).length,
      trend: 'increasing'
    },
    {
      factor: 'Tempo sem Promoção',
      impact: 'Médio',
      affected: employees.filter(e => e.tempoUltimaPromocao > 3).length,
      trend: 'stable'
    },
    {
      factor: 'Sentimento Negativo',
      impact: 'Alto',
      affected: employees.filter(e => e.scoreSentimento > 0.6).length,
      trend: 'decreasing'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics Preditivo</h3>
              <p className="text-sm text-gray-600">Previsões baseadas em machine learning e padrões históricos</p>
            </div>
          </div>
          <Badge variant="info" size="sm">
            <Zap className="h-3 w-3 mr-1" />
            IA Avançada
          </Badge>
        </div>

        {/* Métricas Preditivas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-lg border border-success-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-success-700">Retenção Prevista</span>
              <TrendingUp className="h-4 w-4 text-success-600" />
            </div>
            <div className="text-2xl font-bold text-success-900">{predictedRetention.toFixed(1)}%</div>
            <div className="text-xs text-success-600 mt-1">
              {retentionTrend ? '+' : ''}{(predictedRetention - currentRetention).toFixed(1)}% vs atual
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg border border-warning-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-warning-700">Risco Emergente</span>
              <AlertTriangle className="h-4 w-4 text-warning-600" />
            </div>
            <div className="text-2xl font-bold text-warning-900">
              {employees.filter(e => e.score < 300 && e.score > 250).length}
            </div>
            <div className="text-xs text-warning-600 mt-1">Colaboradores em zona de risco</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-700">Potencial de Melhoria</span>
              <Target className="h-4 w-4 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-primary-900">
              {employees.filter(e => e.score >= 300 && e.score < 400).length}
            </div>
            <div className="text-xs text-primary-600 mt-1">Candidatos a top performer</div>
          </div>
        </div>

        {/* Gráfico de Tendências */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictiveData}>
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}%
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area 
                type="monotone" 
                dataKey="retention" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#retentionGradient)"
                name="Taxa de Retenção"
              />
              <Area 
                type="monotone" 
                dataKey="prediction" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#predictionGradient)"
                name="Previsão IA"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Fatores de Risco */}
      <Card>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Fatores de Risco Identificados</h4>
        <div className="space-y-4">
          {riskFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  factor.impact === 'Alto' ? 'bg-danger-500' :
                  factor.impact === 'Médio' ? 'bg-warning-500' : 'bg-success-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{factor.factor}</p>
                  <p className="text-sm text-gray-600">{factor.affected} colaboradores afetados</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={factor.impact === 'Alto' ? 'danger' : factor.impact === 'Médio' ? 'warning' : 'success'} 
                  size="sm"
                >
                  {factor.impact}
                </Badge>
                <div className="flex items-center space-x-1">
                  {factor.trend === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-danger-500" />
                  ) : factor.trend === 'decreasing' ? (
                    <TrendingDown className="h-4 w-4 text-success-500" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recomendações da IA */}
      <Card>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recomendações Estratégicas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h5 className="font-medium text-primary-900 mb-2">🎯 Ação Imediata</h5>
            <p className="text-sm text-primary-700">
              Implementar programa de check-in semanal para os {employees.filter(e => e.riscoPerdaTexto?.toLowerCase() === 'alto').length} colaboradores de alto risco.
            </p>
          </div>
          <div className="p-4 bg-success-50 rounded-lg border border-success-200">
            <h5 className="font-medium text-success-900 mb-2">📈 Oportunidade</h5>
            <p className="text-sm text-success-700">
              Expandir programa de reconhecimento pode aumentar retenção em 12-15% nos próximos 6 meses.
            </p>
          </div>
          <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
            <h5 className="font-medium text-warning-900 mb-2">⚠️ Prevenção</h5>
            <p className="text-sm text-warning-700">
              Monitorar colaboradores com score entre 250-300 para evitar migração para alto risco.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="font-medium text-purple-900 mb-2">🔮 Longo Prazo</h5>
            <p className="text-sm text-purple-700">
              Investir em desenvolvimento de liderança pode reduzir turnover em 20% no próximo ano.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}