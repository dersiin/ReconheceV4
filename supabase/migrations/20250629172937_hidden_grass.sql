/*
  # Create weight configurations table

  1. New Tables
    - `weight_configurations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `weights` (jsonb)
      - `is_default` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `weight_configurations` table
    - Add policy for public access

  3. Default Data
    - Insert default weight configuration
*/

CREATE TABLE IF NOT EXISTS weight_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  weights jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE weight_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to weight configurations"
  ON weight_configurations
  FOR ALL
  TO public
  USING (true);

-- Insert default weight configuration
INSERT INTO weight_configurations (name, weights, is_default) VALUES (
  'Default Configuration',
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
  true
) ON CONFLICT DO NOTHING;