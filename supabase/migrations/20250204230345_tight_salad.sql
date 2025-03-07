/*
  # Update Properties Schema

  1. Table Updates
    - Add properties table if not exists
    - Add required columns and constraints
    - Add indexes for performance

  2. Security
    - Enable RLS
    - Add missing policies
*/

-- Create properties table if not exists
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  value numeric NOT NULL CHECK (value >= 0),
  latitude numeric NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude numeric NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  cluster text DEFAULT 'residential',
  details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create read policy if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users"
      ON properties
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_value ON properties (value);
CREATE INDEX IF NOT EXISTS idx_properties_cluster ON properties (cluster);
CREATE INDEX IF NOT EXISTS idx_properties_details ON properties USING gin (details);