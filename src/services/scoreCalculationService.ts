import { Employee, WeightConfig } from '../types'

export interface ScoreBreakdown {
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
  scoreTotal: number
  detalhes: {
    [key: string]: {
      valor: number
      peso: number
      contribuicao: number
      justificativa: string
    }
  }
}

export class ScoreCalculationService {
  // MELHORIA: Define a pontuação máxima como uma constante para fácil manutenção.
  private static readonly MAX_SCORE = 500;
  
  /**
   * Calcula o score completo de um colaborador baseado nos dados reais
   * e nos pesos configurados pelo usuário, agora em uma escala de 500 pontos.
   */
  static calculateEmployeeScore(employee: Employee, weights: WeightConfig): ScoreBreakdown {
    console.log('🧮 Calculando score para:', employee.nome)
    
    const breakdown: ScoreBreakdown = {
      desempenho: 0,
      tempoCargo: 0,
      tempoCasa: 0,
      riscoPerda: 0,
      impactoPerda: 0,
      absenteismo: 0,
      salario: 0,
      formacao: 0,
      diversidade: 0,
      experiencia: 0,
      scoreTotal: 0,
      detalhes: {}
    }

    // MELHORIA: Função auxiliar para calcular a contribuição na nova escala de 500 pontos.
    const calculateContribution = (score: number, weight: number): number => {
        // Fórmula: (score_fator / 100) * (peso_percentual / 100) * PONTUAÇÃO_MÁXIMA
        return (score / 100) * (weight / 100) * this.MAX_SCORE;
    }

    // 1. DESEMPENHO (baseado na avaliação real)
    const desempenhoScore = this.calculateDesempenhoScore(employee)
    breakdown.desempenho = desempenhoScore
    breakdown.detalhes.desempenho = {
      valor: desempenhoScore,
      peso: weights.desempenho,
      contribuicao: calculateContribution(desempenhoScore, weights.desempenho),
      justificativa: `Avaliação: ${employee.resultadoAvaliacaoDesempenho || 'N/A'}`
    }

    // 2. TEMPO NO CARGO (experiência na função atual)
    const tempoCargoScore = this.calculateTempoCargoScore(employee)
    breakdown.tempoCargo = tempoCargoScore
    breakdown.detalhes.tempoCargo = {
      valor: tempoCargoScore,
      peso: weights.tempoCargo,
      contribuicao: calculateContribution(tempoCargoScore, weights.tempoCargo),
      justificativa: `${employee.tempoNoCargo.toFixed(1)} anos no cargo atual`
    }

    // 3. TEMPO NA CASA (estabilidade na empresa)
    const tempoCasaScore = this.calculateTempoCasaScore(employee)
    breakdown.tempoCasa = tempoCasaScore
    breakdown.detalhes.tempoCasa = {
      valor: tempoCasaScore,
      peso: weights.tempoCasa,
      contribuicao: calculateContribution(tempoCasaScore, weights.tempoCasa),
      justificativa: `${employee.tempoDeCasa.toFixed(1)} anos na empresa`
    }

    // 4. RISCO DE PERDA (Lógica corrigida para valorizar alto risco)
    const riscoPerdaScore = this.calculateRiscoPerdaScore(employee)
    breakdown.riscoPerda = riscoPerdaScore
    breakdown.detalhes.riscoPerda = {
      valor: riscoPerdaScore,
      peso: weights.riscoPerda,
      contribuicao: calculateContribution(riscoPerdaScore, weights.riscoPerda),
      // MELHORIA: Justificativa atualizada para refletir a nova lógica de retenção.
      justificativa: `Risco: ${employee.riscoPerdaTexto || 'N/A'} (Alto risco eleva o score para retenção)`
    }

    // 5. IMPACTO DA PERDA (alto impacto = maior valor)
    const impactoPerdaScore = this.calculateImpactoPerdaScore(employee)
    breakdown.impactoPerda = impactoPerdaScore
    breakdown.detalhes.impactoPerda = {
      valor: impactoPerdaScore,
      peso: weights.impactoPerda,
      contribuicao: calculateContribution(impactoPerdaScore, weights.impactoPerda),
      justificativa: `Impacto: ${employee.impactoPerdaTexto || 'N/A'}`
    }

    // 6. ABSENTEÍSMO (invertido - menor absenteísmo = maior score)
    const absenteismoScore = this.calculateAbsenteismoScore(employee)
    breakdown.absenteismo = absenteismoScore
    breakdown.detalhes.absenteismo = {
      valor: absenteismoScore,
      peso: weights.absenteismo,
      contribuicao: calculateContribution(absenteismoScore, weights.absenteismo),
      justificativa: `${(employee.absenteismo * 100).toFixed(2)}% de absenteísmo, ${employee.numeroAdvertencias} advertências`
    }

    // 7. POSIÇÃO SALARIAL (baseada na faixa salarial)
    const salarioScore = this.calculateSalarioScore(employee)
    breakdown.salario = salarioScore
    breakdown.detalhes.salario = {
      valor: salarioScore,
      peso: weights.salario,
      contribuicao: calculateContribution(salarioScore, weights.salario),
      justificativa: `${employee.faixaSalarial || 'N/A'} - ${employee.nivelSalarial || 'N/A'}`
    }

    // 8. FORMAÇÃO (escolaridade e certificações)
    const formacaoScore = this.calculateFormacaoScore(employee)
    breakdown.formacao = formacaoScore
    breakdown.detalhes.formacao = {
      valor: formacaoScore,
      peso: weights.formacao,
      contribuicao: calculateContribution(formacaoScore, weights.formacao),
      justificativa: `${employee.grauEscolaridade || 'N/A'}, Certificações: ${employee.certificacoesRelevantes || 'Nenhuma'}`
    }

    // 9. DIVERSIDADE (contribuição para D&I)
    const diversidadeScore = this.calculateDiversidadeScore(employee)
    breakdown.diversidade = diversidadeScore
    breakdown.detalhes.diversidade = {
      valor: diversidadeScore,
      peso: weights.diversidade,
      contribuicao: calculateContribution(diversidadeScore, weights.diversidade),
      justificativa: `Gênero: ${employee.genero}, Raça: ${employee.racaCor}, Orientação: ${employee.orientacaoSexual}`
    }

    // 10. EXPERIÊNCIA COMBINADA (tempo + estabilidade + conhecimento)
    const experienciaScore = this.calculateExperienciaScore(employee)
    breakdown.experiencia = experienciaScore
    breakdown.detalhes.experiencia = {
      valor: experienciaScore,
      peso: weights.experiencia,
      contribuicao: calculateContribution(experienciaScore, weights.experiencia),
      justificativa: `Experiência combinada: tempo + conhecimento + idiomas`
    }

    // CÁLCULO DO SCORE TOTAL (Esta lógica permanece a mesma, pois agora soma as contribuições maiores)
    breakdown.scoreTotal = Object.keys(breakdown.detalhes).reduce((total, key) => {
      return total + breakdown.detalhes[key].contribuicao
    }, 0)

    console.log('✅ Score calculado:', breakdown.scoreTotal.toFixed(1), 'para', employee.nome)
    
    return breakdown
  }

