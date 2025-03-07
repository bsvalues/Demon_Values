/*
  # Organizations Schema

  1. New Tables
    - `organizations`: Core organization data
    - `users_profile`: Extended user profiles with organization links
    - `api_keys`: Organization API keys

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access
    
  3. Changes
    - Add necessary indexes for performance
    - Add triggers for automatic timestamp updates
*/

-- Organizations table
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

-- Extended user profiles
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

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Organization access policies
CREATE POLICY "Organization members can view their org"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users_profile 
      WHERE users_profile.organization_id = organizations.id
      AND users_profile.id = auth.uid()::uuid
    )
  );

-- User profile access policies
CREATE POLICY "Users can read own profile"
  ON users_profile
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::uuid);

CREATE POLICY "Users can update own profile"
  ON users_profile
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid);

-- API key access policies
CREATE POLICY "Organization members can view their API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users_profile 
      WHERE users_profile.organization_id = api_keys.organization_id
      AND users_profile.id = auth.uid()::uuid
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_profile_org ON users_profile(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Update functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();