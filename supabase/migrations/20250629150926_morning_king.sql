/*
  # População completa do banco de dados com colaboradores

  1. Configurações
    - Inserir configuração padrão de pesos
    - Criar funções auxiliares para cálculos

  2. Dados dos Colaboradores
    - 30 colaboradores do CSV original
    - Campos calculados automaticamente
    - Scores de experiência, diversidade e formação

  3. Alertas e Avaliações
    - Alertas automáticos baseados em padrões
    - Avaliações históricas
    - Análises de exemplo

  4. Limpeza
    - Remover funções auxiliares após uso
*/

-- Limpar dados existentes (se houver)
TRUNCATE TABLE analysis_history, employee_alerts, employee_evaluations, employees, weight_configurations CASCADE;

-- Inserir configuração padrão de pesos
INSERT INTO weight_configurations (name, is_default, weights, created_by) VALUES (
  'Configuração Padrão',
  true,
  '{
    "desempenho": 20,
    "tempoCargo": 10,
    "tempoCasa": 10,
    "riscoPerda": 15,
    "impactoPerda": 15,
    "absenteismo": 10,
    "salario": 5,
    "formacao": 5,
    "diversidade": 5,
    "experiencia": 5
  }'::jsonb,
  'Sistema'
);

-- Função auxiliar para calcular tempo de casa em anos
CREATE OR REPLACE FUNCTION calculate_tenure_years(admission_date date)
RETURNS decimal AS $$
BEGIN
  RETURN ROUND(
    EXTRACT(EPOCH FROM (CURRENT_DATE - admission_date)) / (365.25 * 24 * 60 * 60), 
    1
  );
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para calcular score de experiência
CREATE OR REPLACE FUNCTION calculate_experience_score(tempo_casa decimal, tempo_cargo decimal)
RETURNS decimal AS $$
BEGIN
  RETURN ROUND((LEAST(tempo_casa / 10, 1) * 0.7 + LEAST(tempo_cargo / 5, 1) * 0.3) * 100, 1);
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para calcular score de diversidade
CREATE OR REPLACE FUNCTION calculate_diversity_score(genero text, raca_cor text, orientacao_sexual text, escolaridade text, idiomas text)
RETURNS decimal AS $$
DECLARE
  score decimal := 0;
BEGIN
  IF genero != 'Masculino' THEN score := score + 20; END IF;
  IF raca_cor != 'Branca' THEN score := score + 20; END IF;
  IF orientacao_sexual != 'Heterosexual' THEN score := score + 20; END IF;
  IF escolaridade ILIKE '%Superior%' OR escolaridade ILIKE '%Pós%' THEN score := score + 20; END IF;
  IF idiomas IS NOT NULL AND idiomas != 'Português' THEN score := score + 20; END IF;
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para calcular score de formação
CREATE OR REPLACE FUNCTION calculate_education_score(escolaridade text, cursos text, certificacoes text)
RETURNS decimal AS $$
DECLARE
  score decimal := 0;
BEGIN
  CASE 
    WHEN escolaridade ILIKE '%Pós%' OR escolaridade ILIKE '%Mestrado%' OR escolaridade ILIKE '%Doutorado%' THEN score := score + 40;
    WHEN escolaridade ILIKE '%Superior Completo%' THEN score := score + 30;
    WHEN escolaridade ILIKE '%Superior%' THEN score := score + 20;
    WHEN escolaridade ILIKE '%Médio%' THEN score := score + 10;
    ELSE score := score + 5;
  END CASE;
  
  IF cursos IS NOT NULL AND cursos != 'Nenhuma' AND cursos != '' THEN score := score + 20; END IF;
  IF certificacoes IS NOT NULL AND certificacoes != 'Nenhuma' AND certificacoes != '' THEN score := score + 30; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para análise de sentimento simulada
CREATE OR REPLACE FUNCTION simulate_sentiment_score(feedback text)
RETURNS decimal AS $$
DECLARE
  negative_words text[] := ARRAY['desmotivado', 'frustração', 'reclama', 'dificuldades', 'conflitos', 'problema', 'insatisfeito', 'precisa', 'melhorar'];
  positive_words text[] := ARRAY['excelente', 'satisfeita', 'confiável', 'dedicada', 'proativa', 'criativo', 'leal', 'referência', 'potencial'];
  word text;
  negative_score decimal := 0;
  positive_score decimal := 0;