  /**
   * Calcula score de desempenho baseado na avaliação real
   */
  private static calculateDesempenhoScore(employee: Employee): number {
    const avaliacao = employee.resultadoAvaliacaoDesempenho?.toLowerCase() || ''
    
    if (avaliacao.includes('excepcional') || avaliacao.includes('excede')) {
      return 100 // Máximo para performance excepcional
    } else if (avaliacao.includes('muito bom') || avaliacao.includes('excelente')) {
      return 85
    } else if (avaliacao.includes('bom') || avaliacao.includes('atende')) {
      return 70
    } else if (avaliacao.includes('satisfatório') || avaliacao.includes('parcialmente')) {
      return 50
    } else if (avaliacao.includes('não atende') || avaliacao.includes('insatisfatório')) {
      return 20
    }
    
    return 60 // Valor padrão se não houver avaliação
  }

  /**
   * Calcula score baseado no tempo no cargo atual
   */
  private static calculateTempoCargoScore(employee: Employee): number {
    const tempo = employee.tempoNoCargo || 0
    
    if (tempo >= 5) return 100 // 5+ anos = experiência máxima
    if (tempo >= 3) return 85  // 3-5 anos = muito experiente
    if (tempo >= 2) return 70  // 2-3 anos = experiente
    if (tempo >= 1) return 55  // 1-2 anos = em desenvolvimento
    if (tempo >= 0.5) return 40 // 6 meses - 1 ano = iniciante
    
    return 25 // Menos de 6 meses
  }

  /**
   * Calcula score baseado no tempo total na empresa
   */
  private static calculateTempoCasaScore(employee: Employee): number {
    const tempo = employee.tempoDeCasa || 0
    
    if (tempo >= 10) return 100 // 10+ anos = máxima lealdade
    if (tempo >= 7) return 90   // 7-10 anos = muito leal
    if (tempo >= 5) return 80   // 5-7 anos = leal
    if (tempo >= 3) return 65   // 3-5 anos = estável
    if (tempo >= 1) return 50   // 1-3 anos = em adaptação
    
    return 30 // Menos de 1 ano
  }

