/*
  # Add RLS policies for property mutations

  1. Security Changes
    - Add INSERT policy for authenticated users
    - Add UPDATE policy for authenticated users
    - Maintain existing SELECT policy

  2. Notes
    - Policies allow authenticated users to insert and update properties
    - Maintains data integrity while allowing scraper functionality
*/

-- Enable RLS if not already enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Add INSERT policy
CREATE POLICY "Enable insert for authenticated users"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy  
CREATE POLICY "Enable update for authenticated users"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);