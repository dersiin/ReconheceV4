import React, { useState } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Users, 
  TrendingUp, 
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Mail,
  Clock,
  Settings,
  Plus,
  Eye
} from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { format } from 'date-fns'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'executive' | 'departmental' | 'individual' | 'comparative'
  icon: React.ComponentType<any>
  metrics: string[]
  estimatedTime: string
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Relatório Executivo',
    description: 'Visão geral completa para liderança sênior',
    type: 'executive',
    icon: TrendingUp,
    metrics: ['Métricas gerais', 'Distribuição de risco', 'Top performers', 'Tendências'],
    estimatedTime: '2-3 min'
  },
  {
    id: 'department-analysis',
    name: 'Análise Departamental',
    description: 'Comparativo detalhado entre departamentos',
    type: 'departmental',
    icon: BarChart3,
    metrics: ['Performance por área', 'Distribuição de talentos', 'Métricas de retenção'],
    estimatedTime: '3-4 min'
  },
  {
    id: 'individual-profiles',
    name: 'Perfis Individuais',
    description: 'Relatórios detalhados de colaboradores específicos',
    type: 'individual',
    icon: Users,
    metrics: ['Scores individuais', 'Histórico de performance', 'Planos de desenvolvimento'],
    estimatedTime: '1-2 min'
  },
  {
    id: 'risk-assessment',
    name: 'Avaliação de Riscos',
    description: 'Análise focada em riscos de retenção',
    type: 'comparative',
    icon: PieChart,
    metrics: ['Análise de risco', 'Fatores críticos', 'Planos de ação'],
    estimatedTime: '2-3 min'
  }
]

export default function Reports() {
  const { employees } = useStore()
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [reportConfig, setReportConfig] = useState({
    format: 'pdf',
    departments: 'all',
    riskLevels: 'all',
    dateRange: '30',
    includeCharts: true,
    includeRecommendations: true
  })
  const [generatingReport, setGeneratingReport] = useState(false)

  const handleGenerateReport = async (template: ReportTemplate) => {
    setGeneratingReport(true)
    
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simular download
    const reportData = generateReportData(template)
    downloadReport(reportData, template.name)
    
    setGeneratingReport(false)
    setShowGenerateModal(false)
  }

  const generateReportData = (template: ReportTemplate) => {
    const data = {
      title: template.name,
      generatedAt: new Date().toISOString(),
      summary: {
        totalEmployees: employees.length,
        highRisk: employees.filter(e => e.riscoPerdaTexto?.toLowerCase() === 'alto').length,
        averageScore: employees.reduce((sum, e) => sum + e.score, 0) / employees.length,
        topPerformers: employees.filter(e => e.score >= 400).length
      },
      employees: employees.map(emp => ({
        nome: emp.nome,
        area: emp.area,
        score: emp.score,
        risco: emp.riscoPerdaTexto,
        performance: emp.desempenhoTexto
      }))
    }
    return data
  }

  const downloadReport = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const departments = [...new Set(employees.map(emp => emp.area).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-success-600 to-success-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Central de Relatórios</h1>
            <p className="text-success-100">
              Gere relatórios personalizados e insights estratégicos
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{reportTemplates.length}</div>
              <div className="text-sm text-success-200">Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-success-200">Formatos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-300">
          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Relatório Rápido</h3>
          <p className="text-sm text-gray-600">Gere um relatório básico em segundos</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-300">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Agendar Relatório</h3>
          <p className="text-sm text-gray-600">Configure relatórios automáticos</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-300">
          <Settings className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Templates Customizados</h3>
          <p className="text-sm text-gray-600">Crie seus próprios modelos</p>
        </Card>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Templates de Relatórios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTemplates.map((template) => {
            const Icon = template.icon
            return (
              <Card key={template.id} hover className="relative">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <Badge variant="info" size="sm">{template.estimatedTime}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Métricas incluídas:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.metrics.map((metric, index) => (
                          <Badge key={index} variant="neutral" size="sm">{metric}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowGenerateModal(true)
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Gerar
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Recentes</h3>
        <div className="space-y-3">
          {[
            { name: 'Relatório Executivo - Dezembro 2024', date: '2024-12-15', format: 'PDF', size: '2.3 MB' },
            { name: 'Análise Departamental - Q4 2024', date: '2024-12-10', format: 'Excel', size: '1.8 MB' },
            { name: 'Avaliação de Riscos - Novembro 2024', date: '2024-11-30', format: 'PDF', size: '1.5 MB' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.format} • {report.size}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title={`Gerar ${selectedTemplate?.name}`}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{selectedTemplate.name}</h4>
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Formato do Arquivo"
                value={reportConfig.format}
                onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'excel', label: 'Excel' },
                  { value: 'csv', label: 'CSV' }
                ]}
              />

              <Select
                label="Departamentos"
                value={reportConfig.departments}
                onChange={(e) => setReportConfig(prev => ({ ...prev, departments: e.target.value }))}
                options={[
                  { value: 'all', label: 'Todos os departamentos' },
                  ...departments.map(dept => ({ value: dept, label: dept }))
                ]}
              />

              <Select
                label="Níveis de Risco"
                value={reportConfig.riskLevels}
                onChange={(e) => setReportConfig(prev => ({ ...prev, riskLevels: e.target.value }))}
                options={[
                  { value: 'all', label: 'Todos os níveis' },
                  { value: 'alto', label: 'Alto Risco' },
                  { value: 'medio', label: 'Médio Risco' },
                  { value: 'baixo', label: 'Baixo Risco' }
                ]}
              />

              <Select
                label="Período"
                value={reportConfig.dateRange}
                onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                options={[
                  { value: '7', label: 'Últimos 7 dias' },
                  { value: '30', label: 'Últimos 30 dias' },
                  { value: '90', label: 'Últimos 3 meses' },
                  { value: '365', label: 'Último ano' }
                ]}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Incluir gráficos e visualizações</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={reportConfig.includeRecommendations}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Incluir recomendações da IA</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={() => handleGenerateReport(selectedTemplate)}
                loading={generatingReport}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowGenerateModal(false)}
                disabled={generatingReport}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}