  /**
   * MELHORIA: Lógica de Risco de Perda CORRIGIDA.
   * Agora, um risco maior resulta em um score maior para sinalizar a necessidade
   * de retenção, alinhando-se com a estratégia do produto.
   */
  private static calculateRiscoPerdaScore(employee: Employee): number {
    const risco = employee.riscoPerdaTexto?.toLowerCase() || ''
    
    if (risco.includes('alto')) {
      return 100 // Alto risco = score máximo para máxima atenção
    } else if (risco.includes('médio')) {
      return 50  // Risco médio = score moderado
    } else if (risco.includes('baixo')) {
      return 10  // Baixo risco = score baixo, não precisa de ação imediata
    }
    
    return 50 // Valor padrão
  }

  /**
   * Calcula score de impacto da perda
   */
  private static calculateImpactoPerdaScore(employee: Employee): number {
    const impacto = employee.impactoPerdaTexto?.toLowerCase() || ''
    
    if (impacto.includes('alto')) {
      return 100 // Alto impacto = colaborador muito valioso
    } else if (impacto.includes('médio')) {
      return 70  // Médio impacto = colaborador valioso
    } else if (impacto.includes('baixo')) {
      return 40  // Baixo impacto = menos crítico
    }
    
    return 60 // Valor padrão
  }

  /**
   * Calcula score de absenteísmo (invertido)
   */
  private static calculateAbsenteismoScore(employee: Employee): number {
    const absenteismo = employee.absenteismo || 0
    const advertencias = employee.numeroAdvertencias || 0
    const faltas = employee.faltasInjustificadas || 0
    
    let score = 100
    
    // Penalizar por absenteísmo
    if (absenteismo > 0.1) score -= 40      // >10% = penalização severa
    else if (absenteismo > 0.05) score -= 25 // 5-10% = penalização média
    else if (absenteismo > 0.02) score -= 10 // 2-5% = penalização leve
    
    // Penalizar por advertências
    score -= advertencias * 15 // -15 pontos por advertência
    
    // Penalizar por faltas injustificadas
    score -= faltas * 5 // -5 pontos por falta
    
    // Bônus para absenteísmo anômalo detectado (mostra que o sistema está monitorando)
    if (employee.isAbsenteismoAnomalo) {
      score -= 20 // Penalização adicional por padrão anômalo
    }
    
    return Math.max(score, 0) // Não pode ser negativo
  }

  /**
   * Calcula score salarial baseado na posição na faixa
   */
  private static calculateSalarioScore(employee: Employee): number {
    const nivel = employee.nivelSalarial?.toLowerCase() || ''
    const faixa = employee.faixaSalarial?.toLowerCase() || ''
    
    let score = 50 // Base
    
    // Bônus por nível salarial
    if (nivel.includes('máximo')) score += 30
    else if (nivel.includes('médio')) score += 15
    else if (nivel.includes('mínimo')) score += 5
    
    // Bônus por faixa salarial (cargos mais altos)
    if (faixa.includes('sênior') || faixa.includes('gerente') || faixa.includes('diretor')) {
      score += 25
    } else if (faixa.includes('pleno') || faixa.includes('coordenador')) {
      score += 15
    } else if (faixa.includes('júnior') || faixa.includes('analista')) {
      score += 10
    }
    
    return Math.min(score, 100)
  }

  /**
   * Calcula score de formação
   */
  private static calculateFormacaoScore(employee: Employee): number {
    const escolaridade = employee.grauEscolaridade?.toLowerCase() || ''
    const certificacoes = employee.certificacoesRelevantes?.toLowerCase() || ''
    const cursos = employee.cursosConcluidos?.toLowerCase() || ''
    
    let score = 30 // Base
    
    // Pontuação por escolaridade
    if (escolaridade.includes('pós-graduação') || escolaridade.includes('mestrado') || escolaridade.includes('doutorado')) {
      score += 40
    } else if (escolaridade.includes('superior completo')) {
      score += 30
    } else if (escolaridade.includes('superior incompleto')) {
      score += 20
    } else if (escolaridade.includes('ensino médio')) {
      score += 10
    }
    
    // Bônus por certificações
    if (certificacoes && !certificacoes.includes('nenhuma')) {
      if (certificacoes.includes('pmp') || certificacoes.includes('scrum') || certificacoes.includes('aws')) {
        score += 20 // Certificações técnicas valiosas
      } else {
        score += 10 // Outras certificações
      }
    }
    
    // Bônus por cursos
    if (cursos && !cursos.includes('nenhum')) {
      score += 10
    }
    
    return Math.min(score, 100)
  }

