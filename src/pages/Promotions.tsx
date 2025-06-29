import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Award, 
  Users, 
  Calendar,
  Target,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Plus,
  Filter,
  BarChart3,
  DollarSign
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { PromotionCandidate } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Promotions() {
  const { employees } = useStore()
  const [promotionCandidates, setPromotionCandidates] = useState<PromotionCandidate[]>([])
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<PromotionCandidate | null>(null)
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterScore, setFilterScore] = useState('all')

  useEffect(() => {
    if (employees.length > 0) {
      generatePromotionCandidates()
    }
  }, [employees])

  const generatePromotionCandidates = () => {
    const candidates: PromotionCandidate[] = employees
      .filter(emp => {
        // Critérios para candidatos a promoção
        const tempoMinimo = emp.tempoNoCargo >= 1.5 // Pelo menos 1.5 anos no cargo
        const scoreMinimo = emp.score >= 300 // Score mínimo
        const semAdvertencias = emp.numeroAdvertencias === 0 // Sem advertências
        const bomDesempenho = emp.desempenhoTexto?.toLowerCase().includes('bom') || 
                             emp.desempenhoTexto?.toLowerCase().includes('excepcional') ||
                             emp.desempenhoTexto?.toLowerCase().includes('excede')
        
        return tempoMinimo && scoreMinimo && semAdvertencias && bomDesempenho
      })
      .map(emp => {
        // Determinar cargo sugerido baseado no cargo atual
        const cargoSugerido = getNextCareerLevel(emp.cargoAtual)
        
        // Calcular probabilidade de aprovação
        let probabilidade = 50 // Base
        
        if (emp.score >= 450) probabilidade += 30
        else if (emp.score >= 400) probabilidade += 20
        else if (emp.score >= 350) probabilidade += 10
        
        if (emp.tempoNoCargo >= 3) probabilidade += 15
        else if (emp.tempoNoCargo >= 2) probabilidade += 10
        
        if (emp.desempenhoTexto?.toLowerCase().includes('excepcional')) probabilidade += 20
        else if (emp.desempenhoTexto?.toLowerCase().includes('excede')) probabilidade += 15
        
        if (emp.riscoPerdaTexto?.toLowerCase() === 'alto') probabilidade += 25 // Retenção
        
        probabilidade = Math.min(probabilidade, 95) // Máximo 95%
        
        // Calcular impacto salarial
        const aumentoPercentual = getPromotionSalaryIncrease(emp.cargoAtual, cargoSugerido)
        const impactoSalarial = emp.salario * (aumentoPercentual / 100) * 12 // Anual
        
        // Gerar justificativa
        const justificativa = generatePromotionJustification(emp)
        
        return {
          employeeId: emp.id,
          employeeName: emp.nome,
          cargoAtual: emp.cargoAtual,
          cargoSugerido,
          score: emp.score,
          tempoCargo: emp.tempoNoCargo,
          justificativa,
          impactoSalarial,
          probabilidadeAprovacao: probabilidade
        }
      })
      .sort((a, b) => b.probabilidadeAprovacao - a.probabilidadeAprovacao)

    setPromotionCandidates(candidates)
  }

  const getNextCareerLevel = (cargoAtual: string): string => {
    const cargoLower = cargoAtual.toLowerCase()
    
    if (cargoLower.includes('estagiário')) return 'Assistente'
    if (cargoLower.includes('assistente')) return 'Auxiliar'
    if (cargoLower.includes('auxiliar')) return 'Analista Júnior'
    if (cargoLower.includes('júnior')) return cargoAtual.replace(/júnior/i, 'Pleno')
    if (cargoLower.includes('pleno')) return cargoAtual.replace(/pleno/i, 'Sênior')
    if (cargoLower.includes('sênior')) return `Coordenador ${cargoAtual.replace(/sênior/i, '').trim()}`
    if (cargoLower.includes('analista')) return `Coordenador ${cargoAtual.replace(/analista/i, '').trim()}`
    if (cargoLower.includes('coordenador')) return `Gerente ${cargoAtual.replace(/coordenador/i, '').trim()}`
    if (cargoLower.includes('especialista')) return `Coordenador ${cargoAtual.replace(/especialista/i, '').trim()}`
    if (cargoLower.includes('consultor')) return `Coordenador ${cargoAtual.replace(/consultor/i, '').trim()}`
    if (cargoLower.includes('supervisor')) return `Gerente ${cargoAtual.replace(/supervisor/i, '').trim()}`
    if (cargoLower.includes('gerente')) return `Diretor ${cargoAtual.replace(/gerente/i, '').trim()}`
    
    return `${cargoAtual} Sênior` // Fallback
  }

  const getPromotionSalaryIncrease = (cargoAtual: string, cargoSugerido: string): number => {
    const currentLevel = getCareerLevel(cargoAtual)
    const nextLevel = getCareerLevel(cargoSugerido)
    
    // Percentuais baseados na diferença de níveis
    const levelDiff = nextLevel - currentLevel
    
    if (levelDiff <= 0) return 5 // Ajuste mínimo
    if (levelDiff === 1) return 15 // Promoção de 1 nível
    if (levelDiff === 2) return 25 // Promoção de 2 níveis
    return 35 // Promoção significativa
  }

  const getCareerLevel = (cargo: string): number => {
    const cargoLower = cargo.toLowerCase()
    
    if (cargoLower.includes('estagiário')) return 1
    if (cargoLower.includes('assistente')) return 2
    if (cargoLower.includes('auxiliar')) return 3
    if (cargoLower.includes('júnior')) return 4
    if (cargoLower.includes('pleno')) return 5
    if (cargoLower.includes('sênior')) return 6
    if (cargoLower.includes('especialista')) return 6
    if (cargoLower.includes('analista') && !cargoLower.includes('júnior')) return 5
    if (cargoLower.includes('consultor')) return 6
    if (cargoLower.includes('coordenador')) return 7
    if (cargoLower.includes('supervisor')) return 7
    if (cargoLower.includes('gerente')) return 8
    if (cargoLower.includes('diretor')) return 9
    
    return 5 // Nível padrão
  }

  const generatePromotionJustification = (emp: any): string => {
    const reasons = []
    
    if (emp.score >= 450) {
      reasons.push('Performance excepcional (score ' + emp.score.toFixed(1) + ')')
    } else if (emp.score >= 400) {
      reasons.push('Alto desempenho consistente (score ' + emp.score.toFixed(1) + ')')
    }
    
    if (emp.tempoNoCargo >= 3) {
      reasons.push('Experiência sólida no cargo atual (' + emp.tempoNoCargo.toFixed(1) + ' anos)')
    } else if (emp.tempoNoCargo >= 2) {
      reasons.push('Tempo adequado no cargo (' + emp.tempoNoCargo.toFixed(1) + ' anos)')
    }
    
    if (emp.desempenhoTexto?.toLowerCase().includes('excepcional')) {
      reasons.push('Avaliação excepcional na última revisão')
    }
    
    if (emp.riscoPerdaTexto?.toLowerCase() === 'alto') {
      reasons.push('Estratégia de retenção para talento crítico')
    }
    
    if (emp.numeroAdvertencias === 0) {
      reasons.push('Histórico disciplinar exemplar')
    }
    
    if (emp.grauEscolaridade?.includes('Superior') || emp.grauEscolaridade?.includes('Pós')) {
      reasons.push('Qualificação acadêmica adequada')
    }
    
    return reasons.slice(0, 3).join('; ')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const departments = [...new Set(employees.map(emp => emp.area).filter(Boolean))]
  
  const filteredCandidates = promotionCandidates.filter(candidate => {
    const employee = employees.find(emp => emp.id === candidate.employeeId)
    if (!employee) return false
    
    const matchesDepartment = filterDepartment === 'all' || employee.area === filterDepartment
    const matchesScore = filterScore === 'all' || 
      (filterScore === 'high' && candidate.score >= 400) ||
      (filterScore === 'medium' && candidate.score >= 300 && candidate.score < 400) ||
      (filterScore === 'low' && candidate.score < 300)
    
    return matchesDepartment && matchesScore
  })

  // Dados para gráfico de distribuição por departamento
  const departmentData = departments.map(dept => {
    const deptEmployees = employees.filter(emp => emp.area === dept)
    const deptCandidates = promotionCandidates.filter(candidate => {
      const emp = employees.find(e => e.id === candidate.employeeId)
      return emp?.area === dept
    })
    
    return {
      department: dept,
      total: deptEmployees.length,
      candidates: deptCandidates.length,
      percentage: deptEmployees.length > 0 ? (deptCandidates.length / deptEmployees.length) * 100 : 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestão de Promoções</h1>
            <p className="text-purple-100">
              Identificação e gestão de candidatos a promoção baseada em performance e critérios objetivos
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{promotionCandidates.length}</div>
              <div className="text-sm text-purple-200">Candidatos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {promotionCandidates.filter(c => c.probabilidadeAprovacao >= 70).length}
              </div>
              <div className="text-sm text-purple-200">Alta Probabilidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(promotionCandidates.reduce((sum, c) => sum + c.impactoSalarial, 0))}
              </div>
              <div className="text-sm text-purple-200">Impacto Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{promotionCandidates.length}</div>
          <div className="text-sm text-gray-600">Total de Candidatos</div>
        </Card>

        <Card className="text-center p-4">
          <Star className="h-8 w-8 text-warning-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {promotionCandidates.filter(c => c.probabilidadeAprovacao >= 80).length}
          </div>
          <div className="text-sm text-gray-600">Candidatos Premium</div>
        </Card>

        <Card className="text-center p-4">
          <TrendingUp className="h-8 w-8 text-success-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {promotionCandidates.length > 0 ? 
              (promotionCandidates.reduce((sum, c) => sum + c.probabilidadeAprovacao, 0) / promotionCandidates.length).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600">Probabilidade Média</div>
        </Card>

        <Card className="text-center p-4">
          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(promotionCandidates.reduce((sum, c) => sum + c.impactoSalarial, 0))}
          </div>
          <div className="text-sm text-gray-600">Impacto Salarial Total</div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <Select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              options={[
                { value: 'all', label: 'Todos os departamentos' },
                ...departments.map(dept => ({ value: dept, label: dept }))
              ]}
            />
            <Select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              options={[
                { value: 'all', label: 'Todos os scores' },
                { value: 'high', label: 'Score Alto (≥400)' },
                { value: 'medium', label: 'Score Médio (300-399)' },
                { value: 'low', label: 'Score Baixo (<300)' }
              ]}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="info" size="sm">
              {filteredCandidates.length} candidatos
            </Badge>
          </div>
        </div>
      </Card>

      {/* Gráfico de Candidatos por Departamento */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidatos por Departamento</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'candidates' ? `${value} candidatos` : `${value} total`,
                  name === 'candidates' ? 'Candidatos' : 'Total'
                ]}
              />
              <Bar dataKey="total" fill="#e5e7eb" name="Total de Colaboradores" />
              <Bar dataKey="candidates" fill="#8b5cf6" name="Candidatos a Promoção" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Lista de Candidatos */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Candidatos a Promoção</h3>
          <Button variant="primary" size="sm" onClick={() => setShowPromotionModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Candidato
          </Button>
        </div>
        
        <div className="space-y-4">
          {filteredCandidates.map((candidate, index) => {
            const employee = employees.find(emp => emp.id === candidate.employeeId)
            if (!employee) return null

            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {candidate.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{candidate.employeeName}</h4>
                      <p className="text-sm text-gray-600">{employee.area} • Score: {candidate.score.toFixed(1)}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="neutral" size="sm">{candidate.cargoAtual}</Badge>
                        <span className="text-gray-400">→</span>
                        <Badge variant="success" size="sm">{candidate.cargoSugerido}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tempo no Cargo</p>
                      <p className="font-medium">{candidate.tempoCargo.toFixed(1)} anos</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Probabilidade</p>
                      <div className="flex items-center space-x-2">
                        <ProgressBar
                          value={candidate.probabilidadeAprovacao}
                          max={100}
                          color={candidate.probabilidadeAprovacao >= 80 ? 'success' : 
                                 candidate.probabilidadeAprovacao >= 60 ? 'warning' : 'danger'}
                          className="w-16"
                        />
                        <span className="text-sm font-medium">
                          {candidate.probabilidadeAprovacao.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Impacto Salarial</p>
                      <p className="font-medium text-success-600">
                        {formatCurrency(candidate.impactoSalarial)}
                      </p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedCandidate(candidate)
                        setShowPromotionModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Justificativa:</strong> {candidate.justificativa}
                  </p>
                </div>
              </div>
            )
          })}
          
          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum candidato encontrado</h3>
              <p className="text-gray-600">
                Ajuste os filtros ou aguarde que novos candidatos atendam aos critérios de promoção
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Detalhes/Criação */}
      <Modal
        isOpen={showPromotionModal}
        onClose={() => {
          setShowPromotionModal(false)
          setSelectedCandidate(null)
        }}
        title={selectedCandidate ? "Detalhes da Promoção" : "Adicionar Candidato"}
        size="lg"
      >
        <div className="space-y-6">
          {selectedCandidate ? (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Resumo da Promoção</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Colaborador:</span>
                    <p className="font-medium">{selectedCandidate.employeeName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Score Atual:</span>
                    <p className="font-medium">{selectedCandidate.score.toFixed(1)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Cargo Atual:</span>
                    <p className="font-medium">{selectedCandidate.cargoAtual}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Cargo Sugerido:</span>
                    <p className="font-medium text-success-600">{selectedCandidate.cargoSugerido}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tempo no Cargo:</span>
                    <p className="font-medium">{selectedCandidate.tempoCargo.toFixed(1)} anos</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Probabilidade:</span>
                    <p className="font-medium">{selectedCandidate.probabilidadeAprovacao.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Justificativa</h5>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedCandidate.justificativa}
                </p>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Impacto Financeiro</h5>
                <div className="bg-success-50 p-3 rounded-lg">
                  <p className="text-success-800">
                    <strong>Impacto Salarial Anual:</strong> {formatCurrency(selectedCandidate.impactoSalarial)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Plus className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600">
                Funcionalidade de adição manual de candidatos será implementada em breve
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}