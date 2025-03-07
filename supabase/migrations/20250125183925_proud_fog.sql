/*
  # Property Database Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `address` (text)
      - `value` (numeric)
      - `latitude` (numeric)
      - `longitude` (numeric) 
      - `cluster` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on properties table
    - Add policy for authenticated users to read properties

  3. Indexes
    - B-tree indexes on latitude, longitude for spatial queries
    - B-tree index on value for range queries
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  value numeric NOT NULL CHECK (value >= 0),
  latitude numeric NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude numeric NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  cluster text DEFAULT 'residential',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policy for reading properties
CREATE POLICY "Enable read access for authenticated users"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for spatial and value queries
CREATE INDEX properties_lat_long_idx ON properties (latitude, longitude);
CREATE INDEX properties_value_idx ON properties (value);

-- Sample data for southeastern Washington
INSERT INTO properties (address, value, latitude, longitude, cluster) VALUES
  ('1234 W Canal Dr, Kennewick, WA', 425000, 46.2273, -119.1755, 'residential'),
  ('789 George Washington Way, Richland, WA', 375000, 46.2789, -119.2834, 'residential'),
  ('456 Court St, Pasco, WA', 295000, 46.2395, -119.0987, 'residential'),
  ('321 Columbia Center Blvd, Kennewick, WA', 850000, 46.2187, -119.2334, 'commercial'),
  ('555 Stevens Dr, Richland, WA', 750000, 46.2654, -119.2776, 'commercial'),
  ('123 Road 68, Pasco, WA', 525000, 46.2456, -119.1543, 'residential'),
  ('789 Gage Blvd, Richland, WA', 445000, 46.2543, -119.2654, 'residential'),
  ('432 Edison St, Kennewick, WA', 385000, 46.2123, -119.1876, 'residential'),
  ('567 Road 100, Pasco, WA', 675000, 46.2345, -119.1234, 'residential'),
  ('890 Leslie Rd, Richland, WA', 495000, 46.2678, -119.2987, 'residential')
ON CONFLICT DO NOTHING;