  /**
   * Calcula score de diversidade
   */
  private static calculateDiversidadeScore(employee: Employee): number {
    let score = 50 // Base
    
    const genero = employee.genero?.toLowerCase() || ''
    const raca = employee.racaCor?.toLowerCase() || ''
    const orientacao = employee.orientacaoSexual?.toLowerCase() || ''
    
    // Bônus por diversidade de gênero
    if (genero.includes('feminino')) {
      score += 15 // Incentivo à diversidade de gênero
    } else if (genero.includes('outro')) {
      score += 20 // Maior incentivo para outras identidades
    }
    
    // Bônus por diversidade racial
    if (raca.includes('preta') || raca.includes('parda') || raca.includes('indígena') || raca.includes('amarela')) {
      score += 15 // Incentivo à diversidade racial
    }
    
    // Bônus por diversidade de orientação sexual
    if (!orientacao.includes('heterossexual')) {
      score += 10 // Incentivo à diversidade LGBTQIA+
    }
    
    // Bônus por idiomas (diversidade cultural)
    const idiomas = employee.idiomasFalados?.toLowerCase() || ''
    if (idiomas.includes('inglês') || idiomas.includes('espanhol') || idiomas.includes('francês')) {
      score += 10
    }
    
    return Math.min(score, 100)
  }

  /**
   * Calcula score de experiência combinada
   */
  private static calculateExperienciaScore(employee: Employee): number {
    const tempoCasa = employee.tempoDeCasa || 0
    const tempoCargo = employee.tempoNoCargo || 0
    const tempoUltimaPromocao = employee.tempoUltimaPromocao || 0
    
    let score = 0
    
    // Base por tempo na empresa (40% do score)
    score += Math.min((tempoCasa / 10) * 40, 40)
    
    // Experiência no cargo atual (30% do score)
    score += Math.min((tempoCargo / 5) * 30, 30)
    
    // Estabilidade (tempo desde última promoção - 20% do score)
    if (tempoUltimaPromocao <= 2) {
      score += 20 // Promoção recente = boa progressão
    } else if (tempoUltimaPromocao <= 4) {
      score += 15 // Promoção moderadamente recente
    } else {
      score += 5 // Muito tempo sem promoção
    }
    
    // Conhecimento técnico (10% do score)
    const cursos = employee.cursosConcluidos?.toLowerCase() || ''
    if (cursos.includes('avançado') || cursos.includes('liderança')) {
      score += 10
    } else if (cursos && !cursos.includes('nenhum')) {
      score += 5
    }
    
    return Math.min(score, 100)
  }

  /**
   * Atualiza o score de um colaborador
   */
  static updateEmployeeScore(employee: Employee, weights: WeightConfig): Employee {
    const breakdown = this.calculateEmployeeScore(employee, weights)
    
    // Atualizar os scores individuais
    employee.score = breakdown.scoreTotal
    employee.scoreExperiencia = breakdown.experiencia
    employee.scoreFormacao = breakdown.formacao
    employee.scoreDiversidade = breakdown.diversidade
    
    // Calcular score de sentimento baseado em fatores negativos
    employee.scoreSentimento = this.calculateSentimentScore(employee)
    
    // Identificar fatores de risco e pontos fortes
    employee.riskFactors = this.identifyRiskFactors(employee, breakdown)
    employee.strengths = this.identifyStrengths(employee, breakdown)
    
    console.log('📊 Score atualizado para', employee.nome, ':', employee.score.toFixed(1))
    
    return employee
  }

  /**
   * Calcula score de sentimento (0 = muito positivo, 1 = muito negativo)
   */
  private static calculateSentimentScore(employee: Employee): number {
    let negativeFactor = 0
    
    // Fatores que aumentam sentimento negativo
    if (employee.riscoPerdaTexto?.toLowerCase() === 'alto') negativeFactor += 0.3
    if (employee.numeroAdvertencias > 0) negativeFactor += 0.2
    if (employee.absenteismo > 0.05) negativeFactor += 0.2
    if (employee.tempoUltimaPromocao > 3) negativeFactor += 0.15
    if (employee.resultadoAvaliacaoDesempenho?.toLowerCase().includes('não atende')) negativeFactor += 0.25
    
    return Math.min(negativeFactor, 1.0)
  }

