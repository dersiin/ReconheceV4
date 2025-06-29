/*
  # Create analysis history table

  1. New Tables
    - `analysis_history`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `analysis_type` (text)
      - `analysis_content` (text)
      - `weights_used` (jsonb)
      - `score_at_time` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `analysis_history` table
    - Add policy for public access
*/

CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  analysis_type text NOT NULL,
  analysis_content text NOT NULL,
  weights_used jsonb NOT NULL,
  score_at_time numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to analysis history"
  ON analysis_history
  FOR ALL
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analysis_employee_id ON analysis_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_type ON analysis_history(analysis_type);