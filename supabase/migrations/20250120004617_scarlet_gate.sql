/*
  # Create properties table with clustering support

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `address` (text)
      - `value` (numeric)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `cluster` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `properties` table
    - Add policy for authenticated users to read all properties
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  value numeric NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  cluster text DEFAULT 'unclassified',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);