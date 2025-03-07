/*
  # Comp Grid Schema

  1. New Tables
    - `comp_grids`: Stores grid configurations and metadata
    - `comp_properties`: Links properties to grids with ordering
    - `comp_adjustments`: Stores property adjustments
    - `comp_analysis`: Stores AI-generated analysis results

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access
    
  3. Changes
    - Add necessary indexes for performance
    - Add triggers for automatic timestamp updates
*/

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  subscription_status text NOT NULL DEFAULT 'trial',
  subscription_end_date timestamptz,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users_profile table if it doesn't exist
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT users_profile_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Comp Grids table
CREATE TABLE IF NOT EXISTS comp_grids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  subject_property_id uuid REFERENCES properties(id),
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Comp Properties table
CREATE TABLE IF NOT EXISTS comp_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id uuid NOT NULL REFERENCES comp_grids(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id),
  order_index integer NOT NULL,
  is_subject boolean DEFAULT false,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comp Adjustments table
CREATE TABLE IF NOT EXISTS comp_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id uuid NOT NULL REFERENCES comp_grids(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES comp_properties(id) ON DELETE CASCADE,
  category text NOT NULL,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('flat', 'percentage')),
  amount numeric NOT NULL,
  description text,
  ai_generated boolean DEFAULT false,
  confidence numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comp Analysis table
CREATE TABLE IF NOT EXISTS comp_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id uuid NOT NULL REFERENCES comp_grids(id) ON DELETE CASCADE,
  analysis_type text NOT NULL,
  findings jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comp_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view comp grids in their organization"
  ON comp_grids
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users_profile 
      WHERE id = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can manage comp grids in their organization"
  ON comp_grids
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users_profile 
      WHERE id = auth.uid()::uuid
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users_profile 
      WHERE id = auth.uid()::uuid
    )
  );

-- Cascade policies to related tables
CREATE POLICY "Users can access comp properties through grids"
  ON comp_properties
  FOR ALL
  TO authenticated
  USING (
    grid_id IN (
      SELECT id FROM comp_grids
      WHERE organization_id IN (
        SELECT organization_id 
        FROM users_profile 
        WHERE id = auth.uid()::uuid
      )
    )
  );

CREATE POLICY "Users can access comp adjustments through grids"
  ON comp_adjustments
  FOR ALL
  TO authenticated
  USING (
    grid_id IN (
      SELECT id FROM comp_grids
      WHERE organization_id IN (
        SELECT organization_id 
        FROM users_profile 
        WHERE id = auth.uid()::uuid
      )
    )
  );

CREATE POLICY "Users can access comp analysis through grids"
  ON comp_analysis
  FOR ALL
  TO authenticated
  USING (
    grid_id IN (
      SELECT id FROM comp_grids
      WHERE organization_id IN (
        SELECT organization_id 
        FROM users_profile 
        WHERE id = auth.uid()::uuid
      )
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comp_grids_org ON comp_grids(organization_id);
CREATE INDEX IF NOT EXISTS idx_comp_properties_grid ON comp_properties(grid_id);
CREATE INDEX IF NOT EXISTS idx_comp_adjustments_grid ON comp_adjustments(grid_id);
CREATE INDEX IF NOT EXISTS idx_comp_analysis_grid ON comp_analysis(grid_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comp_grids_timestamp
  BEFORE UPDATE ON comp_grids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_comp_properties_timestamp
  BEFORE UPDATE ON comp_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_comp_adjustments_timestamp
  BEFORE UPDATE ON comp_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_comp_analysis_timestamp
  BEFORE UPDATE ON comp_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();