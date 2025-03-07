/*
  # Add property details

  1. New Columns
    - `details` (JSONB) - Stores property details like:
      - squareFootage
      - bedrooms 
      - bathrooms
      - yearBuilt
      - lotSize
      - condition
      - lastSale
    - `market_trends` (JSONB) - Market trend data
    - `school_data` (JSONB) - School information
    - `demographics` (JSONB) - Demographic data
    - `zoning` (JSONB) - Zoning information

  2. Security
    - Maintain RLS policies
*/

-- Add new columns
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS details JSONB,
ADD COLUMN IF NOT EXISTS market_trends JSONB,
ADD COLUMN IF NOT EXISTS school_data JSONB,
ADD COLUMN IF NOT EXISTS demographics JSONB,
ADD COLUMN IF NOT EXISTS zoning JSONB;

-- Add validation check for details structure
ALTER TABLE properties
ADD CONSTRAINT valid_details CHECK (
  (details IS NULL) OR (
    jsonb_typeof(details->'squareFootage') IN ('number', 'null') AND
    jsonb_typeof(details->'bedrooms') IN ('number', 'null') AND
    jsonb_typeof(details->'bathrooms') IN ('number', 'null') AND
    jsonb_typeof(details->'yearBuilt') IN ('number', 'null') AND
    jsonb_typeof(details->'lotSize') IN ('number', 'null') AND
    jsonb_typeof(details->'condition') IN ('string', 'null')
  )
);

-- Create index for details queries
CREATE INDEX IF NOT EXISTS idx_properties_details ON properties USING gin (details);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON properties;
CREATE POLICY "Enable read access for authenticated users"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);