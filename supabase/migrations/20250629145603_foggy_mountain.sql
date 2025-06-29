/*
  # Inserção de dados de exemplo

  1. Dados de Colaboradores
    - Inserir colaboradores de exemplo baseados no CSV original
    - Calcular campos derivados
    - Gerar alertas automáticos

  2. Dados de Avaliações
    - Histórico de avaliações para alguns colaboradores

  3. Alertas
    - Alertas baseados nos dados dos colaboradores
*/

-- Inserir colaboradores de exemplo
INSERT INTO employees (
  employee_id, matricula, nome, genero, raca_cor, orientacao_sexual,
  empresa, unidade_organizacional, centro_custos, gestor_imediato,
  cargo_atual, tabela_salarial, faixa_salarial, nivel_salarial,
  salario, data_admissao, data_ultima_promocao,
  resultado_avaliacao_desempenho, data_ultima_avaliacao,
  numero_advertencias, faltas_injustificadas, dias_afastamento,
  probabilidade_risco_perda, impacto_perda, grau_escolaridade,
  cursos_concluidos, certificacoes_relevantes, idiomas_falados,
  tempo_cargo_atual_meses, tempo_de_casa, tempo_no_cargo,
  absenteismo, score, feedback_ultima_avaliacao,
  score_sentimento, is_absenteismo_anomalo,
  score_experiencia, score_diversidade, score_formacao
) VALUES 
(
  '4894', '328632', 'Carlos Souza', 'Masculino', 'Amarela', 'Heterosexual',
  'Empresa X', 'Comercial', 'CC101', 'João Silva',
  'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio',
  6295.72, '2017-01-20', '2025-06-03',
  'Excede', '2023-12-25',
  0, 0, 4,
  'Baixo', 'Médio', 'Ensino Médio',
  'Inglês Intermediário', 'Nenhuma', 'Inglês',
  5, 8.0, 5.0,
  0.0, 385.2, 'Carlos demonstra excelente performance técnica e é uma referência para a equipe.',
  0.1, false,
  75.0, 40.0, 45.0
),
(
  '1461', '276751', 'Fernanda Lima', 'Feminino', 'Amarela', 'Heterosexual',
  'Empresa X', 'Comercial', 'CC101', 'João Silva',
  'Júnior', 'Tabela A', 'Faixa Júnior', 'Máximo',
  3682.06, '2019-05-15', '2025-04-03',
  'Excede', '2024-03-03',
  1, 4, 11,
  'Médio', 'Médio', 'Superior Completo',
  'Liderança', 'PMP', 'Espanhol',
  15, 5.5, 1.25,
  0.04, 342.8, 'Fernanda tem grande potencial de liderança e busca novos desafios.',
  0.3, false,
  45.0, 60.0, 70.0
),
(
  '1104', '944981', 'Larissa Souza', 'Masculino', 'Parda', 'Homosexual',
  'Empresa X', 'Comercial', 'CC101', 'João Silva',
  'Sênior', 'Tabela A', 'Faixa Sênior', 'Mínimo',
  9287.57, '2017-11-02', '2024-12-10',
  'Parcialmente Atende', '2025-01-01',
  2, 2, 9,
  'Alto', 'Alto', 'Superior Completo',
  'Inglês Intermediário', 'Nenhuma', 'Espanhol',
  54, 7.2, 4.5,
  0.02, 298.5, 'Larissa tem conhecimento técnico sólido mas precisa melhorar a comunicação com a equipe.',
  0.6, false,
  85.0, 80.0, 65.0
),
(
  '4722', '332372', 'Pedro Almeida', 'Outro', 'Amarela', 'Heterosexual',
  'Empresa X', 'Comercial', 'CC101', 'João Silva',
  'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio',
  6311.11, '2022-04-16', '2020-11-13',
  'Parcialmente Atende', '2025-12-28',
  2, 4, 13,
  'Médio', 'Médio', 'Pós-graduação',
  'Liderança', 'Nenhuma', 'Inglês',
  34, 2.7, 2.8,
  0.04, 315.7, 'Pedro demonstra competência técnica mas precisa desenvolver habilidades de gestão de tempo.',
  0.4, false,
  35.0, 60.0, 80.0
),
(
  '8225', '289813', 'Beatriz Ferreira', 'Feminino', 'Indígena', 'Heterosexual',
  'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira',
  'Júnior', 'Tabela A', 'Faixa Júnior', 'Médio',
  4036.89, '2023-08-20', '2021-01-21',
  'Parcialmente Atende', '2025-05-08',
  1, 2, 18,
  'Médio', 'Médio', 'Pós-graduação',
  'Excel Avançado', 'Nenhuma', 'Inglês',
  28, 1.3, 2.3,
  0.02, 295.4, 'Beatriz está se adaptando bem à empresa e mostra potencial de crescimento.',
  0.3, false,
  25.0, 80.0, 85.0
);