  /**
   * Identifica fatores de risco baseados nos dados
   */
  private static identifyRiskFactors(employee: Employee, breakdown: ScoreBreakdown): string[] {
    const factors: string[] = []
    
    // MELHORIA: A lógica de 'riscoPerda' mudou. Agora o score alto significa alto risco.
    if (breakdown.detalhes.riscoPerda.valor >= 100) {
      factors.push('Alto risco de saída identificado')
    }
    
    if (breakdown.detalhes.absenteismo.valor <= 40) {
      factors.push('Padrão de absenteísmo preocupante')
    }
    
    if (employee.numeroAdvertencias > 0) {
      factors.push(`${employee.numeroAdvertencias} advertência(s) no histórico`)
    }
    
    if (employee.tempoUltimaPromocao > 3) {
      factors.push('Muito tempo sem promoção ou reajuste')
    }
    
    if (breakdown.detalhes.desempenho.valor <= 50) {
      factors.push('Performance abaixo do esperado')
    }
    
    if (employee.scoreSentimento > 0.6) {
      factors.push('Indicadores de insatisfação detectados')
    }
    
    return factors
  }

  /**
   * Identifica pontos fortes baseados nos dados
   */
  private static identifyStrengths(employee: Employee, breakdown: ScoreBreakdown): string[] {
    const strengths: string[] = []
    
    if (breakdown.detalhes.desempenho.valor >= 85) {
      strengths.push('Performance excepcional consistente')
    }
    
    if (breakdown.detalhes.tempoCasa.valor >= 80) {
      strengths.push('Alta lealdade e estabilidade na empresa')
    }
    
    if (breakdown.detalhes.absenteismo.valor >= 90) {
      strengths.push('Excelente pontualidade e assiduidade')
    }
    
    if (breakdown.detalhes.formacao.valor >= 80) {
      strengths.push('Qualificação acadêmica e técnica superior')
    }
    
    if (breakdown.detalhes.diversidade.valor >= 70) {
      strengths.push('Contribuição significativa para diversidade organizacional')
    }
    
    if (breakdown.detalhes.experiencia.valor >= 80) {
      strengths.push('Vasta experiência e conhecimento técnico')
    }
    
    if (employee.idiomasFalados && employee.idiomasFalados.toLowerCase().includes('inglês')) {
      strengths.push('Competência em idiomas estrangeiros')
    }
    
    return strengths
  }

  /**
   * Recalcula todos os scores dos colaboradores
   */
  static recalculateAllScores(employees: Employee[], weights: WeightConfig): Employee[] {
    console.log('🔄 Recalculando scores de todos os colaboradores...')
    
    return employees.map(employee => {
      return this.updateEmployeeScore(employee, weights)
    })
  }

  /**
   * Gera relatório detalhado de score para um colaborador
   */
  static generateScoreReport(employee: Employee, weights: WeightConfig): string {
    const breakdown = this.calculateEmployeeScore(employee, weights)
    
    let report = `# Relatório de Score - ${employee.nome}\n\n`
    // MELHORIA: Atualiza o texto do score máximo para o valor da constante.
    report += `**Score Total: ${breakdown.scoreTotal.toFixed(1)} / ${this.MAX_SCORE}**\n\n`
    report += `## Breakdown Detalhado:\n\n`
    
    Object.entries(breakdown.detalhes).forEach(([key, detail]) => {
      // MELHORIA: A porcentagem agora reflete a contribuição para o score máximo.
      const percentageOfMax = ((detail.contribuicao / this.MAX_SCORE) * 100).toFixed(1)
      report += `### ${key.charAt(0).toUpperCase() + key.slice(1)}\n`
      report += `- **Valor Bruto:** ${detail.valor.toFixed(1)}/100\n`
      report += `- **Peso:** ${detail.peso}%\n`
      report += `- **Contribuição para o Score:** ${detail.contribuicao.toFixed(1)} pontos (${percentageOfMax}% do total)\n`
      report += `- **Justificativa:** ${detail.justificativa}\n\n`
    })
    
    if (employee.riskFactors && employee.riskFactors.length > 0) {
      report += `## Fatores de Risco:\n`
      employee.riskFactors.forEach(factor => {
        report += `- ${factor}\n`
      })
      report += `\n`
    }
    
    if (employee.strengths && employee.strengths.length > 0) {
      report += `## Pontos Fortes:\n`
      employee.strengths.forEach(strength => {
        report += `- ${strength}\n`
      })
    }
    
    return report
  }
}