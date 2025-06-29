import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Star,
  Award,
  Target,
  Activity,
  Zap,
  Shield,
  DollarSign,
  GraduationCap,
  Users,
  Building
} from 'lucide-react'
import { Employee } from '../../types'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'
import Tooltip from '../ui/Tooltip'

interface EmployeeCardProps {
  employee: Employee
  viewMode?: 'grid' | 'list'
}

export default function EmployeeCard({ employee, viewMode = 'grid' }: EmployeeCardProps) {
  const getRiskVariant = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'alto': return 'danger'
      case 'médio': return 'warning'
      case 'baixo': return 'success'
      default: return 'neutral'
    }
  }

  const getPerformanceVariant = (performance: string) => {
    switch (performance?.toLowerCase()) {
      case 'excepcional':
      case 'excelente':
      case 'excede':
        return 'success'
      case 'acima do esperado':
      case 'bom':
      case 'atende':
        return 'info'
      case 'regular':
      case 'parcialmente atende':
        return 'warning'
      case 'abaixo do esperado':
      case 'não atende':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 400) return 'success'
    if (score >= 300) return 'warning'
    return 'danger'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 450) return 'A+'
    if (score >= 400) return 'A'
    if (score >= 350) return 'B+'
    if (score >= 300) return 'B'
    if (score >= 250) return 'C+'
    if (score >= 200) return 'C'
    return 'D'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (viewMode === 'list') {
    return (
      <Card hover className="group">
        <div className="flex items-center space-x-6">
          {/* Avatar e Info Principal */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {employee.nome?.charAt(0) || 'N'}
              </div>
              {employee.score >= 400 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning-500 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {employee.nome}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{employee.cargoAtual}</span>
                <span>•</span>
                <span>{employee.area}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <span>ID: {employee.matricula}</span>
                <span>•</span>
                <span>{formatCurrency(employee.salario)}</span>
              </div>
            </div>
          </div>

          {/* Score e Grade */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              employee.score >= 400 ? 'text-success-600' :
              employee.score >= 300 ? 'text-warning-600' : 'text-danger-600'
            }`}>
              {employee.score.toFixed(1)}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              employee.score >= 400 ? 'bg-success-100 text-success-700' :
              employee.score >= 300 ? 'bg-warning-100 text-warning-700' : 'bg-danger-100 text-danger-700'
            }`}>
              {getScoreGrade(employee.score)}
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-col space-y-2">
            <Badge variant={getRiskVariant(employee.riscoPerdaTexto || '')} size="sm">
              {employee.riscoPerdaTexto}
            </Badge>
            <Badge variant={getPerformanceVariant(employee.desempenhoTexto || '')} size="sm">
              {employee.desempenhoTexto}
            </Badge>
          </div>

          {/* Métricas Rápidas */}
          <div className="hidden lg:flex flex-col space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{employee.tempoDeCasa.toFixed(1)}a</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{employee.tempoNoCargo.toFixed(1)}a</span>
            </div>
            <div className="flex items-center space-x-1">
              <Building className="h-3 w-3" />
              <span>{employee.centroCustos}</span>
            </div>
          </div>

          {/* Alertas */}
          <div className="flex flex-col space-y-1">
            {employee.isAbsenteismoAnomalo && (
              <Tooltip content="Padrão de absenteísmo anômalo">
                <AlertTriangle className="h-4 w-4 text-warning-600" />
              </Tooltip>
            )}
            {employee.scoreSentimento > 0.6 && (
              <Tooltip content="Sentimento negativo detectado">
                <TrendingUp className="h-4 w-4 text-danger-600" />
              </Tooltip>
            )}
            {employee.numeroAdvertencias > 0 && (
              <Tooltip content={`${employee.numeroAdvertencias} advertência(s)`}>
                <Shield className="h-4 w-4 text-warning-600" />
              </Tooltip>
            )}
          </div>

          {/* Ação */}
          <Link to={`/employees/${employee.id}`}>
            <Button variant="primary" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Detalhes
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card hover className="group relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full transform translate-x-16 -translate-y-16" />
      </div>

      {/* Header com Avatar e Score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {employee.nome?.charAt(0) || 'N'}
            </div>
            {employee.score >= 400 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning-500 rounded-full flex items-center justify-center shadow-lg">
                <Star className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {employee.nome}
            </h3>
            <p className="text-sm text-gray-600 truncate">{employee.cargoAtual}</p>
            <p className="text-xs text-gray-500 truncate">{employee.area}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-3xl font-bold ${
            employee.score >= 400 ? 'text-success-600' :
            employee.score >= 300 ? 'text-warning-600' : 'text-danger-600'
          }`}>
            {employee.score.toFixed(1)}
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            employee.score >= 400 ? 'bg-success-100 text-success-700' :
            employee.score >= 300 ? 'bg-warning-100 text-warning-700' : 'bg-danger-100 text-danger-700'
          }`}>
            Grade {getScoreGrade(employee.score)}
          </div>
        </div>
      </div>

      {/* Progress Bar do Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Performance Score</span>
          <span className="text-sm text-gray-600">{employee.score.toFixed(1)}/500</span>
        </div>
        <ProgressBar 
          value={employee.score} 
          max={500} 
          color={getScoreColor(employee.score)}
          size="md"
        />
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Risco:</span>
          <Badge variant={getRiskVariant(employee.riscoPerdaTexto || '')} size="sm">
            {employee.riscoPerdaTexto}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Performance:</span>
          <Badge variant={getPerformanceVariant(employee.desempenhoTexto || '')} size="sm">
            {employee.desempenhoTexto}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Salário:</span>
          <span className="text-sm font-medium">{formatCurrency(employee.salario)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Matrícula:</span>
          <span className="text-sm font-medium">{employee.matricula}</span>
        </div>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Calendar className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Tempo na Empresa</p>
            <p className="text-sm font-medium">{employee.tempoDeCasa.toFixed(1)} anos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-success-100 rounded-lg">
            <Clock className="h-4 w-4 text-success-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Tempo no Cargo</p>
            <p className="text-sm font-medium">{employee.tempoNoCargo.toFixed(1)} anos</p>
          </div>
        </div>
      </div>

      {/* Dados Adicionais */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Gestor:</span>
          <span className="font-medium">{employee.gestorImediato}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Centro de Custos:</span>
          <span className="font-medium">{employee.centroCustos}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Escolaridade:</span>
          <span className="font-medium">{employee.grauEscolaridade}</span>
        </div>
      </div>

      {/* Indicadores Especiais */}
      <div className="space-y-2 mb-4">
        {employee.isAbsenteismoAnomalo && (
          <div className="flex items-center space-x-2 p-2 bg-warning-50 rounded-lg border border-warning-200">
            <AlertTriangle className="h-4 w-4 text-warning-600 flex-shrink-0" />
            <span className="text-xs text-warning-700">Padrão de absenteísmo anômalo</span>
          </div>
        )}

        {employee.scoreSentimento > 0.6 && (
          <div className="flex items-center space-x-2 p-2 bg-danger-50 rounded-lg border border-danger-200">
            <Activity className="h-4 w-4 text-danger-600 flex-shrink-0" />
            <span className="text-xs text-danger-700">Sentimento negativo detectado</span>
          </div>
        )}

        {employee.score >= 450 && (
          <div className="flex items-center space-x-2 p-2 bg-success-50 rounded-lg border border-success-200">
            <Award className="h-4 w-4 text-success-600 flex-shrink-0" />
            <span className="text-xs text-success-700">Top Performer</span>
          </div>
        )}

        {employee.numeroAdvertencias > 0 && (
          <div className="flex items-center space-x-2 p-2 bg-warning-50 rounded-lg border border-warning-200">
            <Shield className="h-4 w-4 text-warning-600 flex-shrink-0" />
            <span className="text-xs text-warning-700">{employee.numeroAdvertencias} advertência(s)</span>
          </div>
        )}
      </div>

      {/* Scores Adicionais */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-bold text-gray-900">
            {(employee.scoreExperiencia || 0).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Experiência</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-bold text-gray-900">
            {(employee.scoreFormacao || 0).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Formação</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-bold text-gray-900">
            {(employee.scoreDiversidade || 0).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Diversidade</div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex space-x-2">
        <Link to={`/employees/${employee.id}`} className="flex-1">
          <Button variant="primary" className="w-full group-hover:shadow-lg transition-shadow">
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes Completos
          </Button>
        </Link>
      </div>
    </Card>
  )
}