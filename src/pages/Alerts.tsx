import React, { useEffect, useState } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  TrendingDown,
  Activity,
  Target,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Check,
  X,
  Calendar
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { format } from 'date-fns'

interface Alert {
  id: string
  type: 'high_risk' | 'anomaly' | 'performance' | 'retention' | 'sentiment'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  employeeId?: number
  employeeName?: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
  department?: string
}

export default function Alerts() {
  const { employees, fetchEmployees } = useStore()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    if (employees.length > 0) {
      generateAlerts()
    }
  }, [employees])

  const generateAlerts = () => {
    const generatedAlerts: Alert[] = []

    // Alertas de alto risco
    employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'alto').forEach(emp => {
      generatedAlerts.push({
        id: `risk-${emp.id}`,
        type: 'high_risk',
        severity: 'high',
        title: 'Colaborador de Alto Risco',
        message: `${emp.nome} apresenta alto risco de saída. Score atual: ${emp.score.toFixed(1)}`,
        employeeId: emp.id,
        employeeName: emp.nome,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        isRead: Math.random() > 0.3,
        actionRequired: true,
        department: emp.area
      })
    })

    // Alertas de absenteísmo anômalo
    employees.filter(emp => emp.isAbsenteismoAnomalo).forEach(emp => {
      generatedAlerts.push({
        id: `anomaly-${emp.id}`,
        type: 'anomaly',
        severity: 'medium',
        title: 'Padrão de Absenteísmo Anômalo',
        message: `Detectado padrão irregular de faltas para ${emp.nome}`,
        employeeId: emp.id,
        employeeName: emp.nome,
        timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        isRead: Math.random() > 0.5,
        actionRequired: true,
        department: emp.area
      })
    })

    // Alertas de sentimento negativo
    employees.filter(emp => emp.scoreSentimento > 0.6).forEach(emp => {
      generatedAlerts.push({
        id: `sentiment-${emp.id}`,
        type: 'sentiment',
        severity: 'medium',
        title: 'Sentimento Negativo Detectado',
        message: `Análise de sentimento indica insatisfação em ${emp.nome}`,
        employeeId: emp.id,
        employeeName: emp.nome,
        timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        isRead: Math.random() > 0.4,
        actionRequired: true,
        department: emp.area
      })
    })

    // Alertas de performance baixa
    employees.filter(emp => emp.score < 250).forEach(emp => {
      generatedAlerts.push({
        id: `performance-${emp.id}`,
        type: 'performance',
        severity: 'high',
        title: 'Performance Abaixo do Esperado',
        message: `${emp.nome} apresenta score baixo (${emp.score.toFixed(1)}). Intervenção necessária.`,
        employeeId: emp.id,
        employeeName: emp.nome,
        timestamp: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
        isRead: Math.random() > 0.6,
        actionRequired: true,
        department: emp.area
      })
    })

    // Alertas de retenção departamental
    const departmentRisks = employees.reduce((acc, emp) => {
      const dept = emp.area || 'Não definido'
      if (!acc[dept]) acc[dept] = { total: 0, highRisk: 0 }
      acc[dept].total++
      if (emp.riscoPerdaTexto?.toLowerCase() === 'alto') acc[dept].highRisk++
      return acc
    }, {} as Record<string, { total: number, highRisk: number }>)

    Object.entries(departmentRisks).forEach(([dept, data]) => {
      const riskPercentage = (data.highRisk / data.total) * 100
      if (riskPercentage > 30) {
        generatedAlerts.push({
          id: `retention-${dept}`,
          type: 'retention',
          severity: riskPercentage > 50 ? 'critical' : 'high',
          title: 'Alto Risco Departamental',
          message: `${dept}: ${riskPercentage.toFixed(1)}% dos colaboradores em alto risco`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          isRead: Math.random() > 0.7,
          actionRequired: true,
          department: dept
        })
      }
    })

    setAlerts(generatedAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRead = !showOnlyUnread || !alert.isRead
    
    return matchesType && matchesSeverity && matchesSearch && matchesRead
  })

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger'
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'neutral'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'high_risk': return AlertTriangle
      case 'anomaly': return Activity
      case 'performance': return TrendingDown
      case 'retention': return Users
      case 'sentiment': return Target
      default: return Bell
    }
  }

  const unreadCount = alerts.filter(alert => !alert.isRead).length
  const criticalCount = alerts.filter(alert => alert.severity === 'critical').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Central de Alertas</h1>
            <p className="text-orange-100">
              Monitore alertas críticos e tome ações preventivas
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{unreadCount}</div>
              <div className="text-sm text-orange-200">Não Lidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{criticalCount}</div>
              <div className="text-sm text-orange-200">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-sm text-orange-200">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-danger-600" />
            <span className="font-medium text-gray-900">Críticos</span>
          </div>
          <div className="text-2xl font-bold text-danger-600">{criticalCount}</div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-warning-600" />
            <span className="font-medium text-gray-900">Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-warning-600">
            {alerts.filter(a => a.actionRequired && !a.isRead).length}
          </div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <span className="font-medium text-gray-900">Resolvidos</span>
          </div>
          <div className="text-2xl font-bold text-success-600">
            {alerts.filter(a => a.isRead).length}
          </div>
        </Card>
        
        <Card padding="sm" className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Hoje</span>
          </div>
          <div className="text-2xl font-bold text-primary-600">
            {alerts.filter(a => {
              const today = new Date()
              const alertDate = new Date(a.timestamp)
              return alertDate.toDateString() === today.toDateString()
            }).length}
          </div>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="sm:max-w-xs"
            />
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'Todos os tipos' },
                { value: 'high_risk', label: 'Alto Risco' },
                { value: 'anomaly', label: 'Anomalias' },
                { value: 'performance', label: 'Performance' },
                { value: 'retention', label: 'Retenção' },
                { value: 'sentiment', label: 'Sentimento' }
              ]}
            />
            
            <Select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              options={[
                { value: 'all', label: 'Todas as severidades' },
                { value: 'critical', label: 'Crítico' },
                { value: 'high', label: 'Alto' },
                { value: 'medium', label: 'Médio' },
                { value: 'low', label: 'Baixo' }
              ]}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyUnread}
                onChange={(e) => setShowOnlyUnread(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Apenas não lidos</span>
            </label>
            
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar todos como lidos
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const Icon = getTypeIcon(alert.type)
            return (
              <Card key={alert.id} className={`transition-all duration-200 ${
                !alert.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-danger-100' :
                    alert.severity === 'high' ? 'bg-danger-100' :
                    alert.severity === 'medium' ? 'bg-warning-100' : 'bg-primary-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      alert.severity === 'critical' ? 'text-danger-600' :
                      alert.severity === 'high' ? 'text-danger-600' :
                      alert.severity === 'medium' ? 'text-warning-600' : 'text-primary-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-lg font-semibold ${
                            !alert.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {alert.title}
                          </h3>
                          <Badge variant={getSeverityVariant(alert.severity)} size="sm">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{alert.message}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(alert.timestamp, 'dd/MM/yyyy HH:mm')}</span>
                          </div>
                          {alert.department && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{alert.department}</span>
                            </div>
                          )}
                          {alert.actionRequired && (
                            <Badge variant="warning" size="sm">Ação Necessária</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {alert.employeeId && (
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {!alert.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <Card className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {alerts.length === 0 ? 'Nenhum alerta gerado' : 'Nenhum alerta encontrado'}
            </h3>
            <p className="text-gray-600">
              {alerts.length === 0 
                ? 'Todos os colaboradores estão em situação estável'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}