/*
  # Create employees table and related schema

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `employee_id` (text, unique identifier)
      - `matricula` (text)
      - `nome` (text)
      - `genero` (text)
      - `raca_cor` (text)
      - `orientacao_sexual` (text)
      - `empresa` (text)
      - `unidade_organizacional` (text)
      - `centro_custos` (text)
      - `gestor_imediato` (text)
      - `cargo_atual` (text)
      - `tabela_salarial` (text)
      - `faixa_salarial` (text)
      - `nivel_salarial` (text)
      - `salario` (numeric)
      - `data_admissao` (date)
      - `data_ultima_promocao` (date)
      - `resultado_avaliacao_desempenho` (text)
      - `data_ultima_avaliacao` (date)
      - `numero_advertencias` (integer)
      - `faltas_injustificadas` (integer)
      - `dias_afastamento` (integer)
      - `probabilidade_risco_perda` (text)
      - `impacto_perda` (text)
      - `grau_escolaridade` (text)
      - `cursos_concluidos` (text)
      - `certificacoes_relevantes` (text)
      - `idiomas_falados` (text)
      - `atualizacao_recente_formacao` (date)
      - `tempo_cargo_atual_meses` (integer)
      - `tempo_de_casa` (numeric)
      - `tempo_no_cargo` (numeric)
      - `absenteismo` (numeric)
      - `score` (numeric)
      - `reajuste_sugerido` (numeric)
      - `feedback_ultima_avaliacao` (text)
      - `score_sentimento` (numeric)
      - `is_absenteismo_anomalo` (boolean)
      - `score_experiencia` (numeric)
      - `score_diversidade` (numeric)
      - `score_formacao` (numeric)
      - `risk_factors` (jsonb)
      - `strengths` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `employees` table
    - Add policy for public read access (since no authentication is implemented)
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  matricula text,
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
  salario numeric DEFAULT 0,
  data_admissao date,
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
  tempo_de_casa numeric DEFAULT 0,
  tempo_no_cargo numeric DEFAULT 0,
  absenteismo numeric DEFAULT 0,
  score numeric DEFAULT 0,
  reajuste_sugerido numeric DEFAULT 0,
  feedback_ultima_avaliacao text,
  score_sentimento numeric DEFAULT 0.5,
  is_absenteismo_anomalo boolean DEFAULT false,
  score_experiencia numeric DEFAULT 0,
  score_diversidade numeric DEFAULT 0,
  score_formacao numeric DEFAULT 0,
  risk_factors jsonb DEFAULT '[]'::jsonb,
  strengths jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
CREATE POLICY "Allow public read access"
  ON employees
  FOR SELECT
  TO public
  USING (true);

-- Create policy for public write access (for demo purposes)
CREATE POLICY "Allow public write access"
  ON employees
  FOR ALL
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_nome ON employees(nome);
CREATE INDEX IF NOT EXISTS idx_employees_score ON employees(score DESC);
CREATE INDEX IF NOT EXISTS idx_employees_unidade ON employees(unidade_organizacional);
CREATE INDEX IF NOT EXISTS idx_employees_cargo ON employees(cargo_atual);