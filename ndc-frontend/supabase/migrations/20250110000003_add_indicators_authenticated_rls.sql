-- Allow authenticated users to manage indicators (INSERT, UPDATE, DELETE)
-- Created: 2025-01-10

CREATE POLICY "Authenticated users can manage indicators"
  ON indicators FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
