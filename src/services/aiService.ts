import { Employee, WeightConfig } from '../types'
import { supabaseService } from './supabaseService'
import { azureOpenAIService } from './azureOpenAIService'

class AIService {
  
  async generateAnalysis(
    employee: Employee, 
    analysisType: string, 
    weights: WeightConfig
  ): Promise<string> {
    try {
      console.log('🧠 Iniciando análise EXCLUSIVA via LLM para:', employee.nome, 'tipo:', analysisType)
      
      // CRÍTICO: Usar APENAS Azure OpenAI - NUNCA dados simulados
      const analysis = await azureOpenAIService.generateEmployeeAnalysis(
        employee.nome,
        analysisType,
        {
          // Dados básicos
          nome: employee.nome,
          matricula: employee.matricula,
          cargoAtual: employee.cargoAtual,
          area: employee.area,
          empresa: employee.empresa,
          centroCustos: employee.centroCustos,
          gestorImediato: employee.gestorImediato,
          
          // Dados demográficos
          genero: employee.genero,
          racaCor: employee.racaCor,
          orientacaoSexual: employee.orientacaoSexual,
          idiomasFalados: employee.idiomasFalados,
          
          // Performance e avaliação
          score: employee.score,
          desempenhoTexto: employee.desempenhoTexto,
          resultadoAvaliacaoDesempenho: employee.resultadoAvaliacaoDesempenho,
          dataUltimaAvaliacao: employee.dataUltimaAvaliacao,
          feedbackUltimaAvaliacao: employee.feedbackUltimaAvaliacao,
          
          // Risco e impacto
          riscoPerdaTexto: employee.riscoPerdaTexto,
          probabilidadeRiscoPerda: employee.probabilidadeRiscoPerda,
          impactoPerdaTexto: employee.impactoPerdaTexto,
          impactoPerda: employee.impactoPerda,
          
          // Tempo e experiência
          tempoDeCasa: employee.tempoDeCasa,
          tempoNoCargo: employee.tempoNoCargo,
          tempoCargoAtual: employee.tempoCargoAtual,
          dataAdmissao: employee.dataAdmissao,
          dataUltimaPromocao: employee.dataUltimaPromocao,
          tempoUltimaPromocao: employee.tempoUltimaPromocao,
          
          // Remuneração
          salario: employee.salario,
          tabelaSalarial: employee.tabelaSalarial,
          faixaSalarial: employee.faixaSalarial,
          nivelSalarial: employee.nivelSalarial,
          reajusteSugerido: employee.reajusteSugerido,
          
          // Comportamento e disciplina
          numeroAdvertencias: employee.numeroAdvertencias,
          faltasInjustificadas: employee.faltasInjustificadas,
          absenteismo: employee.absenteismo,
          isAbsenteismoAnomalo: employee.isAbsenteismoAnomalo,
          diasAfastamento: employee.diasAfastamento,
          
          // Formação e qualificação
          grauEscolaridade: employee.grauEscolaridade,
          cursosConcluidos: employee.cursosConcluidos,
          certificacoesRelevantes: employee.certificacoesRelevantes,
          atualizacaoRecenteFormacao: employee.atualizacaoRecenteFormacao,
          
          // Scores detalhados
          scoreSentimento: employee.scoreSentimento,
          scoreExperiencia: employee.scoreExperiencia,
          scoreDiversidade: employee.scoreDiversidade,
          scoreFormacao: employee.scoreFormacao,
          
          // Fatores identificados
          riskFactors: employee.riskFactors,
          strengths: employee.strengths
        }
      )
      
      // Salvar a análise no histórico
      await supabaseService.saveAnalysis(
        employee.id,
        analysisType,
        analysis,
        weights,
        employee.score
      )

      console.log('✅ Análise LLM gerada e salva com sucesso')
      return analysis
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO: Falha na análise LLM:', error)
      
      // IMPORTANTE: Não usar fallback - informar erro ao usuário
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (errorMessage.includes('não configurado')) {
        throw new Error('🔧 Azure OpenAI não configurado.\n\nPara usar as análises de IA, configure as variáveis de ambiente:\n\n• VITE_AZURE_OPENAI_ENDPOINT\n• VITE_AZURE_OPENAI_API_KEY\n• VITE_AZURE_OPENAI_DEPLOYMENT_NAME\n\nVerifique a página de Configurações para mais detalhes.')
      }
      
      throw new Error(`❌ Erro na análise de IA: ${errorMessage}\n\nTente novamente em alguns instantes. Se o problema persistir, verifique a configuração do Azure OpenAI.`)
    }
  }

  // Método para testar a conexão com Azure OpenAI
  async testAzureOpenAI(): Promise<boolean> {
    try {
      return await azureOpenAIService.testConnection()
    } catch (error) {
      console.error('❌ Erro ao testar Azure OpenAI:', error)
      return false
    }
  }

  // Método para verificar se está configurado
  isConfigured(): boolean {
    return !!(
      import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
      import.meta.env.VITE_AZURE_OPENAI_API_KEY &&
      import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME
    )
  }
}

export const aiService = new AIService()