import { createClient } from '@supabase/supabase-js'
import { Employee, AnalysisRequest, Alert, WeightConfig, DashboardMetrics } from '../types'
import { ScoreCalculationService } from './scoreCalculationService'

// Configuração do Supabase com as credenciais fornecidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wotvfhwiqsgkgqcrwupo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdHZmaHdpcXNna2dxY3J3dXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDQ2MDksImV4cCI6MjA2Njc4MDYwOX0.fXz71KhcdhYXj8rhM7ehogU2AmZFh7T8wJ9t1-dXFMk'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

class SupabaseService {
  
  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Testando conexão com Supabase...')
      console.log('📍 URL:', supabaseUrl)
      console.log('🔑 Key presente:', !!supabaseAnonKey)
      
      // Testar uma query simples de leitura
      const { data, error } = await supabase
        .from('employees')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Erro na conexão:', error)
        return false
      }

      console.log('✅ Conexão bem-sucedida. Total de registros:', data)
      return true
    } catch (error) {
      console.error('❌ Erro de conexão:', error)
      return false
    }
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    try {
      console.log('📊 Executando query para buscar colaboradores...')
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('score', { ascending: false })

      if (error) {
        console.error('❌ Erro na query:', error)
        throw new Error(`Failed to fetch employees: ${error.message}`)
      }

      console.log('📈 Dados brutos do Supabase:', {
        count: data?.length || 0,
        sample: data?.slice(0, 2)
      })

      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum colaborador encontrado no banco de dados')
        return []
      }

      console.log('🔄 Mapeando dados dos colaboradores...')
      const mappedEmployees = data.map((record, index) => {
        try {
          return this.mapEmployeeFromDB(record)
        } catch (error) {
          console.error(`❌ Erro ao mapear colaborador ${index}:`, error, record)
          throw error
        }
      })
      
      console.log('✅ Mapeamento concluído:', {
        total: mappedEmployees.length,
        sample: mappedEmployees.slice(0, 2).map(e => ({ id: e.id, nome: e.nome, score: e.score }))
      })

      // CRÍTICO: Recalcular scores com base nos dados reais
      console.log('🧮 Recalculando scores baseados nos dados reais...')
      const defaultWeights = await this.getDefaultWeightConfiguration()
      const employeesWithUpdatedScores = mappedEmployees.map(employee => {
        const updatedEmployee = ScoreCalculationService.updateEmployeeScore(employee, defaultWeights)
        console.log(`📊 Score recalculado para ${updatedEmployee.nome}: ${updatedEmployee.score.toFixed(1)}`)
        return updatedEmployee
      })

      console.log('✅ Scores recalculados para todos os colaboradores')
      
      return employeesWithUpdatedScores
    } catch (error) {
      console.error('❌ Exceção em getEmployees:', error)
      throw error
    }
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    try {
      console.log('🔍 Buscando colaborador por ID:', id)
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', id.toString())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('⚠️ Colaborador não encontrado:', id)
          return null
        }
        console.error('❌ Erro ao buscar colaborador:', error)
        throw new Error(`Failed to fetch employee: ${error.message}`)
      }

      console.log('✅ Colaborador encontrado:', data.nome)
      const employee = this.mapEmployeeFromDB(data)
      
      // Recalcular score com dados atuais
      const defaultWeights = await this.getDefaultWeightConfiguration()
      return ScoreCalculationService.updateEmployeeScore(employee, defaultWeights)
    } catch (error) {
      console.error('❌ Exceção em getEmployeeById:', error)
      throw error
    }
  }

  async updateEmployee(employee: Partial<Employee>): Promise<Employee> {
    const dbEmployee = this.mapEmployeeToDB(employee)
    
    const { data, error } = await supabase
      .from('employees')
      .update(dbEmployee)
      .eq('employee_id', employee.id?.toString())
      .select()
      .single()

    if (error) {
      console.error('Error updating employee:', error)
      throw new Error('Failed to update employee')
    }

    const updatedEmployee = this.mapEmployeeFromDB(data)
    
    // Recalcular score após atualização
    const defaultWeights = await this.getDefaultWeightConfiguration()
    return ScoreCalculationService.updateEmployeeScore(updatedEmployee, defaultWeights)
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    try {
      const { data, error } = await supabase
        .from('employee_alerts')
        .select(`
          *,
          employees!inner(employee_id, nome, unidade_organizacional)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching alerts:', error)
        // Se a tabela não existir, retornar array vazio
        if (error.code === '42P01') {
          return []
        }
        throw new Error('Failed to fetch alerts')
      }

      return data.map(alert => ({
        id: alert.id,
        type: alert.alert_type as any,
        severity: alert.severity as any,
        title: alert.title,
        message: alert.message,
        employeeId: alert.employee_id ? parseInt(alert.employees?.employee_id || '0') : undefined,
        employeeName: alert.employees?.nome,
        timestamp: new Date(alert.created_at),
        isRead: alert.is_read,
        actionRequired: alert.action_required,
        department: alert.department || alert.employees?.unidade_organizacional
      }))
    } catch (error) {
      console.error('Exception in getAlerts:', error)
      return [] // Retornar array vazio em caso de erro
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('employee_alerts')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', alertId)

    if (error) {
      console.error('Error marking alert as read:', error)
      throw new Error('Failed to mark alert as read')
    }
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> {
    const { data, error } = await supabase
      .from('employee_alerts')
      .insert({
        employee_id: alert.employeeId ? await this.getEmployeeUUIDById(alert.employeeId) : null,
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        action_required: alert.actionRequired,
        department: alert.department
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating alert:', error)
      throw new Error('Failed to create alert')
    }

    return {
      id: data.id,
      type: data.alert_type as any,
      severity: data.severity as any,
      title: data.title,
      message: data.message,
      employeeId: alert.employeeId,
      employeeName: alert.employeeName,
      timestamp: new Date(data.created_at),
      isRead: data.is_read,
      actionRequired: data.action_required,
      department: data.department
    }
  }

  // Weight Configurations
  async getWeightConfigurations(): Promise<WeightConfig[]> {
    try {
      const { data, error } = await supabase
        .from('weight_configurations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching weight configurations:', error)
        return []
      }

      return data.map(config => config.weights as WeightConfig)
    } catch (error) {
      console.error('Exception in getWeightConfigurations:', error)
      return []
    }
  }

  async getDefaultWeightConfiguration(): Promise<WeightConfig> {
    try {
      const { data, error } = await supabase
        .from('weight_configurations')
        .select('weights')
        .eq('is_default', true)
        .single()

      if (error) {
        console.error('Error fetching default weight configuration:', error)
        // Return default if not found
        return {
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
      }

      return data.weights as WeightConfig
    } catch (error) {
      console.error('Exception in getDefaultWeightConfiguration:', error)
      return {
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
    }
  }

  async saveWeightConfiguration(name: string, weights: WeightConfig, isDefault = false): Promise<void> {
    try {
      // If setting as default, first unset all other defaults
      if (isDefault) {
        await supabase
          .from('weight_configurations')
          .update({ is_default: false })
          .eq('is_default', true)
      }

      const { error } = await supabase
        .from('weight_configurations')
        .insert({
          name,
          weights,
          is_default: isDefault
        })

      if (error) {
        console.error('Error saving weight configuration:', error)
        throw new Error('Failed to save weight configuration')
      }
    } catch (error) {
      console.error('Exception in saveWeightConfiguration:', error)
      throw error
    }
  }

  // Analysis History
  async saveAnalysis(
    employeeId: number, 
    analysisType: string, 
    content: string, 
    weights: WeightConfig,
    score: number
  ): Promise<void> {
    try {
      const employeeUUID = await this.getEmployeeUUIDById(employeeId)
      
      const { error } = await supabase
        .from('analysis_history')
        .insert({
          employee_id: employeeUUID,
          analysis_type: analysisType,
          analysis_content: content,
          weights_used: weights,
          score_at_time: score
        })

      if (error) {
        console.error('Error saving analysis:', error)
        throw new Error('Failed to save analysis')
      }
    } catch (error) {
      console.error('Exception in saveAnalysis:', error)
      throw error
    }
  }

  async getAnalysisHistory(employeeId: number): Promise<any[]> {
    try {
      const employeeUUID = await this.getEmployeeUUIDById(employeeId)
      
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('employee_id', employeeUUID)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching analysis history:', error)
        return []
      }

      return data
    } catch (error) {
      console.error('Exception in getAnalysisHistory:', error)
      return []
    }
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const employees = await this.getEmployees()
    
    const totalEmployees = employees.length
    const highRiskEmployees = employees.filter(emp => 
      emp.riscoPerdaTexto?.toLowerCase() === 'alto'
    ).length
    const averageScore = employees.reduce((sum, emp) => sum + emp.score, 0) / totalEmployees
    const retentionRate = ((totalEmployees - highRiskEmployees) / totalEmployees) * 100
    
    const topPerformers = employees
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    const riskDistribution = {
      alto: employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'alto').length,
      medio: employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'médio').length,
      baixo: employees.filter(emp => emp.riscoPerdaTexto?.toLowerCase() === 'baixo').length,
    }

    // Department metrics
    const departmentMetrics = employees.reduce((acc, emp) => {
      const dept = emp.area || 'Não definido'
      if (!acc[dept]) {
        acc[dept] = {
          count: 0,
          averageScore: 0,
          riskLevel: 'baixo',
          averageSalary: 0,
          diversityScore: 0
        }
      }
      acc[dept].count++
      acc[dept].averageScore += emp.score
      acc[dept].averageSalary += emp.salario
      acc[dept].diversityScore += emp.scoreDiversidade || 0
      return acc
    }, {} as any)

    Object.keys(departmentMetrics).forEach(dept => {
      const metrics = departmentMetrics[dept]
      metrics.averageScore /= metrics.count
      metrics.averageSalary /= metrics.count
      metrics.diversityScore /= metrics.count
    })

    // Diversity metrics
    const diversityMetrics = {
      genero: this.groupBy(employees, 'genero'),
      racaCor: this.groupBy(employees, 'racaCor'),
      orientacaoSexual: this.groupBy(employees, 'orientacaoSexual'),
      grauEscolaridade: this.groupBy(employees, 'grauEscolaridade')
    }

    // Salary metrics
    const salaryMetrics = {
      averageByCargo: this.averageBy(employees, 'cargoAtual', 'salario'),
      averageByGender: this.averageBy(employees, 'genero', 'salario'),
      averageByEducation: this.averageBy(employees, 'grauEscolaridade', 'salario')
    }

    return {
      totalEmployees,
      highRiskEmployees,
      averageScore,
      retentionRate,
      topPerformers,
      riskDistribution,
      departmentMetrics,
      diversityMetrics,
      salaryMetrics
    }
  }

  // Helper methods
  private async getEmployeeUUIDById(employeeId: number): Promise<string> {
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .eq('employee_id', employeeId.toString())
      .single()

    if (error) {
      throw new Error('Employee not found')
    }

    return data.id
  }

  private mapEmployeeFromDB(data: any): Employee {
    try {
      console.log('🔄 Mapeando colaborador:', data.nome)
      
      // Calcular tempo desde última promoção
      const dataUltimaPromocao = new Date(data.data_ultima_promocao || Date.now())
      const tempoUltimaPromocao = this.calculateYearsDiff(dataUltimaPromocao, new Date())
      
      // Calcular tempo na casa
      const dataAdmissao = new Date(data.data_admissao || Date.now())
      const tempoDeCasa = this.calculateYearsDiff(dataAdmissao, new Date())
      
      // Calcular tempo no cargo (usar tempo_no_cargo se disponível, senão calcular)
      const tempoNoCargo = data.tempo_no_cargo || (data.tempo_cargo_atual_meses || 0) / 12
      
      const employee: Employee = {
        id: parseInt(data.employee_id),
        nome: data.nome || '',
        matricula: data.matricula || '',
        genero: data.genero || '',
        racaCor: data.raca_cor || '',
        orientacaoSexual: data.orientacao_sexual || '',
        empresa: data.empresa || '',
        unidadeOrganizacional: data.unidade_organizacional || '',
        centroCustos: data.centro_custos || '',
        gestorImediato: data.gestor_imediato || '',
        cargoAtual: data.cargo_atual || '',
        tabelaSalarial: data.tabela_salarial || '',
        faixaSalarial: data.faixa_salarial || '',
        nivelSalarial: data.nivel_salarial || '',
        salario: parseFloat(data.salario) || 0,
        dataAdmissao: dataAdmissao,
        dataUltimaPromocao: dataUltimaPromocao,
        resultadoAvaliacaoDesempenho: data.resultado_avaliacao_desempenho || '',
        dataUltimaAvaliacao: new Date(data.data_ultima_avaliacao || Date.now()),
        numeroAdvertencias: data.numero_advertencias || 0,
        faltasInjustificadas: data.faltas_injustificadas || 0,
        diasAfastamento: data.dias_afastamento || 0,
        probabilidadeRiscoPerda: data.probabilidade_risco_perda || '',
        impactoPerda: data.impacto_perda || '',
        grauEscolaridade: data.grau_escolaridade || '',
        cursosConcluidos: data.cursos_concluidos || '',
        certificacoesRelevantes: data.certificacoes_relevantes || '',
        idiomasFalados: data.idiomas_falados || '',
        atualizacaoRecenteFormacao: new Date(data.atualizacao_recente_formacao || Date.now()),
        tempoCargoAtual: (data.tempo_cargo_atual_meses || 0) / 12,
        
        // Campos calculados
        area: data.unidade_organizacional || '',
        desempenhoTexto: data.resultado_avaliacao_desempenho || '',
        riscoPerdaTexto: data.probabilidade_risco_perda || '',
        impactoPerdaTexto: data.impacto_perda || '',
        tempoDeCasa: tempoDeCasa,
        tempoNoCargo: tempoNoCargo,
        absenteismo: parseFloat(data.absenteismo) || 0,
        advertencias: data.numero_advertencias || 0,
        score: parseFloat(data.score) || 0, // Será recalculado
        reajusteSugerido: parseFloat(data.reajuste_sugerido) || 0,
        feedbackUltimaAvaliacao: data.feedback_ultima_avaliacao || '',
        scoreSentimento: parseFloat(data.score_sentimento) || 0.5,
        isAbsenteismoAnomalo: data.is_absenteismo_anomalo || false,
        tempoUltimaPromocao: tempoUltimaPromocao,
        scoreExperiencia: parseFloat(data.score_experiencia) || 0,
        scoreDiversidade: parseFloat(data.score_diversidade) || 0,
        scoreFormacao: parseFloat(data.score_formacao) || 0,
        riskFactors: data.risk_factors || [],
        strengths: data.strengths || []
      }
      
      console.log('✅ Colaborador mapeado:', {
        id: employee.id,
        nome: employee.nome,
        score: employee.score,
        area: employee.area,
        risco: employee.riscoPerdaTexto,
        tempoCasa: employee.tempoDeCasa,
        tempoNoCargo: employee.tempoNoCargo
      })
      
      return employee
    } catch (error) {
      console.error('❌ Erro ao mapear colaborador:', error, data)
      throw new Error(`Failed to map employee data: ${error}`)
    }
  }

  private mapEmployeeToDB(employee: Partial<Employee>): any {
    return {
      employee_id: employee.id?.toString(),
      matricula: employee.matricula,
      nome: employee.nome,
      genero: employee.genero,
      raca_cor: employee.racaCor,
      orientacao_sexual: employee.orientacaoSexual,
      empresa: employee.empresa,
      unidade_organizacional: employee.unidadeOrganizacional,
      centro_custos: employee.centroCustos,
      gestor_imediato: employee.gestorImediato,
      cargo_atual: employee.cargoAtual,
      tabela_salarial: employee.tabelaSalarial,
      faixa_salarial: employee.faixaSalarial,
      nivel_salarial: employee.nivelSalarial,
      salario: employee.salario,
      data_admissao: employee.dataAdmissao?.toISOString().split('T')[0],
      data_ultima_promocao: employee.dataUltimaPromocao?.toISOString().split('T')[0],
      resultado_avaliacao_desempenho: employee.resultadoAvaliacaoDesempenho,
      data_ultima_avaliacao: employee.dataUltimaAvaliacao?.toISOString().split('T')[0],
      numero_advertencias: employee.numeroAdvertencias,
      faltas_injustificadas: employee.faltasInjustificadas,
      dias_afastamento: employee.diasAfastamento,
      probabilidade_risco_perda: employee.probabilidadeRiscoPerda,
      impacto_perda: employee.impactoPerda,
      grau_escolaridade: employee.grauEscolaridade,
      cursos_concluidos: employee.cursosConcluidos,
      certificacoes_relevantes: employee.certificacoesRelevantes,
      idiomas_falados: employee.idiomasFalados,
      atualizacao_recente_formacao: employee.atualizacaoRecenteFormacao?.toISOString().split('T')[0],
      tempo_cargo_atual_meses: Math.round((employee.tempoCargoAtual || 0) * 12),
      tempo_de_casa: employee.tempoDeCasa,
      tempo_no_cargo: employee.tempoNoCargo,
      absenteismo: employee.absenteismo,
      score: employee.score,
      reajuste_sugerido: employee.reajusteSugerido,
      feedback_ultima_avaliacao: employee.feedbackUltimaAvaliacao,
      score_sentimento: employee.scoreSentimento,
      is_absenteismo_anomalo: employee.isAbsenteismoAnomalo,
      score_experiencia: employee.scoreExperiencia,
      score_diversidade: employee.scoreDiversidade,
      score_formacao: employee.scoreFormacao,
      risk_factors: employee.riskFactors,
      strengths: employee.strengths
    }
  }

  private calculateYearsDiff(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
    return Math.round(diffYears * 10) / 10
  }

  private groupBy(array: any[], key: string): { [key: string]: number } {
    return array.reduce((acc, item) => {
      const value = item[key] || 'Não informado'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }

  private averageBy(array: any[], groupKey: string, valueKey: string): { [key: string]: number } {
    const groups = array.reduce((acc, item) => {
      const group = item[groupKey] || 'Não informado'
      if (!acc[group]) acc[group] = []
      acc[group].push(item[valueKey] || 0)
      return acc
    }, {})

    return Object.keys(groups).reduce((acc, key) => {
      const values = groups[key]
      acc[key] = values.reduce((sum: number, val: number) => sum + val, 0) / values.length
      return acc
    }, {})
  }
}

export const supabaseService = new SupabaseService()