import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, RotateCcw, Sliders, Info, Brain, CheckCircle, XCircle, Zap, Calculator, Eye } from 'lucide-react'
import { useStore } from '../store/useStore'
import { azureOpenAIService } from '../services/azureOpenAIService'
import { ScoreCalculationService } from '../services/scoreCalculationService'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import Tooltip from '../components/ui/Tooltip'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

export default function Settings() {
  const { weightConfig, updateWeightConfig, employees } = useStore()
  const [weights, setWeights] = useState(weightConfig)
  const [azureStatus, setAzureStatus] = useState<'testing' | 'connected' | 'disconnected' | null>(null)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null)

  useEffect(() => {
    testAzureConnection()
  }, [])

  const testAzureConnection = async () => {
    setAzureStatus('testing')
    try {
      const isConnected = await azureOpenAIService.testConnection()
      setAzureStatus(isConnected ? 'connected' : 'disconnected')
    } catch (error) {
      console.error('Erro ao testar Azure OpenAI:', error)
      setAzureStatus('disconnected')
    }
  }

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // Validate that weights sum to 100
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    if (total !== 100) {
      toast.error('A soma dos pesos deve ser igual a 100%')
      return
    }

    updateWeightConfig(weights)
    toast.success('Configurações salvas com sucesso!')
  }

  const handleReset = () => {
    const defaultWeights = {
      desempenho: 20,
      tempoCargo: 10,
      tempoCasa: 10,
      riscoPerda: 15,
      impactoPerda: 15,
      absenteismo: 10,
      salario: 5,
      formacao: 5,
      diversidade: 5,
      experiencia: 5
    }
    setWeights(defaultWeights)
    toast.success('Configurações restauradas para o padrão')
  }

  const handleTestScore = (employee: any) => {
    const breakdown = ScoreCalculationService.calculateEmployeeScore(employee, weights)
    setScoreBreakdown(breakdown)
    setSelectedEmployee(employee)
    setShowScoreModal(true)
  }

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)

  const weightConfigs = [
    {
      key: 'desempenho' as const,
      label: 'Desempenho',
      description: 'Peso do resultado da avaliação de desempenho - baseado na avaliação real do colaborador',
      max: 40,
      color: 'success' as const
    },
    {
      key: 'tempoCargo' as const,
      label: 'Tempo no Cargo',
      description: 'Experiência na função atual - calculado a partir dos dados reais de tempo no cargo',
      max: 20,
      color: 'primary' as const
    },
    {
      key: 'tempoCasa' as const,
      label: 'Tempo na Casa',
      description: 'Tempo total na empresa - baseado na data de admissão real',
      max: 20,
      color: 'primary' as const
    },
    {
      key: 'riscoPerda' as const,
      label: 'Risco de Perda',
      description: 'Probabilidade de saída do colaborador - invertido (menor risco = maior score)',
      max: 30,
      color: 'warning' as const
    },
    {
      key: 'impactoPerda' as const,
      label: 'Impacto da Perda',
      description: 'Impacto da saída na organização - baseado no impacto declarado',
      max: 30,
      color: 'danger' as const
    },
    {
      key: 'absenteismo' as const,
      label: 'Absenteísmo',
      description: 'Taxa de faltas injustificadas - invertido (menor absenteísmo = maior score)',
      max: 20,
      color: 'warning' as const
    },
    {
      key: 'salario' as const,
      label: 'Posição Salarial',
      description: 'Posição salarial dentro do cargo - baseada na faixa e nível salarial',
      max: 15,
      color: 'success' as const
    },
    {
      key: 'formacao' as const,
      label: 'Formação',
      description: 'Grau de escolaridade e certificações - baseado nos dados reais de formação',
      max: 15,
      color: 'primary' as const
    },
    {
      key: 'diversidade' as const,
      label: 'Diversidade',
      description: 'Contribuição para diversidade organizacional - baseada em gênero, raça e orientação',
      max: 15,
      color: 'primary' as const
    },
    {
      key: 'experiencia' as const,
      label: 'Experiência',
      description: 'Score combinado de experiência e estabilidade - tempo + conhecimento + idiomas',
      max: 15,
      color: 'success' as const
    }
  ]

  const getAzureStatusBadge = () => {
    switch (azureStatus) {
      case 'testing':
        return <Badge variant="warning" size="sm"><Zap className="h-3 w-3 mr-1" />Testando...</Badge>
      case 'connected':
        return <Badge variant="success" size="sm"><CheckCircle className="h-3 w-3 mr-1" />Conectado</Badge>
      case 'disconnected':
        return <Badge variant="danger" size="sm"><XCircle className="h-3 w-3 mr-1" />Desconectado</Badge>
      default:
        return <Badge variant="neutral" size="sm">Verificando...</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações Avançadas</h1>
        <p className="mt-2 text-gray-600">
          Configure os parâmetros do sistema de análise e integração com Azure OpenAI
        </p>
      </div>

      {/* Azure OpenAI Status */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Integração Azure OpenAI</h3>
              <p className="text-sm text-gray-600">Status da conexão com o serviço de IA</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getAzureStatusBadge()}
            <Button variant="secondary" size="sm" onClick={testAzureConnection}>
              Testar Conexão
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Configuração Atual</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Endpoint:</span>
                <span className="font-mono text-xs">
                  {import.meta.env.VITE_AZURE_OPENAI_ENDPOINT ? '✓ Configurado' : '✗ Não configurado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Key:</span>
                <span className="font-mono text-xs">
                  {import.meta.env.VITE_AZURE_OPENAI_API_KEY ? '✓ Configurado' : '✗ Não configurado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deployment:</span>
                <span className="font-mono text-xs">
                  {import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Version:</span>
                <span className="font-mono text-xs">
                  {import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-12-01-preview'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Funcionalidades Disponíveis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-blue-700">Chat inteligente com IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-blue-700">Análises personalizadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-blue-700">Planos de retenção</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-blue-700">Insights automáticos</span>
              </div>
            </div>
          </div>
        </div>

        {azureStatus === 'disconnected' && (
          <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-warning-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-warning-900">Azure OpenAI não configurado</h5>
                <p className="text-sm text-warning-700 mt-1">
                  Para usar a IA avançada, configure as variáveis de ambiente no arquivo .env:
                </p>
                <div className="mt-2 p-2 bg-warning-100 rounded text-xs font-mono">
                  VITE_AZURE_OPENAI_ENDPOINT=https://reconheceai-chat-resource.cognitiveservices.azure.com/<br/>
                  VITE_AZURE_OPENAI_API_KEY=sua_api_key_aqui<br/>
                  VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1-mini
                </div>
                <p className="text-sm text-warning-700 mt-2">
                  O sistema funcionará em modo simulado até que a configuração seja feita.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Sliders className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pesos para Cálculo de Score</h3>
                <p className="text-sm text-gray-600">Ajuste a importância de cada fator baseado nos dados reais dos colaboradores</p>
              </div>
            </div>

            <div className="space-y-6">
              {weightConfigs.map((config) => (
                <div key={config.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        {config.label}
                      </label>
                      <Tooltip content={config.description}>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {weights[config.key]}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={config.max}
                      value={weights[config.key]}
                      onChange={(e) => handleWeightChange(config.key, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, 
                          ${config.color === 'success' ? '#22c55e' : 
                            config.color === 'primary' ? '#0ea5e9' :
                            config.color === 'warning' ? '#f59e0b' : '#ef4444'} 0%, 
                          ${config.color === 'success' ? '#22c55e' : 
                            config.color === 'primary' ? '#0ea5e9' :
                            config.color === 'warning' ? '#f59e0b' : '#ef4444'} ${(weights[config.key] / config.max) * 100}%, 
                          #e5e7eb ${(weights[config.key] / config.max) * 100}%, 
                          #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>{config.max}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary and Actions */}
        <div className="space-y-6">
          {/* Total Weight Summary */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total dos Pesos:</span>
                  <span className={`text-lg font-bold ${
                    totalWeight === 100 ? 'text-success-600' : 
                    totalWeight > 100 ? 'text-danger-600' : 'text-warning-600'
                  }`}>
                    {totalWeight}%
                  </span>
                </div>
                <ProgressBar
                  value={totalWeight}
                  max={100}
                  color={
                    totalWeight === 100 ? 'success' : 
                    totalWeight > 100 ? 'danger' : 'warning'
                  }
                />
                {totalWeight !== 100 && (
                  <p className="text-xs text-gray-600 mt-2">
                    {totalWeight > 100 
                      ? `Reduza ${totalWeight - 100}% para atingir 100%`
                      : `Adicione ${100 - totalWeight}% para atingir 100%`
                    }
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Distribuição Atual:</h4>
                <div className="space-y-2">
                  {weightConfigs.map((config) => (
                    <div key={config.key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{config.label}:</span>
                      <span className="font-medium">{weights[config.key]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card>
            <div className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={totalWeight !== 100}
                variant="primary"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
              <Button
                onClick={handleReset}
                variant="secondary"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>
            </div>
            
            {totalWeight !== 100 && (
              <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-sm text-warning-700">
                  ⚠️ A soma dos pesos deve ser exatamente 100% para salvar as configurações.
                </p>
              </div>
            )}
          </Card>

          {/* Score Calculator */}
          <Card>
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="h-5 w-5 text-primary-600" />
              <h4 className="text-sm font-medium text-gray-900">Calculadora de Score</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Teste como os pesos afetam o cálculo do score de um colaborador específico
            </p>
            {employees.length > 0 && (
              <div className="space-y-2">
                <select 
                  className="w-full text-xs border border-gray-300 rounded p-2"
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === parseInt(e.target.value))
                    if (emp) handleTestScore(emp)
                  }}
                >
                  <option value="">Selecione um colaborador</option>
                  {employees.slice(0, 10).map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome} (Score atual: {emp.score?.toFixed(1) ?? 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>

          {/* Azure OpenAI Info */}
          <Card>
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <h4 className="text-sm font-medium text-gray-900">Azure OpenAI</h4>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <p>
                <strong>Modelo:</strong> GPT-4.1 Mini
              </p>
              <p>
                <strong>Endpoint:</strong> Azure Cognitive Services
              </p>
              <p>
                <strong>Funcionalidades:</strong> Chat inteligente, análises personalizadas, insights automáticos
              </p>
              <p>
                <strong>Status:</strong> {azureStatus === 'connected' ? 'Conectado e funcionando' : 'Modo simulado ativo'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Score Breakdown Modal */}
      <Modal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        title={`Breakdown de Score - ${selectedEmployee?.nome}`}
        size="xl"
      >
        {scoreBreakdown && (
          <div className="space-y-6">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {(scoreBreakdown.scoreTotal ?? 0).toFixed(1)}
              </div>
              <div className="text-sm text-primary-700">Score Total Calculado</div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Detalhamento por Componente:</h4>
              {Object.entries(scoreBreakdown.detalhes || {}).map(([key, detail]: [string, any]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">{key}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Peso: {detail?.peso ?? 0}%</span>
                      <span className="font-bold text-primary-600">
                        {(detail?.contribuicao ?? 0).toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <ProgressBar
                      value={detail?.valor ?? 0}
                      max={100}
                      color={(detail?.valor ?? 0) >= 70 ? 'success' : (detail?.valor ?? 0) >= 40 ? 'warning' : 'danger'}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{detail?.justificativa ?? 'Sem justificativa disponível'}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Como o Score é Calculado:</h5>
              <p className="text-sm text-gray-700">
                O score final é a soma ponderada de todos os componentes. Cada componente recebe uma 
                pontuação de 0 a 100 baseada nos dados reais do colaborador, que é então multiplicada 
                pelo peso configurado para obter a contribuição final.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}