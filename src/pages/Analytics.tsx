import React, { useEffect, useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Target,
  Activity,
  Zap,
  Brain,
  PieChart,
  LineChart,
  Calendar,
  Filter,
  Eye,
  Download
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import MetricCard from '../components/enhanced/MetricCard'
import EmployeeRankingChart from '../components/EmployeeRankingChart'
import RiskDistributionChart from '../components/RiskDistributionChart'
import DepartmentMetricsChart from '../components/DepartmentMetricsChart'
import PredictiveAnalytics from '../components/enhanced/PredictiveAnalytics'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'

export default function Analytics() {
  const { employees, fetchEmployees } = useStore()
  const [timeRange, setTimeRange] = useState('30')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [analysisType, setAnalysisType] = useState('overview')

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Dados simulados para tendências temporais
  const trendData = [
    { month: 'Jan', score: 320, retention: 85, satisfaction: 78, productivity: 82 },
    { month: 'Fev', score: 335, retention: 87, satisfaction: 82, productivity: 85 },
    { month: 'Mar', score: 342, retention: 89, satisfaction: 85, productivity: 88 },
    { month: 'Abr', score: 338, retention: 86, satisfaction: 83, productivity: 86 },
    { month: 'Mai', score: 355, retention: 91, satisfaction: 87, productivity: 90 },
    { month: 'Jun', score: 368, retention: 93, satisfaction: 89, productivity: 92 },
    { month: 'Jul', score: 375, retention: 94, satisfaction: 91, productivity: 94 },
    { month: 'Ago', score: 382, retention: 95, satisfaction: 92, productivity: 95 },
    { month: 'Set', score: 378, retention: 94, satisfaction: 90, productivity: 93 },
    { month: 'Out', score: 385, retention: 96, satisfaction: 93, productivity: 96 },
    { month: 'Nov', score: 392, retention: 97, satisfaction: 94, productivity: 97 },
    { month: 'Dez', score: 398, retention: 98, satisfaction: 95, productivity: 98 }
  ]

  // Análise de correlações
  const correlationData = [
    { factor: 'Tempo na Empresa', correlation: 0.72, impact: 'Alto', description: 'Colaboradores com mais tempo tendem a ter scores maiores' },
    { factor: 'Performance', correlation: 0.89, impact: 'Muito Alto', description: 'Forte correlação entre avaliação e score final' },
    { factor: 'Satisfação', correlation: 0.65, impact: 'Alto', description: 'Sentimento positivo impacta diretamente no engajamento' },
    { factor: 'Absenteísmo', correlation: -0.43, impact: 'Médio', description: 'Faltas frequentes reduzem o score de reconhecimento' },
    { factor: 'Advertências', correlation: -0.67, impact: 'Alto', description: 'Histórico disciplinar afeta negativamente a avaliação' },
    { factor: 'Formação', correlation: 0.58, impact: 'Médio', description: 'Maior escolaridade correlaciona com melhor performance' }
  ]

  // Métricas calculadas
  const totalEmployees = employees.length
  const highRiskEmployees = employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'alto').length
  const averageScore = employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.score, 0) / employees.length : 0
  const retentionRate = totalEmployees > 0 ? ((totalEmployees - highRiskEmployees) / totalEmployees) * 100 : 0

  const topPerformers = employees.filter(emp => emp.score >= 400).length
  const anomalousAbsenteeism = employees.filter(emp => emp.isAbsenteismoAnomalo).length
  const negativeSentiment = employees.filter(emp => emp.scoreSentimento > 0.6).length

  const departments = [...new Set(employees.map(emp => emp.area).filter(Boolean))]
  const filteredEmployees = selectedDepartment === 'all' 
    ? employees 
    : employees.filter(emp => emp.area === selectedDepartment)

  const riskDistribution = {
    alto: filteredEmployees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'alto').length,
    medio: filteredEmployees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'médio').length,
    baixo: filteredEmployees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'baixo').length,
  }

  const departmentMetrics = employees.reduce((acc, emp) => {
    const dept = emp.area || 'Não definido'
    if (!acc[dept]) {
      acc[dept] = { employees: [], totalScore: 0 }
    }
    acc[dept].employees.push(emp)
    acc[dept].totalScore += emp.score
    return acc
  }, {} as Record<string, { employees: any[], totalScore: number }>)

  const departmentData = Object.entries(departmentMetrics).map(([dept, data]) => ({
    department: dept,
    count: data.employees.length,
    averageScore: data.totalScore / data.employees.length,
    highRisk: data.employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'alto').length
  }))

  // Dados para análise de salários
  const salaryAnalysis = employees.reduce((acc, emp) => {
    const range = emp.salario < 4000 ? 'Até R$ 4k' :
                  emp.salario < 7000 ? 'R$ 4k - R$ 7k' :
                  emp.salario < 10000 ? 'R$ 7k - R$ 10k' : 'Acima R$ 10k'
    
    if (!acc[range]) acc[range] = { count: 0, avgScore: 0, totalScore: 0 }
    acc[range].count++
    acc[range].totalScore += emp.score
    acc[range].avgScore = acc[range].totalScore / acc[range].count
    return acc
  }, {} as Record<string, { count: number, avgScore: number, totalScore: number }>)

  const salaryData = Object.entries(salaryAnalysis).map(([range, data]) => ({
    range,
    count: data.count,
    avgScore: data.avgScore
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Avançado</h1>
            <p className="text-purple-100">
              Insights preditivos e análises estratégicas com IA generativa
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{(averageScore).toFixed(1)}</div>
              <div className="text-sm text-purple-200">Score Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{retentionRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-200">Retenção</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{topPerformers}</div>
              <div className="text-sm text-purple-200">Top Performers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <Select
            label="Período de Análise"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[
              { value: '7', label: 'Últimos 7 dias' },
              { value: '30', label: 'Últimos 30 dias' },
              { value: '90', label: 'Últimos 3 meses' },
              { value: '365', label: 'Último ano' }
            ]}
          />
          <Select
            label="Departamento"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os departamentos' },
              ...departments.map(dept => ({ value: dept, label: dept }))
            ]}
          />
          <Select
            label="Tipo de Análise"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            options={[
              { value: 'overview', label: 'Visão Geral' },
              { value: 'predictive', label: 'Análise Preditiva' },
              { value: 'correlation', label: 'Correlações' },
              { value: 'salary', label: 'Análise Salarial' }
            ]}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="primary" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Índice de Engajamento"
          value={`${(averageScore / 5).toFixed(1)}%`}
          icon={Activity}
          trend={{ value: 8.2, isPositive: true }}
          className="gradient-success text-white"
        />
        <MetricCard
          title="Risco Preditivo"
          value={`${((highRiskEmployees / totalEmployees) * 100).toFixed(1)}%`}
          icon={AlertTriangle}
          trend={{ value: 3.1, isPositive: false }}
          className="gradient-warning text-white"
        />
        <MetricCard
          title="Anomalias Detectadas"
          value={anomalousAbsenteeism.toString()}
          icon={Zap}
          trend={{ value: 12.5, isPositive: false }}
          className="gradient-danger text-white"
        />
        <MetricCard
          title="Satisfação Geral"
          value={`${(100 - (negativeSentiment / totalEmployees) * 100).toFixed(1)}%`}
          icon={Target}
          trend={{ value: 5.7, isPositive: true }}
          className="gradient-primary text-white"
        />
      </div>

      {/* Conteúdo baseado no tipo de análise */}
      {analysisType === 'predictive' && (
        <PredictiveAnalytics employees={employees} />
      )}

      {analysisType === 'overview' && (
        <>
          {/* Tendências Temporais */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Tendências de Performance</h3>
              </div>
              <Badge variant="info" size="sm">
                <Brain className="h-3 w-3 mr-1" />
                IA Preditiva
              </Badge>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
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
                                {entry.name}: {entry.value}
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
                    dataKey="score" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#scoreGradient)"
                    name="Score Médio"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="retention" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#retentionGradient)"
                    name="Taxa de Retenção (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gráficos Comparativos */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Distribuição de Risco */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Distribuição de Risco</h3>
                <Badge variant="neutral" size="sm">
                  {selectedDepartment === 'all' ? 'Geral' : selectedDepartment}
                </Badge>
              </div>
              <RiskDistributionChart data={riskDistribution} />
            </Card>

            {/* Top Performers */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>
              <EmployeeRankingChart employees={filteredEmployees.slice(0, 10)} />
            </Card>
          </div>

          {/* Métricas Departamentais */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance por Departamento</h3>
            <DepartmentMetricsChart data={departmentData} />
          </Card>
        </>
      )}

      {analysisType === 'correlation' && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Target className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Análise de Correlações</h3>
          </div>
          <div className="space-y-4">
            {correlationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    Math.abs(item.correlation) > 0.7 ? 'bg-success-500' :
                    Math.abs(item.correlation) > 0.5 ? 'bg-warning-500' : 'bg-danger-500'
                  }`} />
                  <div>
                    <span className="font-medium text-gray-900">{item.factor}</span>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      item.correlation > 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Correlação</div>
                  </div>
                  <Badge 
                    variant={
                      item.impact === 'Muito Alto' ? 'danger' :
                      item.impact === 'Alto' ? 'warning' : 'info'
                    } 
                    size="sm"
                  >
                    {item.impact}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {analysisType === 'salary' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise Salarial por Faixa</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{label}</p>
                            <p className="text-sm text-gray-600">Colaboradores: {payload[0]?.payload?.count}</p>
                            <p className="text-sm text-primary-600">Score médio: {payload[1]?.value?.toFixed(1)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" name="Quantidade" />
                  <Bar dataKey="avgScore" fill="#22c55e" name="Score Médio" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Insights Salariais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="font-medium text-primary-900 mb-2">💰 Correlação Salário-Performance</h4>
                <p className="text-sm text-primary-700">
                  Colaboradores com salários mais altos tendem a ter scores de performance superiores, 
                  indicando alinhamento entre remuneração e contribuição.
                </p>
              </div>
              <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
                <h4 className="font-medium text-warning-900 mb-2">⚖️ Equidade Salarial</h4>
                <p className="text-sm text-warning-700">
                  Análise sugere oportunidades de ajuste salarial para colaboradores de alta performance 
                  em faixas salariais mais baixas.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Insights da IA */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Insights da IA</h3>
          <Badge variant="info" size="sm">Powered by AI</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="font-medium text-primary-900 mb-2">🎯 Oportunidade Identificada</h4>
            <p className="text-sm text-primary-700">
              Colaboradores com 2-3 anos de empresa apresentam maior risco de saída. 
              Recomenda-se implementar programa de desenvolvimento de carreira específico para este grupo.
            </p>
          </div>
          <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
            <h4 className="font-medium text-warning-900 mb-2">⚠️ Alerta Preditivo</h4>
            <p className="text-sm text-warning-700">
              Tendência de aumento no absenteísmo detectada no departamento {departmentData[0]?.department}. 
              Investigação recomendada para identificar causas.
            </p>
          </div>
          <div className="p-4 bg-success-50 rounded-lg border border-success-200">
            <h4 className="font-medium text-success-900 mb-2">✅ Padrão Positivo</h4>
            <p className="text-sm text-success-700">
              Colaboradores com feedback positivo nas avaliações mostram 85% menos 
              probabilidade de saída nos próximos 6 meses.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2">🔮 Previsão</h4>
            <p className="text-sm text-purple-700">
              Com base nos padrões atuais, espera-se um aumento de 12% na retenção 
              geral nos próximos 3 meses com as ações implementadas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}