import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Award,
  Building,
  DollarSign,
  GraduationCap,
  Users,
  Activity,
  Clock,
  Target,
  Brain,
  Sparkles,
  BarChart3,
  FileText,
  Star
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProgressBar from '../components/ui/ProgressBar'
import AnalysisPanel from '../components/enhanced/AnalysisPanel'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const { selectedEmployee, fetchEmployee, analyzeEmployee, weightConfig, loading } = useStore()
  const [analysis, setAnalysis] = useState('')
  const [analysisType, setAnalysisType] = useState<'risk' | 'impact' | 'recognition' | 'development' | 'diversity'>('recognition')
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchEmployee(parseInt(id))
    }
  }, [id, fetchEmployee])

  const handleAnalyze = async (type: 'risk' | 'impact' | 'recognition' | 'development' | 'diversity') => {
    if (!selectedEmployee) return
    
    setAnalysisLoading(true)
    setAnalysisType(type)
    
    try {
      const result = await analyzeEmployee(selectedEmployee.id, type, weightConfig)
      setAnalysis(result)
    } catch (error) {
      console.error('Error generating analysis:', error)
      setAnalysis('Erro ao gerar análise. Tente novamente.')
    } finally {
      setAnalysisLoading(false)
    }
  }

  if (loading || !selectedEmployee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do colaborador...</p>
        </div>
      </div>
    )
  }

  const employee = selectedEmployee

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/employees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{employee.nome}</h1>
            <p className="text-gray-600">{employee.cargoAtual} • {employee.area}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {employee.score >= 400 && (
            <Badge variant="warning" size="sm">
              <Star className="h-3 w-3 mr-1" />
              Top Performer
            </Badge>
          )}
          <Badge variant={getRiskVariant(employee.riscoPerdaTexto || '')} size="sm">
            {employee.riscoPerdaTexto}
          </Badge>
        </div>
      </div>

      {/* Score Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Score de Reconhecimento</h3>
              <p className="text-sm text-gray-600">Avaliação geral baseada em múltiplos fatores</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${
              employee.score >= 400 ? 'text-success-600' :
              employee.score >= 300 ? 'text-warning-600' : 'text-danger-600'
            }`}>
              {employee.score.toFixed(1)}
            </div>
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
              employee.score >= 400 ? 'bg-success-100 text-success-700' :
              employee.score >= 300 ? 'bg-warning-100 text-warning-700' : 'bg-danger-100 text-danger-700'
            }`}>
              Grade {getScoreGrade(employee.score)}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Performance Score</span>
            <span className="text-sm text-gray-600">{employee.score.toFixed(1)}/500</span>
          </div>
          <ProgressBar 
            value={employee.score} 
            max={500} 
            color={getScoreColor(employee.score)}
            size="lg"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {(employee.scoreExperiencia || 0).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Experiência</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {(employee.scoreFormacao || 0).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Formação</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {(employee.scoreDiversidade || 0).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Diversidade</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {((1 - (employee.scoreSentimento || 0)) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Satisfação</div>
          </div>
        </div>
      </Card>

      {/* Employee Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Matrícula:</span>
              <span className="text-sm font-medium">{employee.matricula}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gênero:</span>
              <span className="text-sm font-medium">{employee.genero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Raça/Cor:</span>
              <span className="text-sm font-medium">{employee.racaCor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Orientação:</span>
              <span className="text-sm font-medium">{employee.orientacaoSexual}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Idiomas:</span>
              <span className="text-sm font-medium">{employee.idiomasFalados}</span>
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Building className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Informações Profissionais</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cargo:</span>
              <span className="text-sm font-medium">{employee.cargoAtual}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Departamento:</span>
              <span className="text-sm font-medium">{employee.area}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gestor:</span>
              <span className="text-sm font-medium">{employee.gestorImediato}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Centro de Custos:</span>
              <span className="text-sm font-medium">{employee.centroCustos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nível Salarial:</span>
              <span className="text-sm font-medium">{employee.nivelSalarial}</span>
            </div>
          </div>
        </Card>

        {/* Performance & Risk */}
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Performance & Risco</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Performance:</span>
              <Badge variant={getPerformanceVariant(employee.desempenhoTexto || '')} size="sm">
                {employee.desempenhoTexto}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Risco de Perda:</span>
              <Badge variant={getRiskVariant(employee.riscoPerdaTexto || '')} size="sm">
                {employee.riscoPerdaTexto}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Impacto da Perda:</span>
              <span className="text-sm font-medium">{employee.impactoPerdaTexto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Advertências:</span>
              <span className="text-sm font-medium">{employee.numeroAdvertencias}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Absenteísmo:</span>
              <span className="text-sm font-medium">{(employee.absenteismo * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline & Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Timeline Profissional</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Admissão na Empresa</p>
                <p className="text-xs text-gray-600">
                  {format(employee.dataAdmissao, 'dd/MM/yyyy', { locale: ptBR })} 
                  • {employee.tempoDeCasa.toFixed(1)} anos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Última Promoção</p>
                <p className="text-xs text-gray-600">
                  {format(employee.dataUltimaPromocao, 'dd/MM/yyyy', { locale: ptBR })}
                  • {employee.tempoUltimaPromocao.toFixed(1)} anos atrás
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Última Avaliação</p>
                <p className="text-xs text-gray-600">
                  {format(employee.dataUltimaAvaliacao, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Informações Salariais</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Salário Atual:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(employee.salario)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tabela Salarial:</span>
              <span className="text-sm font-medium">{employee.tabelaSalarial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Faixa Salarial:</span>
              <span className="text-sm font-medium">{employee.faixaSalarial}</span>
            </div>
            {employee.reajusteSugerido > 0 && (
              <div className="flex justify-between items-center p-2 bg-success-50 rounded-lg">
                <span className="text-sm text-success-700">Reajuste Sugerido:</span>
                <span className="text-sm font-bold text-success-800">
                  {formatCurrency(employee.reajusteSugerido)}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Education & Skills */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <GraduationCap className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Formação e Qualificações</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Escolaridade</h4>
            <p className="text-sm text-gray-900">{employee.grauEscolaridade}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cursos Concluídos</h4>
            <p className="text-sm text-gray-900">{employee.cursosConcluidos || 'Nenhum informado'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Certificações</h4>
            <p className="text-sm text-gray-900">{employee.certificacoesRelevantes || 'Nenhuma informada'}</p>
          </div>
        </div>
      </Card>

      {/* Strengths and Risk Factors */}
      {(employee.strengths?.length > 0 || employee.riskFactors?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employee.strengths?.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Award className="h-5 w-5 text-success-600" />
                <h3 className="text-lg font-semibold text-gray-900">Pontos Fortes</h3>
              </div>
              <div className="space-y-2">
                {employee.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-success-50 rounded-lg">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-sm text-success-800">{strength}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {employee.riskFactors?.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
                <h3 className="text-lg font-semibold text-gray-900">Fatores de Risco</h3>
              </div>
              <div className="space-y-2">
                {employee.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-warning-50 rounded-lg">
                    <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    <span className="text-sm text-warning-800">{factor}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Feedback */}
      {employee.feedbackUltimaAvaliacao && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Feedback da Última Avaliação</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{employee.feedbackUltimaAvaliacao}</p>
          </div>
        </Card>
      )}

      {/* AI Analysis Panel */}
      <AnalysisPanel
        analysis={analysis}
        analysisType={analysisType}
        loading={analysisLoading}
        onAnalyze={handleAnalyze}
      />
    </div>
  )
}