import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  PieChart,
  BarChart3,
  Calculator,
  Target,
  Users,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Plus,
  Filter,
  Calendar
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { BudgetData, SalaryAdjustment, BudgetAnalysis } from '../types'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Budget() {
  const { employees } = useStore()
  const [budgetData, setBudgetData] = useState<BudgetData[]>([])
  const [salaryAdjustments, setSalaryAdjustments] = useState<SalaryAdjustment[]>([])
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [adjustmentPercentage, setAdjustmentPercentage] = useState(5)
  const [adjustmentJustification, setAdjustmentJustification] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')

  useEffect(() => {
    if (employees.length > 0) {
      generateBudgetData()
      generateSalaryAdjustments()
    }
  }, [employees])

  const generateBudgetData = () => {
    // Dados de orçamento baseados no CSV fornecido
    const budgetByCenter = {
      'CC101': { orcamentoAnual: 1049456, departamento: 'Comercial' },
      'CC105': { orcamentoAnual: 1523142, departamento: 'Administrativo' },
      'TI-001': { orcamentoAnual: 2500000, departamento: 'Tecnologia' },
      'TI-002': { orcamentoAnual: 1800000, departamento: 'Tecnologia' },
      'VEN-001': { orcamentoAnual: 1200000, departamento: 'Vendas' },
      'VEN-002': { orcamentoAnual: 900000, departamento: 'Vendas' },
      'RH-001': { orcamentoAnual: 800000, departamento: 'Recursos Humanos' },
      'RH-002': { orcamentoAnual: 600000, departamento: 'Recursos Humanos' },
      'FIN-001': { orcamentoAnual: 1500000, departamento: 'Financeiro' },
      'FIN-002': { orcamentoAnual: 700000, departamento: 'Financeiro' },
      'MKT-001': { orcamentoAnual: 800000, departamento: 'Marketing' },
      'OPS-001': { orcamentoAnual: 1000000, departamento: 'Operações' }
    }

    const departmentBudgets = employees.reduce((acc, emp) => {
      const centerCode = emp.centroCustos || 'CC101'
      const budgetInfo = budgetByCenter[centerCode as keyof typeof budgetByCenter] || 
                        { orcamentoAnual: 1000000, departamento: emp.area || 'Outros' }
      
      const dept = budgetInfo.departamento
      
      if (!acc[dept]) {
        acc[dept] = {
          centroCustos: centerCode,
          departamento: dept,
          orcamentoAnual: budgetInfo.orcamentoAnual,
          orcamentoUtilizado: 0,
          orcamentoDisponivel: 0,
          percentualUtilizado: 0,
          colaboradores: 0,
          salarioMedio: 0,
          projecaoGastos: 0
        }
      }

      acc[dept].colaboradores++
      acc[dept].orcamentoUtilizado += emp.salario * 12 // Salário anual
      
      return acc
    }, {} as Record<string, BudgetData>)

    const budgetArray = Object.values(departmentBudgets).map(budget => {
      budget.orcamentoDisponivel = budget.orcamentoAnual - budget.orcamentoUtilizado
      budget.percentualUtilizado = (budget.orcamentoUtilizado / budget.orcamentoAnual) * 100
      budget.salarioMedio = budget.orcamentoUtilizado / 12 / budget.colaboradores
      budget.projecaoGastos = budget.orcamentoUtilizado * 1.05 // Projeção com 5% de aumento
      return budget
    })

    setBudgetData(budgetArray)

    // Gerar análise de orçamento
    const totalBudget = budgetArray.reduce((sum, b) => sum + b.orcamentoAnual, 0)
    const totalUsed = budgetArray.reduce((sum, b) => sum + b.orcamentoUtilizado, 0)
    const utilizationRate = (totalUsed / totalBudget) * 100

    const analysis: BudgetAnalysis = {
      totalBudget,
      totalUsed,
      totalAvailable: totalBudget - totalUsed,
      utilizationRate,
      departments: budgetArray,
      recommendations: [
        'Considerar redistribuição de orçamento entre departamentos',
        'Implementar controles mais rigorosos em departamentos com alta utilização',
        'Avaliar oportunidades de otimização salarial'
      ],
      riskFactors: budgetArray
        .filter(b => b.percentualUtilizado > 90)
        .map(b => `${b.departamento}: ${b.percentualUtilizado.toFixed(1)}% do orçamento utilizado`),
      opportunities: budgetArray
        .filter(b => b.percentualUtilizado < 70)
        .map(b => `${b.departamento}: ${(100 - b.percentualUtilizado).toFixed(1)}% de orçamento disponível`)
    }

    setBudgetAnalysis(analysis)
  }

  const generateSalaryAdjustments = () => {
    const adjustments: SalaryAdjustment[] = employees
      .filter(emp => emp.score >= 350 || emp.riscoPerdaTexto?.toLowerCase() === 'alto')
      .map(emp => {
        let percentual = 0
        let justificativa = ''

        if (emp.score >= 450) {
          percentual = 15
          justificativa = 'Top performer - reconhecimento por excelência'
        } else if (emp.score >= 400) {
          percentual = 10
          justificativa = 'Alto desempenho - retenção de talento'
        } else if (emp.riscoPerdaTexto?.toLowerCase() === 'alto') {
          percentual = 12
          justificativa = 'Alto risco de saída - estratégia de retenção'
        } else {
          percentual = 5
          justificativa = 'Ajuste padrão por performance'
        }

        const novoSalario = emp.salario * (1 + percentual / 100)
        const impacto = (novoSalario - emp.salario) * 12

        return {
          employeeId: emp.id,
          employeeName: emp.nome,
          salarioAtual: emp.salario,
          percentualAumento: percentual,
          novoSalario,
          justificativa,
          impactoOrcamento: impacto,
          aprovado: Math.random() > 0.3, // 70% aprovados
          dataAprovacao: Math.random() > 0.3 ? new Date() : undefined,
          aprovadoPor: Math.random() > 0.3 ? 'Sistema Automático' : undefined
        }
      })

    setSalaryAdjustments(adjustments)
  }

  const handleCreateAdjustment = () => {
    if (!selectedEmployee) return

    const novoSalario = selectedEmployee.salario * (1 + adjustmentPercentage / 100)
    const impacto = (novoSalario - selectedEmployee.salario) * 12

    const newAdjustment: SalaryAdjustment = {
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.nome,
      salarioAtual: selectedEmployee.salario,
      percentualAumento: adjustmentPercentage,
      novoSalario,
      justificativa: adjustmentJustification,
      impactoOrcamento: impacto,
      aprovado: false
    }

    setSalaryAdjustments(prev => [newAdjustment, ...prev])
    setShowAdjustmentModal(false)
    setSelectedEmployee(null)
    setAdjustmentPercentage(5)
    setAdjustmentJustification('')
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
  const filteredBudgetData = filterDepartment === 'all' 
    ? budgetData 
    : budgetData.filter(b => b.departamento === filterDepartment)

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestão de Orçamento e Salários</h1>
            <p className="text-green-100">
              Controle orçamentário inteligente e gestão estratégica de remuneração
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {budgetAnalysis ? formatCurrency(budgetAnalysis.totalBudget) : '---'}
              </div>
              <div className="text-sm text-green-200">Orçamento Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {budgetAnalysis ? `${budgetAnalysis.utilizationRate.toFixed(1)}%` : '---'}
              </div>
              <div className="text-sm text-green-200">Utilização</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{salaryAdjustments.length}</div>
              <div className="text-sm text-green-200">Ajustes Propostos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Orçamentário */}
      {budgetAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(budgetAnalysis.totalBudget)}
            </div>
            <div className="text-sm text-gray-600">Orçamento Total</div>
          </Card>

          <Card className="text-center p-4">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(budgetAnalysis.totalUsed)}
            </div>
            <div className="text-sm text-gray-600">Orçamento Utilizado</div>
          </Card>

          <Card className="text-center p-4">
            <Target className="h-8 w-8 text-warning-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(budgetAnalysis.totalAvailable)}
            </div>
            <div className="text-sm text-gray-600">Orçamento Disponível</div>
          </Card>

          <Card className="text-center p-4">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {budgetAnalysis.utilizationRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Taxa de Utilização</div>
          </Card>
        </div>
      )}

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
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowAdjustmentModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Ajuste
            </Button>
          </div>
        </div>
      </Card>

      {/* Gráficos de Orçamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição Orçamentária</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={filteredBudgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="orcamentoAnual"
                  nameKey="departamento"
                >
                  {filteredBudgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilização por Departamento</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredBudgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="departamento" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Bar dataKey="percentualUtilizado" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tabela de Orçamento por Departamento */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Orçamento por Departamento</h3>
          <Badge variant="info" size="sm">
            {filteredBudgetData.length} departamentos
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Departamento</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Orçamento Anual</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Utilizado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Disponível</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Utilização</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Colaboradores</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Salário Médio</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgetData.map((budget, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{budget.departamento}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(budget.orcamentoAnual)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(budget.orcamentoUtilizado)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(budget.orcamentoDisponivel)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <ProgressBar
                        value={budget.percentualUtilizado}
                        max={100}
                        color={budget.percentualUtilizado > 90 ? 'danger' : budget.percentualUtilizado > 75 ? 'warning' : 'success'}
                        className="w-16"
                      />
                      <span className="text-sm font-medium">
                        {budget.percentualUtilizado.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="neutral" size="sm">
                      {budget.colaboradores}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(budget.salarioMedio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ajustes Salariais */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Ajustes Salariais Propostos</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="sm">
              {salaryAdjustments.filter(a => a.aprovado).length} aprovados
            </Badge>
            <Badge variant="warning" size="sm">
              {salaryAdjustments.filter(a => !a.aprovado).length} pendentes
            </Badge>
          </div>
        </div>
        <div className="space-y-4">
          {salaryAdjustments.slice(0, 10).map((adjustment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  adjustment.aprovado ? 'bg-success-100' : 'bg-warning-100'
                }`}>
                  {adjustment.aprovado ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-warning-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{adjustment.employeeName}</p>
                  <p className="text-sm text-gray-600">{adjustment.justificativa}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Atual</p>
                  <p className="font-medium">{formatCurrency(adjustment.salarioAtual)}</p>
                </div>
                <div className="text-center">
                  <Badge variant={adjustment.percentualAumento >= 10 ? 'success' : 'info'} size="sm">
                    +{adjustment.percentualAumento}%
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Novo</p>
                  <p className="font-medium text-success-600">{formatCurrency(adjustment.novoSalario)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Impacto Anual</p>
                  <p className="font-medium">{formatCurrency(adjustment.impactoOrcamento)}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights e Recomendações */}
      {budgetAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Fatores de Risco</h4>
            <div className="space-y-3">
              {budgetAnalysis.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-danger-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-danger-600" />
                  <span className="text-sm text-danger-800">{risk}</span>
                </div>
              ))}
              {budgetAnalysis.riskFactors.length === 0 && (
                <p className="text-sm text-gray-600">Nenhum fator de risco identificado</p>
              )}
            </div>
          </Card>

          <Card>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Oportunidades</h4>
            <div className="space-y-3">
              {budgetAnalysis.opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-success-600" />
                  <span className="text-sm text-success-800">{opportunity}</span>
                </div>
              ))}
              {budgetAnalysis.opportunities.length === 0 && (
                <p className="text-sm text-gray-600">Nenhuma oportunidade identificada</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Novo Ajuste */}
      <Modal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        title="Criar Novo Ajuste Salarial"
        size="lg"
      >
        <div className="space-y-6">
          <Select
            label="Colaborador"
            value={selectedEmployee?.id || ''}
            onChange={(e) => {
              const emp = employees.find(emp => emp.id === parseInt(e.target.value))
              setSelectedEmployee(emp)
            }}
            options={[
              { value: '', label: 'Selecione um colaborador' },
              ...employees.map(emp => ({ 
                value: (emp.id ?? 0).toString(), 
                label: `${emp.nome} - ${formatCurrency(emp.salario)}` 
              }))
            ]}
          />

          {selectedEmployee && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentual de Aumento
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={adjustmentPercentage}
                      onChange={(e) => setAdjustmentPercentage(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-primary-600">
                      {adjustmentPercentage}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Novo Salário
                  </label>
                  <div className="text-2xl font-bold text-success-600">
                    {formatCurrency(selectedEmployee.salario * (1 + adjustmentPercentage / 100))}
                  </div>
                </div>
              </div>

              <Input
                label="Justificativa"
                value={adjustmentJustification}
                onChange={(e) => setAdjustmentJustification(e.target.value)}
                placeholder="Descreva o motivo do ajuste salarial..."
              />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Resumo do Ajuste</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Salário Atual:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedEmployee.salario)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Novo Salário:</span>
                    <span className="ml-2 font-medium text-success-600">
                      {formatCurrency(selectedEmployee.salario * (1 + adjustmentPercentage / 100))}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Aumento Mensal:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(selectedEmployee.salario * (adjustmentPercentage / 100))}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Impacto Anual:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(selectedEmployee.salario * (adjustmentPercentage / 100) * 12)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={handleCreateAdjustment}
                  disabled={!adjustmentJustification.trim()}
                  className="flex-1"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Criar Ajuste
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowAdjustmentModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}