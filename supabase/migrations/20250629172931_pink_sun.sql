/*
  # Create employee alerts table

  1. New Tables
    - `employee_alerts`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `alert_type` (text)
      - `severity` (text)
      - `title` (text)
      - `message` (text)
      - `action_required` (boolean)
      - `department` (text)
      - `is_read` (boolean)
      - `read_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `employee_alerts` table
    - Add policy for public access
*/

CREATE TABLE IF NOT EXISTS employee_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  message text NOT NULL,
  action_required boolean DEFAULT false,
  department text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employee_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to alerts"
  ON employee_alerts
  FOR ALL
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alerts_employee_id ON employee_alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON employee_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON employee_alerts(is_read);