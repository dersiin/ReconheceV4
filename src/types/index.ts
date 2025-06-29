export interface Employee {
  id: number
  nome: string
  matricula: string
  genero: string
  racaCor: string
  orientacaoSexual: string
  empresa: string
  unidadeOrganizacional: string
  centroCustos: string
  gestorImediato: string
  cargoAtual: string
  tabelaSalarial: string
  faixaSalarial: string
  nivelSalarial: string
  salario: number
  dataAdmissao: Date
  dataUltimaPromocao: Date
  resultadoAvaliacaoDesempenho: string
  dataUltimaAvaliacao: Date
  numeroAdvertencias: number
  faltasInjustificadas: number
  diasAfastamento: number
  probabilidadeRiscoPerda: string
  impactoPerda: string
  grauEscolaridade: string
  cursosConcluidos: string
  certificacoesRelevantes: string
  idiomasFalados: string
  atualizacaoRecenteFormacao: Date
  tempoCargoAtual: number
  
  // Campos calculados
  area: string // Derivado de unidadeOrganizacional
  desempenhoTexto: string // Derivado de resultadoAvaliacaoDesempenho
  riscoPerdaTexto: string // Derivado de probabilidadeRiscoPerda
  impactoPerdaTexto: string // Derivado de impactoPerda
  tempoDeCasa: number // Calculado a partir de dataAdmissao
  tempoNoCargo: number // Derivado de tempoCargoAtual
  absenteismo: number // Calculado a partir de faltasInjustificadas
  advertencias: number // Derivado de numeroAdvertencias
  score: number
  reajusteSugerido: number
  feedbackUltimaAvaliacao: string // Simulado baseado nos dados
  scoreSentimento: number
  isAbsenteismoAnomalo: boolean
  
  // Novos campos para análise avançada
  tempoUltimaPromocao: number // Calculado
  scoreExperiencia: number // Calculado
  scoreDiversidade: number // Calculado
  scoreFormacao: number // Calculado
  riskFactors: string[] // Lista de fatores de risco identificados
  strengths: string[] // Lista de pontos fortes
}

export interface AnalysisRequest {
  colaboradorId: number
  analysisType: 'risk' | 'impact' | 'recognition' | 'development' | 'diversity'
  weights: WeightConfig
}

export interface AnalysisResponse {
  analise: string
}

export interface DashboardMetrics {
  totalEmployees: number
  highRiskEmployees: number
  averageScore: number
  retentionRate: number
  topPerformers: Employee[]
  riskDistribution: {
    alto: number
    medio: number
    baixo: number
  }
  departmentMetrics: {
    [key: string]: {
      count: number
      averageScore: number
      riskLevel: string
      averageSalary: number
      diversityScore: number
    }
  }
  diversityMetrics: {
    genero: { [key: string]: number }
    racaCor: { [key: string]: number }
    orientacaoSexual: { [key: string]: number }
    grauEscolaridade: { [key: string]: number }
  }
  salaryMetrics: {
    averageByCargo: { [key: string]: number }
    averageByGender: { [key: string]: number }
    averageByEducation: { [key: string]: number }
  }
}

export interface Alert {
  id: string
  type: 'high_risk' | 'anomaly' | 'performance' | 'retention' | 'salary_gap' | 'diversity' | 'promotion_delay'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  employeeId?: number
  employeeName?: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
  category?: string
  department?: string
}

export interface ReportConfig {
  id: string
  name: string
  type: 'executive' | 'departmental' | 'individual' | 'comparative' | 'diversity' | 'salary'
  filters: {
    departments?: string[]
    riskLevels?: string[]
    performanceLevels?: string[]
    genders?: string[]
    educationLevels?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
  }
  metrics: string[]
  format: 'pdf' | 'excel' | 'csv'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

export interface WeightConfig {
  desempenho: number
  tempoCargo: number
  tempoCasa: number
  riscoPerda: number
  impactoPerda: number
  absenteismo: number
  salario: number
  formacao: number
  diversidade: number
  experiencia: number
}

// NOVAS INTERFACES PARA ORÇAMENTO E GESTÃO SALARIAL
export interface BudgetData {
  centroCustos: string
  departamento: string
  orcamentoAnual: number
  orcamentoUtilizado: number
  orcamentoDisponivel: number
  percentualUtilizado: number
  colaboradores: number
  salarioMedio: number
  projecaoGastos: number
}

export interface SalaryAdjustment {
  employeeId: number
  employeeName: string
  salarioAtual: number
  percentualAumento: number
  novoSalario: number
  justificativa: string
  impactoOrcamento: number
  aprovado: boolean
  dataAprovacao?: Date
  aprovadoPor?: string
}

export interface BudgetAnalysis {
  totalBudget: number
  totalUsed: number
  totalAvailable: number
  utilizationRate: number
  departments: BudgetData[]
  recommendations: string[]
  riskFactors: string[]
  opportunities: string[]
}

export interface SalaryTable {
  cargo: string
  nivel: string
  salarioMinimo: number
  salarioMedio: number
  salarioMaximo: number
  mercadoReferencia: number
  gap: number
}

export interface PromotionCandidate {
  employeeId: number
  employeeName: string
  cargoAtual: string
  cargoSugerido: string
  score: number
  tempoCargo: number
  justificativa: string
  impactoSalarial: number
  probabilidadeAprovacao: number
}

export interface CSVRecord {
  'ID do Colaborador': string
  'Nome do Colaborador': string
  'Matrícula': string
  'Gênero': string
  'Raça/Cor': string
  'Orientação Sexual': string
  'Empresa': string
  'Unidade Organizacional': string
  'Centro de custos': string
  'Gestor Imediato': string
  'Cargo Atual': string
  'Tabela Salarial': string
  'Faixa Salarial': string
  'Nível Salarial': string
  'Salário': string
  'Data de Admissão': string
  'Data da Última Promoção ou Reajuste': string
  'Resultado da Avaliação de Desempenho': string
  'Data da Última Avaliação': string
  'Número de Advertências nos últimos 12 meses': string
  'Faltas Injustificadas / Absenteísmo': string
  'Dias de Afastamento (últimos 12 meses)': string
  'Probabilidade de Risco de Perda': string
  'Impacto da Perda': string
  'Grau de Escolaridade': string
  'Cursos concluídos': string
  'Certificações relevantes': string
  'Idiomas falados': string
  'Atualização recente (formação)': string
  'Tempo no cargo atual': string
}