-- Inserir avaliações históricas
INSERT INTO employee_evaluations (employee_id, evaluation_date, performance_rating, feedback, goals_achieved, goals_total, evaluator)
SELECT 
  e.id,
  e.data_ultima_avaliacao,
  e.resultado_avaliacao_desempenho,
  e.feedback_ultima_avaliacao,
  CASE 
    WHEN e.resultado_avaliacao_desempenho = 'Excede' THEN 5
    WHEN e.resultado_avaliacao_desempenho = 'Acima do esperado' THEN 4
    WHEN e.resultado_avaliacao_desempenho = 'Bom' THEN 3
    WHEN e.resultado_avaliacao_desempenho = 'Parcialmente Atende' THEN 2
    ELSE 1
  END,
  5,
  e.gestor_imediato
FROM employees e;

-- Gerar alertas automáticos baseados nos dados
INSERT INTO employee_alerts (employee_id, alert_type, severity, title, message, action_required, department)
SELECT 
  e.id,
  'high_risk',
  'high',
  'Colaborador de Alto Risco',
  'Colaborador ' || e.nome || ' apresenta alto risco de saída. Score atual: ' || e.score::text,
  true,
  e.unidade_organizacional
FROM employees e
WHERE e.probabilidade_risco_perda = 'Alto';

INSERT INTO employee_alerts (employee_id, alert_type, severity, title, message, action_required, department)
SELECT 
  e.id,
  'performance',
  CASE 
    WHEN e.score < 250 THEN 'high'
    WHEN e.score < 300 THEN 'medium'
    ELSE 'low'
  END,
  'Performance Abaixo do Esperado',
  'Colaborador ' || e.nome || ' apresenta score baixo (' || e.score::text || '). Intervenção necessária.',
  true,
  e.unidade_organizacional
FROM employees e
WHERE e.score < 300;

INSERT INTO employee_alerts (employee_id, alert_type, severity, title, message, action_required, department)
SELECT 
  e.id,
  'anomaly',
  'medium',
  'Padrão de Absenteísmo Anômalo',
  'Detectado padrão irregular de faltas para ' || e.nome,
  true,
  e.unidade_organizacional
FROM employees e
WHERE e.absenteismo > 0.05;

-- Alertas departamentais
INSERT INTO employee_alerts (alert_type, severity, title, message, action_required, department)
SELECT 
  'retention',
  CASE 
    WHEN (COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::float / COUNT(*)::float) > 0.5 THEN 'critical'
    WHEN (COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::float / COUNT(*)::float) > 0.3 THEN 'high'
    ELSE 'medium'
  END,
  'Alto Risco Departamental',
  unidade_organizacional || ': ' || 
  ROUND((COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::float / COUNT(*)::float) * 100, 1)::text || 
  '% dos colaboradores em alto risco',
  true,
  unidade_organizacional
FROM employees
GROUP BY unidade_organizacional
HAVING (COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::float / COUNT(*)::float) > 0.3;