BEGIN
  IF feedback IS NULL OR feedback = '' THEN RETURN 0.5; END IF;
  
  -- Contar palavras negativas
  FOREACH word IN ARRAY negative_words LOOP
    IF LOWER(feedback) LIKE '%' || word || '%' THEN
      negative_score := negative_score + 0.15;
    END IF;
  END LOOP;
  
  -- Contar palavras positivas
  FOREACH word IN ARRAY positive_words LOOP
    IF LOWER(feedback) LIKE '%' || word || '%' THEN
      positive_score := positive_score + 0.15;
    END IF;
  END LOOP;
  
  RETURN LEAST(GREATEST(negative_score - positive_score, 0), 1);
END;
$$ LANGUAGE plpgsql;

-- Inserir todos os colaboradores do CSV
INSERT INTO employees (
  employee_id, matricula, nome, genero, raca_cor, orientacao_sexual,
  empresa, unidade_organizacional, centro_custos, gestor_imediato,
  cargo_atual, tabela_salarial, faixa_salarial, nivel_salarial,
  salario, data_admissao, data_ultima_promocao,
  resultado_avaliacao_desempenho, data_ultima_avaliacao,
  numero_advertencias, faltas_injustificadas, dias_afastamento,
  probabilidade_risco_perda, impacto_perda, grau_escolaridade,
  cursos_concluidos, certificacoes_relevantes, idiomas_falados,
  atualizacao_recente_formacao, tempo_cargo_atual_meses
) VALUES 
-- Colaboradores do Comercial
('4894', '328632', 'Carlos Souza', 'Masculino', 'Amarela', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 6295.72, '2017-01-20', '2025-06-03', 'Excede', '2023-12-25', 0, 0, 4, 'Baixo', 'Médio', 'Ensino Médio', 'Inglês Intermediário', 'Nenhuma', 'Inglês', '2024-03-01', 5),
('1461', '276751', 'Fernanda Lima', 'Feminino', 'Amarela', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Máximo', 3682.06, '2019-05-15', '2025-04-03', 'Excede', '2024-03-03', 1, 4, 11, 'Médio', 'Médio', 'Superior Completo', 'Liderança', 'PMP', 'Espanhol', '2025-03-20', 15),
('1104', '944981', 'Larissa Souza', 'Masculino', 'Parda', 'Homosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Sênior', 'Tabela A', 'Faixa Sênior', 'Mínimo', 9287.57, '2017-11-02', '2024-12-10', 'Parcialmente Atende', '2025-01-01', 2, 2, 9, 'Alto', 'Alto', 'Superior Completo', 'Inglês Intermediário', 'Nenhuma', 'Espanhol', '2025-05-05', 54),
('4722', '332372', 'Pedro Almeida', 'Outro', 'Amarela', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 6311.11, '2022-04-16', '2020-11-13', 'Parcialmente Atende', '2025-12-28', 2, 4, 13, 'Médio', 'Médio', 'Pós-graduação', 'Liderança', 'Nenhuma', 'Inglês', '2024-01-07', 34),
('3024', '799814', 'Pedro Costa', 'Outro', 'Branca', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 6315.48, '2020-02-02', '2023-01-10', 'Não Atende', '2025-01-11', 0, 1, 7, 'Médio', 'Médio', 'Pós-graduação', 'Excel Avançado', 'Scrum Master', 'Espanhol', '2023-08-03', 39),
('2370', '897597', 'Ana Rocha', 'Feminino', 'Amarela', 'Bissexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Médio', 4269.06, '2020-12-03', '2020-06-03', 'Parcialmente Atende', '2023-07-03', 2, 0, 6, 'Médio', 'Baixo', 'Superior Completo', 'Inglês Intermediário', 'Nenhuma', 'Espanhol', '2025-11-19', 41),
('6096', '746565', 'Carlos Martins', 'Feminino', 'Branca', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Mínimo', 4754.74, '2016-02-05', '2023-05-16', 'Excede', '2023-10-20', 0, 3, 5, 'Baixo', 'Médio', 'Ensino Médio', 'Liderança', 'Scrum Master', 'Português', '2023-02-04', 45),
('4707', '499912', 'Carlos Lima', 'Feminino', 'Amarela', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Médio', 3756.98, '2017-08-24', '2021-02-07', 'Parcialmente Atende', '2025-09-01', 1, 1, 3, 'Alto', 'Médio', 'Pós-graduação', 'Inglês Intermediário', 'PMP', 'Espanhol', '2025-05-09', 17),
('6236', '876344', 'Carlos Oliveira', 'Outro', 'Preta', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Sênior', 'Tabela A', 'Faixa Sênior', 'Médio', 8500.0, '2021-12-28', '2025-03-20', 'Não Atende', '2024-05-18', 1, 5, 6, 'Médio', 'Alto', 'Pós-graduação', 'Excel Avançado', 'Nenhuma', 'Espanhol', '2023-02-23', 2),
('9135', '241605', 'Mariana Almeida', 'Masculino', 'Preta', 'Homosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Máximo', 5661.27, '2017-12-11', '2025-03-04', 'Parcialmente Atende', '2023-01-22', 0, 1, 1, 'Baixo', 'Baixo', 'Pós-graduação', 'Excel Avançado', 'Scrum Master', 'Inglês', '2025-01-04', 52),
('7178', '719022', 'Mariana Martins', 'Feminino', 'Branca', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Médio', 3701.18, '2023-02-01', '2025-05-03', 'Parcialmente Atende', '2024-07-09', 1, 5, 7, 'Médio', 'Baixo', 'Ensino Médio', 'Excel Avançado', 'Nenhuma', 'Espanhol', '2025-08-02', 24),
('7596', '378374', 'Lucas Lima', 'Outro', 'Amarela', 'Heterosexual', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 5500.0, '2017-12-13', '2020-08-22', 'Excede', '2025-03-10', 3, 4, 1, 'Baixo', 'Médio', 'Ensino Médio', 'Liderança', 'PMP', 'Inglês', '2023-04-10', 43),
('6366', '905521', 'Ana Silva', 'Masculino', 'Parda', 'Outros', 'Empresa X', 'Comercial', 'CC101', 'João Silva', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Mínimo', 4843.74, '2018-01-22', '2023-06-08', 'Parcialmente Atende', '2023-06-19', 0, 0, 5, 'Baixo', 'Baixo', 'Superior Completo', 'Inglês Intermediário', 'Nenhuma', 'Português', '2022-07-01', 37),

-- Colaboradores do Administrativo
('8225', '289813', 'Beatriz Ferreira', 'Feminino', 'Indígena', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Médio', 4036.89, '2023-08-20', '2021-01-21', 'Parcialmente Atende', '2025-05-08', 1, 2, 18, 'Médio', 'Médio', 'Pós-graduação', 'Excel Avançado', 'Nenhuma', 'Inglês', '2023-03-09', 28),
('6310', '786183', 'Ana Oliveira', 'Masculino', 'Branca', 'Bissexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Sênior', 'Tabela A', 'Faixa Sênior', 'Médio', 10095.55, '2022-08-14', '2022-08-15', 'Parcialmente Atende', '2024-10-03', 0, 4, 7, 'Baixo', 'Alto', 'Pós-graduação', 'Inglês Intermediário', 'Scrum Master', 'Espanhol', '2023-09-23', 46),
('2900', '825742', 'João Almeida', 'Outro', 'Parda', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 6504.29, '2020-09-19', '2022-09-22', 'Atende', '2024-11-20', 0, 0, 7, 'Médio', 'Médio', 'Pós-graduação', 'Inglês Intermediário', 'Scrum Master', 'Espanhol', '2022-07-26', 42),
('6665', '138703', 'Daniel Silva', 'Masculino', 'Parda', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Máximo', 5808.95, '2023-10-11', '2022-11-03', 'Parcialmente Atende', '2023-02-09', 3, 5, 12, 'Alto', 'Médio', 'Superior Completo', 'Liderança', 'Nenhuma', 'Inglês', '2025-01-20', 28),
('4549', '808342', 'Larissa Ferreira', 'Outro', 'Parda', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Mínimo', 3936.18, '2018-04-16', '2021-03-07', 'Não Atende', '2024-06-03', 3, 5, 14, 'Médio', 'Médio', 'Superior Completo', 'Liderança', 'Nenhuma', 'Espanhol', '2022-10-21', 32),
('4868', '174547', 'Beatriz Oliveira', 'Outro', 'Branca', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Sênior', 'Tabela A', 'Faixa Sênior', 'Médio', 8626.58, '2020-08-16', '2024-12-01', 'Atende', '2024-07-09', 0, 0, 17, 'Médio', 'Alto', 'Pós-graduação', 'Excel Avançado', 'Nenhuma', 'Português', '2024-10-09', 43),
('8266', '238680', 'Daniel Silva', 'Feminino', 'Indígena', 'Bissexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 5500.0, '2017-09-15', '2024-04-02', 'Não Atende', '2024-06-26', 2, 0, 8, 'Alto', 'Baixo', 'Superior Completo', 'Excel Avançado', 'PMP', 'Inglês', '2023-03-21', 41),
('6380', '590009', 'Pedro Santos', 'Feminino', 'Parda', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Máximo', 3580.21, '2018-04-10', '2021-01-15', 'Excede', '2025-12-27', 2, 1, 20, 'Baixo', 'Médio', 'Ensino Médio', 'Excel Avançado', 'PMP', 'Português', '2024-12-16', 9),
('5944', '223446', 'Daniel Martins', 'Feminino', 'Parda', 'Homosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 6952.82, '2019-06-08', '2025-06-17', 'Excede', '2023-09-21', 2, 0, 16, 'Médio', 'Baixo', 'Ensino Médio', 'Inglês Intermediário', 'Scrum Master', 'Inglês', '2025-01-25', 59),
('3866', '333821', 'Daniel Santos', 'Masculino', 'Parda', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Sênior', 'Tabela A', 'Faixa Sênior', 'Mínimo', 7741.29, '2017-12-01', '2020-02-07', 'Parcialmente Atende', '2023-09-25', 1, 2, 9, 'Baixo', 'Alto', 'Ensino Médio', 'Inglês Intermediário', 'Nenhuma', 'Inglês', '2024-05-18', 20),
('6079', '117389', 'Carlos Silva', 'Outro', 'Preta', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 5500.0, '2017-04-21', '2022-04-08', 'Excede', '2024-07-21', 0, 3, 6, 'Médio', 'Baixo', 'Pós-graduação', 'Excel Avançado', 'Scrum Master', 'Inglês', '2024-08-06', 33),
('2523', '671458', 'Carlos Santos', 'Outro', 'Indígena', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Médio', 3577.73, '2023-09-13', '2022-02-08', 'Não Atende', '2024-07-26', 3, 3, 1, 'Baixo', 'Médio', 'Ensino Médio', 'Excel Avançado', 'Scrum Master', 'Português', '2023-02-13', 44),
('6616', '136846', 'Carlos Santos', 'Outro', 'Preta', 'Bissexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Máximo', 5426.25, '2019-10-07', '2024-05-25', 'Excede', '2025-11-04', 1, 4, 2, 'Baixo', 'Baixo', 'Pós-graduação', 'Inglês Intermediário', 'Nenhuma', 'Espanhol', '2025-09-05', 30),
('9105', '654374', 'Pedro Almeida', 'Outro', 'Preta', 'Outros', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Júnior', 'Tabela A', 'Faixa Júnior', 'Médio', 3510.05, '2020-09-17', '2021-08-02', 'Atende', '2024-12-01', 1, 0, 6, 'Alto', 'Baixo', 'Pós-graduação', 'Liderança', 'Nenhuma', 'Espanhol', '2025-11-07', 46),
('7846', '308021', 'Beatriz Martins', 'Feminino', 'Parda', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Médio', 4832.08, '2016-12-23', '2020-01-14', 'Excede', '2023-04-13', 2, 4, 8, 'Médio', 'Baixo', 'Ensino Médio', 'Inglês Intermediário', 'Nenhuma', 'Inglês', '2024-10-28', 30),
('5607', '642600', 'Carlos Santos', 'Masculino', 'Amarela', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Sênior', 'Tabela A', 'Faixa Sênior', 'Mínimo', 10605.91, '2020-07-09', '2022-09-13', 'Excede', '2025-01-13', 0, 1, 20, 'Alto', 'Alto', 'Ensino Médio', 'Liderança', 'Scrum Master', 'Português', '2025-01-21', 52),
('2201', '464786', 'João Oliveira', 'Outro', 'Indígena', 'Heterosexual', 'Empresa X', 'Administrativo', 'CC105', 'Larissa Oliveira', 'Pleno', 'Tabela A', 'Faixa Pleno', 'Máximo', 5308.02, '2022-10-04', '2024-06-03', 'Excede', '2024-01-21', 3, 5, 11, 'Alto', 'Médio', 'Superior Completo', 'Excel Avançado', 'PMP', 'Inglês', '2024-06-13', 57);

-- Atualizar campos calculados para todos os colaboradores
UPDATE employees SET
  tempo_de_casa = calculate_tenure_years(data_admissao),
  tempo_no_cargo = ROUND(tempo_cargo_atual_meses::decimal / 12, 1),
  absenteismo = ROUND(faltas_injustificadas::decimal / 100, 3),
  score_experiencia = calculate_experience_score(calculate_tenure_years(data_admissao), ROUND(tempo_cargo_atual_meses::decimal / 12, 1)),
  score_diversidade = calculate_diversity_score(genero, raca_cor, orientacao_sexual, grau_escolaridade, idiomas_falados),
  score_formacao = calculate_education_score(grau_escolaridade, cursos_concluidos, certificacoes_relevantes);

-- Gerar feedback simulado e score de sentimento
UPDATE employees SET
  feedback_ultima_avaliacao = CASE 
    WHEN resultado_avaliacao_desempenho = 'Excede' THEN nome || ' demonstra desempenho excepcional e é uma referência para a equipe. Suas contribuições são fundamentais para o sucesso dos projetos.'
    WHEN resultado_avaliacao_desempenho = 'Atende' THEN nome || ' apresenta desempenho sólido e consistente. É um colaborador confiável que cumpre suas responsabilidades.'
    WHEN resultado_avaliacao_desempenho = 'Parcialmente Atende' THEN nome || ' tem potencial, mas precisa de desenvolvimento em algumas áreas. Com suporte adequado pode melhorar significativamente.'
    ELSE nome || ' necessita de atenção e suporte para melhorar o desempenho. Requer acompanhamento mais próximo.'
  END;

UPDATE employees SET
  score_sentimento = simulate_sentiment_score(feedback_ultima_avaliacao),
  is_absenteismo_anomalo = (absenteismo > 0.05);

-- Calcular scores finais usando uma fórmula baseada nos pesos padrão
UPDATE employees SET
  score = ROUND(
    (
      -- Desempenho (20%)
      (CASE 
        WHEN resultado_avaliacao_desempenho = 'Excede' THEN 1.0
        WHEN resultado_avaliacao_desempenho = 'Atende' THEN 0.7
        WHEN resultado_avaliacao_desempenho = 'Parcialmente Atende' THEN 0.5
        ELSE 0.3
      END * 0.20) +
      
      -- Tempo no cargo (10%)
      (LEAST(tempo_no_cargo / 5, 1) * 0.10) +
      
      -- Tempo de casa (10%)
      (LEAST(tempo_de_casa / 10, 1) * 0.10) +
      
      -- Risco de perda (15%)
      (CASE 
        WHEN probabilidade_risco_perda = 'Alto' THEN 1.0
        WHEN probabilidade_risco_perda = 'Médio' THEN 0.5
        ELSE 0.1
      END * 0.15) +
      
      -- Impacto da perda (15%)
      (CASE 
        WHEN impacto_perda IN ('Estratégico', 'Alto', 'Crítico') THEN 1.0
        WHEN impacto_perda = 'Médio' THEN 0.5
        ELSE 0.1
      END * 0.15) +
      
      -- Absenteísmo (10%)
      ((1 - absenteismo) * 0.10) +
      
      -- Outros fatores (20%)
      ((score_experiencia + score_formacao + score_diversidade) / 300 * 0.20)
    ) * 
    -- Aplicar penalidades
    (1 - LEAST(numero_advertencias * 0.05, 0.20)) * 500
  , 1);

-- Gerar fatores de risco e pontos fortes
UPDATE employees SET
  risk_factors = ARRAY(
    SELECT unnest(ARRAY[
      CASE WHEN probabilidade_risco_perda = 'Alto' THEN 'Alto risco de perda identificado' ELSE NULL END,
      CASE WHEN numero_advertencias > 0 THEN numero_advertencias || ' advertência(s) nos últimos 12 meses' ELSE NULL END,
      CASE WHEN faltas_injustificadas > 5 THEN 'Alto índice de faltas injustificadas' ELSE NULL END,
      CASE WHEN dias_afastamento > 30 THEN 'Muitos dias de afastamento' ELSE NULL END,
      CASE WHEN calculate_tenure_years(data_ultima_promocao) > 3 THEN 'Sem promoção há mais de 3 anos' ELSE NULL END,
      CASE WHEN resultado_avaliacao_desempenho IN ('Não Atende', 'Parcialmente Atende') THEN 'Desempenho abaixo do esperado' ELSE NULL END
    ]) WHERE unnest IS NOT NULL
  ),
  strengths = ARRAY(
    SELECT unnest(ARRAY[
      CASE WHEN resultado_avaliacao_desempenho = 'Excede' THEN 'Desempenho excepcional' ELSE NULL END,
      CASE WHEN tempo_de_casa > 5 THEN 'Alta lealdade à empresa' ELSE NULL END,
      CASE WHEN numero_advertencias = 0 THEN 'Histórico disciplinar limpo' ELSE NULL END,
      CASE WHEN grau_escolaridade ILIKE '%Pós%' OR grau_escolaridade ILIKE '%Superior%' THEN 'Alta qualificação acadêmica' ELSE NULL END,
      CASE WHEN certificacoes_relevantes IS NOT NULL AND certificacoes_relevantes != 'Nenhuma' THEN 'Certificações profissionais relevantes' ELSE NULL END,
      CASE WHEN faltas_injustificadas = 0 THEN 'Excelente assiduidade' ELSE NULL END
    ]) WHERE unnest IS NOT NULL
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
    WHEN e.resultado_avaliacao_desempenho = 'Atende' THEN 4
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
WHERE e.is_absenteismo_anomalo = true;

-- Alertas de sentimento negativo
INSERT INTO employee_alerts (employee_id, alert_type, severity, title, message, action_required, department)
SELECT 
  e.id,
  'sentiment',
  'medium',
  'Sentimento Negativo Detectado',
  'Análise de sentimento indica possível insatisfação em ' || e.nome,
  true,
  e.unidade_organizacional
FROM employees e
WHERE e.score_sentimento > 0.6;

-- Alertas departamentais
INSERT INTO employee_alerts (alert_type, severity, title, message, action_required, department)
SELECT 
  'retention',
  CASE 
    WHEN (COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::numeric / COUNT(*)::numeric) > 0.5 THEN 'critical'
    WHEN (COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::numeric / COUNT(*)::numeric) > 0.3 THEN 'high'
    ELSE 'medium'
  END,
  'Alto Risco Departamental',
  unidade_organizacional || ': ' || 
  TRUNC((COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::numeric / COUNT(*)::numeric) * 100, 1)::text || 
  '% dos colaboradores em alto risco',
  true,
  unidade_organizacional
FROM employees
GROUP BY unidade_organizacional
HAVING (COUNT(*) FILTER (WHERE probabilidade_risco_perda = 'Alto')::numeric / COUNT(*)::numeric) > 0.2;

-- Inserir algumas análises de exemplo no histórico
INSERT INTO analysis_history (employee_id, analysis_type, analysis_content, weights_used, score_at_time)
SELECT 
  e.id,
  'recognition',
  '<p><strong>Parágrafo de Reconhecimento:</strong> ' || e.nome || ' é um colaborador valioso que contribui significativamente para o sucesso da equipe.</p>
   <p><strong>Justificativa Técnica:</strong> Com score de ' || e.score::text || ', demonstra competência e dedicação em suas funções.</p>
   <p><strong>Mensagem de Incentivo:</strong> Continue o excelente trabalho! Seu futuro na empresa é promissor e há oportunidades de crescimento.</p>',
  '{
    "desempenho": 20,
    "tempoCargo": 10,
    "tempoCasa": 10,
    "riscoPerda": 15,
    "impactoPerda": 15,
    "absenteismo": 10,
    "salario": 5,
    "formacao": 5,
    "diversidade": 5,
    "experiencia": 5
  }'::jsonb,
  e.score
FROM employees e
WHERE e.score >= 350
LIMIT 5;

-- Limpar funções auxiliares
DROP FUNCTION IF EXISTS calculate_tenure_years(date);
DROP FUNCTION IF EXISTS calculate_experience_score(decimal, decimal);
DROP FUNCTION IF EXISTS calculate_diversity_score(text, text, text, text, text);
DROP FUNCTION IF EXISTS calculate_education_score(text, text, text);
DROP FUNCTION IF EXISTS simulate_sentiment_score(text);