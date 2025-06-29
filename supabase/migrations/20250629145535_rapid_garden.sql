/*
  # Criação do esquema completo de colaboradores

  1. Novas Tabelas
    - `employees` - Dados principais dos colaboradores
    - `employee_evaluations` - Histórico de avaliações
    - `employee_alerts` - Sistema de alertas
    - `weight_configurations` - Configurações de pesos para cálculo
    - `analysis_history` - Histórico de análises geradas

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para acesso autenticado

  3. Índices
    - Otimização para consultas frequentes
*/

-- Tabela principal de colaboradores
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  matricula text UNIQUE NOT NULL,
  nome text NOT NULL,
  genero text,
  raca_cor text,
  orientacao_sexual text,
  empresa text,
  unidade_organizacional text,
  centro_custos text,
  gestor_imediato text,
  cargo_atual text,
  tabela_salarial text,
  faixa_salarial text,
  nivel_salarial text,
  salario decimal DEFAULT 0,
  data_admissao date DEFAULT CURRENT_DATE,
  data_ultima_promocao date,
  resultado_avaliacao_desempenho text,
  data_ultima_avaliacao date,
  numero_advertencias integer DEFAULT 0,
  faltas_injustificadas integer DEFAULT 0,
  dias_afastamento integer DEFAULT 0,
  probabilidade_risco_perda text,
  impacto_perda text,
  grau_escolaridade text,
  cursos_concluidos text,
  certificacoes_relevantes text,
  idiomas_falados text,
  atualizacao_recente_formacao date,
  tempo_cargo_atual_meses integer DEFAULT 0,
  
  -- Campos calculados
  tempo_de_casa decimal DEFAULT 0,
  tempo_no_cargo decimal DEFAULT 0,
  absenteismo decimal DEFAULT 0,
  score decimal DEFAULT 0,
  reajuste_sugerido decimal DEFAULT 0,
  feedback_ultima_avaliacao text,
  score_sentimento decimal DEFAULT 0.5,
  is_absenteismo_anomalo boolean DEFAULT false,
  score_experiencia decimal DEFAULT 0,
  score_diversidade decimal DEFAULT 0,
  score_formacao decimal DEFAULT 0,
  risk_factors text[] DEFAULT '{}',
  strengths text[] DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de avaliações históricas
CREATE TABLE IF NOT EXISTS employee_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  evaluation_date date NOT NULL,
  performance_rating text,
  feedback text,
  goals_achieved integer DEFAULT 0,
  goals_total integer DEFAULT 0,
  evaluator text,
  created_at timestamptz DEFAULT now()
);

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS employee_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_required boolean DEFAULT false,
  department text,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Tabela de configurações de pesos
CREATE TABLE IF NOT EXISTS weight_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_default boolean DEFAULT false,
  weights jsonb NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de histórico de análises
CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  analysis_type text NOT NULL,
  analysis_content text NOT NULL,
  weights_used jsonb,
  score_at_time decimal,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (permitir acesso para usuários autenticados)
CREATE POLICY "Allow authenticated users to read employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read evaluations"
  ON employee_evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert evaluations"
  ON employee_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read alerts"
  ON employee_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update alerts"
  ON employee_alerts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert alerts"
  ON employee_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read weight configs"
  ON weight_configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage weight configs"
  ON weight_configurations FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read analysis history"
  ON analysis_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert analysis history"
  ON analysis_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_matricula ON employees(matricula);
CREATE INDEX IF NOT EXISTS idx_employees_cargo ON employees(cargo_atual);
CREATE INDEX IF NOT EXISTS idx_employees_departamento ON employees(unidade_organizacional);
CREATE INDEX IF NOT EXISTS idx_employees_risco ON employees(probabilidade_risco_perda);
CREATE INDEX IF NOT EXISTS idx_employees_score ON employees(score DESC);
CREATE INDEX IF NOT EXISTS idx_employee_alerts_type ON employee_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_employee_alerts_severity ON employee_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_employee_alerts_unread ON employee_alerts(is_read) WHERE is_read = false;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_configurations_updated_at 
  BEFORE UPDATE ON weight_configurations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir configuração padrão de pesos
INSERT INTO weight_configurations (name, is_default, weights) VALUES (
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
  }'::jsonb
) ON CONFLICT DO NOTHING;