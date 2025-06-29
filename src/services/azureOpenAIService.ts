interface AzureOpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AzureOpenAIRequest {
  messages: AzureOpenAIMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

interface AzureOpenAIResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class AzureOpenAIService {
  private endpoint: string
  private apiKey: string
  private deploymentName: string
  private apiVersion: string

  constructor() {
    this.endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || ''
    this.apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY || ''
    this.deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini'
    this.apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-12-01-preview'
  }

  private isConfigured(): boolean {
    return !!(this.endpoint && this.apiKey && this.deploymentName)
  }

  private getApiUrl(): string {
    return `${this.endpoint}openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`
  }

  async generateChatResponse(userMessage: string, conversationHistory: AzureOpenAIMessage[] = []): Promise<string> {
    if (!this.isConfigured()) {
      console.warn('❌ Azure OpenAI não configurado - ANÁLISE INDISPONÍVEL')
      throw new Error('Azure OpenAI não configurado. Configure as variáveis de ambiente para usar a IA.')
    }

    try {
      const systemMessage: AzureOpenAIMessage = {
        role: 'system',
        content: `Você é o assistente de IA do ReconheceAI, uma plataforma especializada em gestão de talentos e recursos humanos. 

Suas responsabilidades incluem:
- Ajudar com análises de colaboradores e métricas de RH
- Explicar scores de reconhecimento e fatores de risco
- Sugerir estratégias de retenção e desenvolvimento
- Interpretar dados de performance e diversidade
- Fornecer insights sobre gestão de talentos

Características do seu comportamento:
- Seja profissional, mas acessível
- Use linguagem clara e objetiva
- Forneça respostas práticas e acionáveis
- Baseie suas respostas em boas práticas de RH
- Seja conciso, mas completo
- Use emojis ocasionalmente para tornar a conversa mais amigável

Responda sempre em português brasileiro.`
      }

      const messages: AzureOpenAIMessage[] = [
        systemMessage,
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]

      const requestBody: AzureOpenAIRequest = {
        messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      }

      console.log('🤖 Enviando requisição para Azure OpenAI:', {
        endpoint: this.endpoint,
        deployment: this.deploymentName,
        messageCount: messages.length
      })

      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na API Azure OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Azure OpenAI API error: ${response.status} - ${response.statusText}`)
      }

      const data: AzureOpenAIResponse = await response.json()
      
      console.log('✅ Resposta recebida do Azure OpenAI:', {
        tokensUsed: data.usage?.total_tokens || 0,
        finishReason: data.choices[0]?.finish_reason
      })

      return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta adequada.'

    } catch (error) {
      console.error('❌ Erro ao chamar Azure OpenAI:', error)
      throw error // Não usar fallback - forçar uso da LLM
    }
  }

  async generateEmployeeAnalysis(
    employeeName: string, 
    analysisType: string, 
    employeeData: any
  ): Promise<string> {
    if (!this.isConfigured()) {
      console.error('❌ Azure OpenAI não configurado - ANÁLISE INDISPONÍVEL')
      throw new Error('Azure OpenAI não configurado. Para usar as análises de IA, configure as variáveis de ambiente do Azure OpenAI.')
    }

    try {
      console.log('🧠 Gerando análise EXCLUSIVAMENTE via LLM para:', employeeName, 'tipo:', analysisType)

      const systemMessage: AzureOpenAIMessage = {
        role: 'system',
        content: `Você é um especialista sênior em análise de talentos e gestão de recursos humanos com mais de 15 anos de experiência. Sua expertise inclui psicologia organizacional, análise comportamental, estratégias de retenção e desenvolvimento de carreira.

INSTRUÇÕES CRÍTICAS:
- Analise EXCLUSIVAMENTE os dados reais fornecidos do colaborador
- NUNCA use informações genéricas ou pré-definidas
- Baseie TODAS as conclusões nos dados específicos apresentados
- Forneça insights únicos e personalizados para este colaborador específico
- Use sua expertise para identificar padrões e correlações nos dados

TIPOS DE ANÁLISE:
- risk: Análise profunda de risco de saída com plano de retenção específico
- impact: Avaliação detalhada do impacto organizacional da perda
- recognition: Estratégia personalizada de reconhecimento e valorização
- development: Plano de desenvolvimento de carreira baseado no perfil
- diversity: Análise de contribuição para diversidade e inclusão

FORMATO DE RESPOSTA:
- Use APENAS HTML válido com tags: <p>, <strong>, <ul>, <li>
- Seja específico e detalhado
- Inclua números e dados concretos quando relevante
- Forneça recomendações práticas e acionáveis
- Mantenha tom profissional mas acessível

IMPORTANTE: Cada análise deve ser única e baseada exclusivamente nos dados fornecidos.`
      }

      // Preparar dados completos do colaborador para análise
      const employeeDataFormatted = this.formatEmployeeDataForAnalysis(employeeData)

      const userMessage = `ANÁLISE SOLICITADA: ${analysisType.toUpperCase()}
COLABORADOR: ${employeeName}

DADOS COMPLETOS DO COLABORADOR:
${employeeDataFormatted}

Por favor, analise estes dados reais e gere uma ${analysisType} analysis detalhada e personalizada. Base sua análise EXCLUSIVAMENTE nos dados fornecidos acima, identificando padrões, correlações e insights específicos para este colaborador.`

      const messages: AzureOpenAIMessage[] = [
        systemMessage,
        { role: 'user', content: userMessage }
      ]

      const requestBody: AzureOpenAIRequest = {
        messages,
        max_tokens: 1200, // Aumentado para análises mais detalhadas
        temperature: 0.3, // Reduzido para mais consistência
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }

      console.log('📊 Enviando dados completos para análise LLM:', {
        colaborador: employeeName,
        tipoAnalise: analysisType,
        dadosIncluidos: Object.keys(employeeData).length
      })

      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na API Azure OpenAI para análise:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Erro na análise Azure OpenAI: ${response.status} - ${response.statusText}`)
      }

      const data: AzureOpenAIResponse = await response.json()
      
      console.log('✅ Análise LLM gerada com sucesso:', {
        colaborador: employeeName,
        tokensUsados: data.usage?.total_tokens || 0,
        tipoAnalise: analysisType
      })

      const analysis = data.choices[0]?.message?.content
      
      if (!analysis) {
        throw new Error('LLM não retornou análise válida')
      }

      return analysis

    } catch (error) {
      console.error('❌ Erro ao gerar análise LLM:', error)
      throw error // Não usar fallback - forçar uso exclusivo da LLM
    }
  }

  private formatEmployeeDataForAnalysis(employeeData: any): string {
    return `
INFORMAÇÕES BÁSICAS:
• Nome: ${employeeData.nome || 'N/A'}
• Cargo: ${employeeData.cargoAtual || 'N/A'}
• Departamento: ${employeeData.area || 'N/A'}
• Matrícula: ${employeeData.matricula || 'N/A'}

DADOS DEMOGRÁFICOS:
• Gênero: ${employeeData.genero || 'N/A'}
• Raça/Cor: ${employeeData.racaCor || 'N/A'}
• Orientação Sexual: ${employeeData.orientacaoSexual || 'N/A'}
• Idiomas: ${employeeData.idiomasFalados || 'N/A'}

PERFORMANCE E AVALIAÇÃO:
• Score de Reconhecimento: ${employeeData.score || 0}/500
• Resultado Avaliação: ${employeeData.desempenhoTexto || 'N/A'}
• Data Última Avaliação: ${employeeData.dataUltimaAvaliacao ? new Date(employeeData.dataUltimaAvaliacao).toLocaleDateString('pt-BR') : 'N/A'}
• Feedback Última Avaliação: ${employeeData.feedbackUltimaAvaliacao || 'N/A'}

RISCO E IMPACTO:
• Probabilidade Risco Perda: ${employeeData.riscoPerdaTexto || 'N/A'}
• Impacto da Perda: ${employeeData.impactoPerdaTexto || 'N/A'}
• Score Sentimento: ${((1 - (employeeData.scoreSentimento || 0)) * 100).toFixed(1)}% (satisfação)

TEMPO E EXPERIÊNCIA:
• Tempo na Empresa: ${employeeData.tempoDeCasa || 0} anos
• Tempo no Cargo Atual: ${employeeData.tempoNoCargo || 0} anos
• Tempo Última Promoção: ${employeeData.tempoUltimaPromocao || 0} anos
• Data Admissão: ${employeeData.dataAdmissao ? new Date(employeeData.dataAdmissao).toLocaleDateString('pt-BR') : 'N/A'}
• Data Última Promoção: ${employeeData.dataUltimaPromocao ? new Date(employeeData.dataUltimaPromocao).toLocaleDateString('pt-BR') : 'N/A'}

REMUNERAÇÃO:
• Salário Atual: R$ ${employeeData.salario?.toLocaleString('pt-BR') || '0'}
• Tabela Salarial: ${employeeData.tabelaSalarial || 'N/A'}
• Faixa Salarial: ${employeeData.faixaSalarial || 'N/A'}
• Nível Salarial: ${employeeData.nivelSalarial || 'N/A'}
• Reajuste Sugerido: R$ ${employeeData.reajusteSugerido?.toLocaleString('pt-BR') || '0'}

COMPORTAMENTO E DISCIPLINA:
• Número de Advertências: ${employeeData.numeroAdvertencias || 0}
• Faltas Injustificadas: ${employeeData.faltasInjustificadas || 0}
• Taxa de Absenteísmo: ${((employeeData.absenteismo || 0) * 100).toFixed(2)}%
• Absenteísmo Anômalo: ${employeeData.isAbsenteismoAnomalo ? 'SIM' : 'NÃO'}
• Dias de Afastamento: ${employeeData.diasAfastamento || 0}

FORMAÇÃO E QUALIFICAÇÃO:
• Grau Escolaridade: ${employeeData.grauEscolaridade || 'N/A'}
• Cursos Concluídos: ${employeeData.cursosConcluidos || 'N/A'}
• Certificações: ${employeeData.certificacoesRelevantes || 'N/A'}
• Score Formação: ${(employeeData.scoreFormacao || 0).toFixed(1)}%
• Atualização Recente: ${employeeData.atualizacaoRecenteFormacao ? new Date(employeeData.atualizacaoRecenteFormacao).toLocaleDateString('pt-BR') : 'N/A'}

SCORES DETALHADOS:
• Score Experiência: ${(employeeData.scoreExperiencia || 0).toFixed(1)}%
• Score Diversidade: ${(employeeData.scoreDiversidade || 0).toFixed(1)}%
• Score Formação: ${(employeeData.scoreFormacao || 0).toFixed(1)}%

ESTRUTURA ORGANIZACIONAL:
• Empresa: ${employeeData.empresa || 'N/A'}
• Centro de Custos: ${employeeData.centroCustos || 'N/A'}
• Gestor Imediato: ${employeeData.gestorImediato || 'N/A'}

FATORES DE RISCO IDENTIFICADOS:
${employeeData.riskFactors && employeeData.riskFactors.length > 0 
  ? employeeData.riskFactors.map((factor: string) => `• ${factor}`).join('\n')
  : '• Nenhum fator de risco específico identificado'
}

PONTOS FORTES IDENTIFICADOS:
${employeeData.strengths && employeeData.strengths.length > 0 
  ? employeeData.strengths.map((strength: string) => `• ${strength}`).join('\n')
  : '• Nenhum ponto forte específico identificado'
}
`
  }

  // Método para testar a conexão
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('❌ Azure OpenAI não configurado')
      return false
    }

    try {
      console.log('🔗 Testando conexão Azure OpenAI...')
      
      const testMessage: AzureOpenAIMessage = {
        role: 'user',
        content: 'Teste de conexão - responda apenas "OK"'
      }

      const requestBody: AzureOpenAIRequest = {
        messages: [testMessage],
        max_tokens: 10,
        temperature: 0
      }

      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        console.log('✅ Azure OpenAI conectado com sucesso')
        return true
      } else {
        console.error('❌ Erro na conexão Azure OpenAI:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao testar conexão Azure OpenAI:', error)
      return false
    }
  }
}

export const azureOpenAIService = new AzureOpenAIService()