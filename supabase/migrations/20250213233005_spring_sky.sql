/*
  # Initial Properties Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `address` (text, not null)
      - `value` (numeric, not null)
      - `latitude` (numeric, not null)
      - `longitude` (numeric, not null)
      - `cluster` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `properties` table
    - Add policies for authenticated users to read data
*/

-- Create properties table
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

-- Create read policy if it doesn't exist
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_value ON properties (value);
CREATE INDEX IF NOT EXISTS idx_properties_cluster ON properties (cluster);
CREATE INDEX IF NOT EXISTS idx_properties_details ON properties USING gin (details);

-- Insert sample data for Tri-Cities area
INSERT INTO properties (address, value, latitude, longitude, cluster, details) VALUES
  ('1234 W Canal Dr, Kennewick, WA', 425000, 46.2273, -119.1755, 'residential', '{"squareFootage": 2400, "bedrooms": 4, "bathrooms": 2.5, "yearBuilt": 2005}'),
  ('789 George Washington Way, Richland, WA', 375000, 46.2789, -119.2834, 'residential', '{"squareFootage": 1800, "bedrooms": 3, "bathrooms": 2, "yearBuilt": 1995}'),
  ('456 Court St, Pasco, WA', 295000, 46.2395, -119.0987, 'residential', '{"squareFootage": 1600, "bedrooms": 3, "bathrooms": 1.5, "yearBuilt": 1985}'),
  ('321 Columbia Center Blvd, Kennewick, WA', 850000, 46.2187, -119.2334, 'commercial', '{"squareFootage": 5000, "yearBuilt": 2010}'),
  ('555 Stevens Dr, Richland, WA', 750000, 46.2654, -119.2776, 'commercial', '{"squareFootage": 4200, "yearBuilt": 2015}')
ON CONFLICT DO NOTHING;