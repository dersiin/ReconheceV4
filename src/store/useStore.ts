import { create } from 'zustand'
import { Employee, Alert, WeightConfig } from '../types'
import { supabaseService } from '../services/supabaseService'
import { aiService } from '../services/aiService'
import { ScoreCalculationService } from '../services/scoreCalculationService'

interface AppState {
  // Employees
  employees: Employee[]
  selectedEmployee: Employee | null
  loading: boolean
  error: string | null
  
  // Alerts
  alerts: Alert[]
  unreadAlertsCount: number
  
  // Settings
  weightConfig: WeightConfig
  
  // Actions
  setEmployees: (employees: Employee[]) => void
  setSelectedEmployee: (employee: Employee | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addAlert: (alert: Alert) => void
  markAlertAsRead: (alertId: string) => void
  updateWeightConfig: (config: WeightConfig) => void
  
  // API calls
  fetchEmployees: () => Promise<void>
  fetchEmployee: (id: number) => Promise<Employee | null>
  fetchAlerts: () => Promise<void>
  analyzeEmployee: (employeeId: number, analysisType: string, weights: WeightConfig) => Promise<string>
  loadWeightConfig: () => Promise<void>
  saveWeightConfig: (config: WeightConfig) => Promise<void>
  testConnection: () => Promise<boolean>
  recalculateScores: () => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
  alerts: [],
  unreadAlertsCount: 0,
  weightConfig: {
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
  },
  
  // Actions
  setEmployees: (employees) => set({ employees }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    unreadAlertsCount: state.unreadAlertsCount + 1
  })),
  
  markAlertAsRead: async (alertId) => {
    try {
      await supabaseService.markAlertAsRead(alertId)
      set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        ),
        unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1)
      }))
    } catch (error) {
      console.error('Error marking alert as read:', error)
      set({ error: 'Erro ao marcar alerta como lido' })
    }
  },
  
  updateWeightConfig: (config) => set({ weightConfig: config }),
  
  // API calls
  testConnection: async () => {
    try {
      console.log('🔗 Testando conexão com Supabase...')
      const isConnected = await supabaseService.testConnection()
      if (!isConnected) {
        set({ error: 'Falha na conexão com o banco de dados' })
      } else {
        set({ error: null })
      }
      return isConnected
    } catch (error) {
      console.error('Connection test failed:', error)
      set({ error: 'Erro ao testar conexão com o banco' })
      return false
    }
  },

  fetchEmployees: async () => {
    set({ loading: true, error: null })
    try {
      console.log('🔄 Iniciando fetchEmployees...')
      
      // Test connection first
      console.log('🔗 Testando conexão...')
      const isConnected = await supabaseService.testConnection()
      if (!isConnected) {
        throw new Error('Database connection failed')
      }
      console.log('✅ Conexão estabelecida')
      
      console.log('📊 Buscando colaboradores...')
      const employees = await supabaseService.getEmployees()
      console.log('📈 Colaboradores encontrados:', employees.length)
      
      if (employees.length === 0) {
        console.warn('⚠️ Nenhum colaborador encontrado no banco')
        set({ 
          employees: [], 
          loading: false, 
          error: 'Nenhum colaborador encontrado no banco de dados. Para popular o banco com dados de exemplo, acesse o painel do Supabase e importe os dados do arquivo CSV fornecido no projeto.' 
        })
        return
      }
      
      // Log dos primeiros colaboradores para debug
      console.log('👥 Primeiros colaboradores:', employees.slice(0, 3).map(e => ({ id: e.id, nome: e.nome, score: e.score })))
      
      set({ employees, loading: false, error: null })
      console.log('✅ Colaboradores carregados com sucesso')
    } catch (error) {
      console.error('❌ Erro ao buscar colaboradores:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar colaboradores'
      set({ 
        loading: false, 
        error: errorMessage,
        employees: [] 
      })
    }
  },

  fetchEmployee: async (id: number) => {
    try {
      console.log('🔍 Buscando colaborador ID:', id)
      const employee = await supabaseService.getEmployeeById(id)
      if (employee) {
        console.log('✅ Colaborador encontrado:', employee.nome)
        set({ selectedEmployee: employee })
      } else {
        console.warn('⚠️ Colaborador não encontrado:', id)
      }
      return employee
    } catch (error) {
      console.error('❌ Erro ao buscar colaborador:', error)
      set({ error: 'Erro ao carregar dados do colaborador' })
      return null
    }
  },

  fetchAlerts: async () => {
    try {
      console.log('🔔 Buscando alertas...')
      const alerts = await supabaseService.getAlerts()
      const unreadCount = alerts.filter(alert => !alert.isRead).length
      console.log('📢 Alertas carregados:', alerts.length, 'não lidos:', unreadCount)
      set({ alerts, unreadAlertsCount: unreadCount })
    } catch (error) {
      console.error('❌ Erro ao buscar alertas:', error)
      set({ error: 'Erro ao carregar alertas' })
    }
  },
  
  analyzeEmployee: async (employeeId, analysisType, weights) => {
    try {
      console.log('🧠 Gerando análise para colaborador:', employeeId, 'tipo:', analysisType)
      const { employees } = get()
      const employee = employees.find(emp => emp.id === employeeId)
      
      if (!employee) {
        throw new Error('Employee not found')
      }

      const analysis = await aiService.generateAnalysis(employee, analysisType, weights)
      console.log('✅ Análise gerada com sucesso')
      return analysis
    } catch (error) {
      console.error('❌ Erro ao gerar análise:', error)
      throw error
    }
  },

  loadWeightConfig: async () => {
    try {
      console.log('⚖️ Carregando configuração de pesos...')
      const config = await supabaseService.getDefaultWeightConfiguration()
      console.log('✅ Configuração carregada:', config)
      set({ weightConfig: config })
    } catch (error) {
      console.error('❌ Erro ao carregar configuração:', error)
      set({ error: 'Erro ao carregar configuração de pesos' })
    }
  },

  saveWeightConfig: async (config) => {
    try {
      console.log('💾 Salvando configuração de pesos...')
      await supabaseService.saveWeightConfiguration('User Configuration', config, true)
      set({ weightConfig: config })
      console.log('✅ Configuração salva com sucesso')
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error)
      set({ error: 'Erro ao salvar configuração de pesos' })
      throw error
    }
  },

  recalculateScores: async () => {
    try {
      console.log('🔄 Recalculando todos os scores...')
      const { employees, weightConfig } = get()
      
      if (employees.length === 0) {
        console.warn('⚠️ Nenhum colaborador para recalcular')
        return
      }

      const updatedEmployees = ScoreCalculationService.recalculateAllScores(employees, weightConfig)
      set({ employees: updatedEmployees })
      
      console.log('✅ Scores recalculados para todos os colaboradores')
    } catch (error) {
      console.error('❌ Erro ao recalcular scores:', error)
      set({ error: 'Erro ao recalcular scores dos colaboradores' })
    }
  }
}))