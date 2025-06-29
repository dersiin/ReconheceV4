/*
  # Insert sample employee data

  1. Sample Data
    - Insert sample employees with realistic data
    - Ensure data matches the expected format from the application

  2. Notes
    - This provides initial data for testing and demonstration
    - Data includes various risk levels and performance metrics
*/

INSERT INTO employees (
  employee_id, matricula, nome, genero, raca_cor, orientacao_sexual,
  empresa, unidade_organizacional, centro_custos, gestor_imediato,
  cargo_atual, tabela_salarial, faixa_salarial, nivel_salarial,
  salario, data_admissao, data_ultima_promocao, resultado_avaliacao_desempenho,
  data_ultima_avaliacao, numero_advertencias, faltas_injustificadas,
  dias_afastamento, probabilidade_risco_perda, impacto_perda,
  grau_escolaridade, cursos_concluidos, certificacoes_relevantes,
  idiomas_falados, atualizacao_recente_formacao, tempo_cargo_atual_meses,
  tempo_de_casa, tempo_no_cargo, absenteismo, score, reajuste_sugerido,
  feedback_ultima_avaliacao, score_sentimento, is_absenteismo_anomalo,
  score_experiencia, score_diversidade, score_formacao,
  risk_factors, strengths
) VALUES 
(
  '1001', 'MAT001', 'Ana Silva Santos', 'Feminino', 'Branca', 'Heterossexual',
  'TechCorp', 'Tecnologia', 'TI-001', 'Carlos Mendes',
  'Desenvolvedora Senior', 'Tabela A', 'Faixa 5', 'Nível 3',
  12000.00, '2020-03-15', '2023-01-10', 'Excepcional',
  '2024-01-15', 0, 0, 0, 'Baixo', 'Alto',
  'Superior Completo', 'React, Node.js, AWS', 'AWS Solutions Architect',
  'Português, Inglês', '2024-01-01', 18,
  4.2, 1.5, 2.1, 85.5, 8.5,
  'Excelente performance, líder técnica natural', 0.8, false,
  85, 75, 90,
  '["Nenhum fator de risco identificado"]'::jsonb,
  '["Liderança técnica", "Conhecimento avançado", "Comunicação eficaz"]'::jsonb
),
(
  '1002', 'MAT002', 'João Pedro Oliveira', 'Masculino', 'Pardo', 'Heterossexual',
  'TechCorp', 'Vendas', 'VEN-001', 'Maria Costa',
  'Consultor de Vendas', 'Tabela B', 'Faixa 3', 'Nível 2',
  8500.00, '2019-08-20', '2022-06-15', 'Bom',
  '2024-01-15', 1, 3, 5, 'Médio', 'Médio',
  'Superior Completo', 'Técnicas de Vendas, CRM', 'Salesforce Certified',
  'Português, Espanhol', '2023-06-01', 24,
  5.1, 2.0, 5.2, 72.3, 12.0,
  'Bom desempenho, pode melhorar pontualidade', 0.6, true,
  70, 60, 75,
  '["Absenteísmo elevado", "Advertência por atraso"]'::jsonb,
  '["Relacionamento com clientes", "Conhecimento de produto"]'::jsonb
),
(
  '1003', 'MAT003', 'Mariana Ferreira', 'Feminino', 'Negra', 'Heterossexual',
  'TechCorp', 'Recursos Humanos', 'RH-001', 'Roberto Silva',
  'Analista de RH', 'Tabela A', 'Faixa 4', 'Nível 2',
  9500.00, '2021-02-10', '2023-08-01', 'Muito Bom',
  '2024-01-15', 0, 0, 0, 'Baixo', 'Médio',
  'Pós-graduação', 'Gestão de Pessoas, Direito Trabalhista', 'SHRM-CP',
  'Português, Inglês, Francês', '2023-12-01', 12,
  3.8, 1.0, 1.8, 78.9, 6.5,
  'Excelente relacionamento interpessoal', 0.75, false,
  78, 85, 82,
  '[]'::jsonb,
  '["Comunicação interpessoal", "Conhecimento jurídico", "Multilíngue"]'::jsonb
),
(
  '1004', 'MAT004', 'Carlos Eduardo Santos', 'Masculino', 'Branco', 'Heterossexual',
  'TechCorp', 'Financeiro', 'FIN-001', 'Ana Rodrigues',
  'Contador Senior', 'Tabela A', 'Faixa 6', 'Nível 4',
  15000.00, '2018-05-12', '2021-11-20', 'Excepcional',
  '2024-01-15', 0, 1, 0, 'Alto', 'Alto',
  'Superior Completo', 'Contabilidade Avançada, Auditoria', 'CRC, CPA',
  'Português, Inglês', '2023-08-15', 36,
  6.7, 3.0, 3.5, 92.1, 5.0,
  'Profissional altamente qualificado, risco de saída', 0.9, false,
  95, 70, 88,
  '["Alto risco de saída por proposta externa", "Salário abaixo do mercado"]'::jsonb,
  '["Expertise técnica", "Liderança", "Visão estratégica"]'::jsonb
),
(
  '1005', 'MAT005', 'Fernanda Lima Costa', 'Feminino', 'Parda', 'Heterossexual',
  'TechCorp', 'Marketing', 'MKT-001', 'Pedro Alves',
  'Coordenadora de Marketing', 'Tabela B', 'Faixa 4', 'Nível 3',
  10500.00, '2020-09-01', '2023-03-15', 'Bom',
  '2024-01-15', 0, 2, 0, 'Médio', 'Médio',
  'Superior Completo', 'Marketing Digital, Google Ads', 'Google Analytics',
  'Português, Inglês', '2023-10-01', 15,
  4.3, 1.2, 4.1, 74.6, 8.0,
  'Criativa e proativa, pode desenvolver mais liderança', 0.65, false,
  72, 78, 76,
  '["Falta de experiência em liderança"]'::jsonb,
  '["Criatividade", "Conhecimento digital", "Proatividade"]'::jsonb
),
(
  '1006', 'MAT006', 'Ricardo Almeida', 'Masculino', 'Branco', 'Heterossexual',
  'TechCorp', 'Operações', 'OPS-001', 'Lucia Santos',
  'Supervisor de Operações', 'Tabela B', 'Faixa 5', 'Nível 3',
  11000.00, '2017-11-30', '2020-07-10', 'Satisfatório',
  '2024-01-15', 2, 5, 8, 'Alto', 'Baixo',
  'Ensino Médio', 'Gestão de Processos', 'Lean Six Sigma',
  'Português', '2022-05-01', 48,
  7.2, 4.0, 8.7, 58.3, 15.0,
  'Precisa melhorar gestão de equipe e reduzir faltas', 0.4, true,
  55, 50, 45,
  '["Alto absenteísmo", "Múltiplas advertências", "Baixo engajamento"]'::jsonb,
  '["Conhecimento operacional", "Experiência prática"]'::jsonb
),
(
  '1007', 'MAT007', 'Juliana Rocha', 'Feminino', 'Negra', 'Heterossexual',
  'TechCorp', 'Tecnologia', 'TI-002', 'Carlos Mendes',
  'Desenvolvedora Pleno', 'Tabela A', 'Faixa 3', 'Nível 2',
  9000.00, '2022-01-15', '2024-01-01', 'Muito Bom',
  '2024-01-15', 0, 0, 0, 'Baixo', 'Médio',
  'Superior Completo', 'Python, Django, PostgreSQL', 'Python Institute',
  'Português, Inglês', '2024-01-01', 6,
  2.8, 0.5, 1.2, 81.7, 10.0,
  'Talento promissor, rápido aprendizado', 0.85, false,
  82, 80, 85,
  '[]'::jsonb,
  '["Rápido aprendizado", "Código limpo", "Trabalho em equipe"]'::jsonb
),
(
  '1008', 'MAT008', 'Paulo Henrique Silva', 'Masculino', 'Pardo', 'Heterossexual',
  'TechCorp', 'Vendas', 'VEN-002', 'Maria Costa',
  'Gerente de Vendas', 'Tabela A', 'Faixa 7', 'Nível 4',
  18000.00, '2016-03-20', '2019-12-01', 'Excepcional',
  '2024-01-15', 0, 0, 0, 'Médio', 'Alto',
  'MBA', 'Gestão Comercial, Liderança', 'Sales Management',
  'Português, Inglês, Espanhol', '2023-09-01', 60,
  8.8, 5.0, 2.3, 89.4, 3.0,
  'Líder excepcional, mentor natural da equipe', 0.9, false,
  90, 75, 92,
  '["Possível estagnação na carreira"]'::jsonb,
  '["Liderança natural", "Visão comercial", "Mentoria"]'::jsonb
),
(
  '1009', 'MAT009', 'Camila Barbosa', 'Feminino', 'Branca', 'Heterossexual',
  'TechCorp', 'Recursos Humanos', 'RH-002', 'Roberto Silva',
  'Especialista em Recrutamento', 'Tabela B', 'Faixa 4', 'Nível 2',
  9800.00, '2021-07-05', '2023-12-01', 'Bom',
  '2024-01-15', 0, 1, 0, 'Baixo', 'Médio',
  'Superior Completo', 'Recrutamento e Seleção, LinkedIn', 'LinkedIn Recruiter',
  'Português, Inglês', '2023-11-01', 9,
  3.5, 0.8, 2.8, 76.2, 7.5,
  'Boa performance em recrutamento, pode expandir atuação', 0.7, false,
  75, 82, 78,
  '[]'::jsonb,
  '["Networking", "Avaliação de perfis", "Comunicação"]'::jsonb
),
(
  '1010', 'MAT010', 'André Luis Pereira', 'Masculino', 'Negro', 'Heterossexual',
  'TechCorp', 'Financeiro', 'FIN-002', 'Ana Rodrigues',
  'Analista Financeiro', 'Tabela B', 'Faixa 3', 'Nível 2',
  8000.00, '2023-04-10', '2023-04-10', 'Muito Bom',
  '2024-01-15', 0, 0, 0, 'Baixo', 'Baixo',
  'Superior Completo', 'Análise Financeira, Excel Avançado', 'CFA Level 1',
  'Português, Inglês', '2023-12-01', 3,
  0.8, 0.8, 0.5, 79.8, 12.0,
  'Novo talento com grande potencial', 0.8, false,
  80, 85, 82,
  '[]'::jsonb,
  '["Análise quantitativa", "Atenção aos detalhes", "Potencial de crescimento"]'::jsonb
) ON CONFLICT (employee_id) DO NOTHING;

-- Insert some sample alerts
INSERT INTO employee_alerts (
  employee_id, alert_type, severity, title, message, action_required, department
) VALUES 
(
  (SELECT id FROM employees WHERE employee_id = '1004'),
  'retention_risk', 'high', 'Alto Risco de Saída - Carlos Eduardo',
  'Colaborador com alto risco de saída devido a proposta externa. Recomenda-se ação imediata de retenção.',
  true, 'Financeiro'
),
(
  (SELECT id FROM employees WHERE employee_id = '1006'),
  'performance_issue', 'high', 'Problemas de Performance - Ricardo Almeida',
  'Alto absenteísmo e múltiplas advertências. Necessária intervenção da gestão.',
  true, 'Operações'
),
(
  (SELECT id FROM employees WHERE employee_id = '1002'),
  'attendance_issue', 'medium', 'Absenteísmo Elevado - João Pedro',
  'Padrão de absenteísmo acima da média. Recomenda-se acompanhamento.',
  false, 'Vendas'
) ON CONFLICT DO NOTHING;