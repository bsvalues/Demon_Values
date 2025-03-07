/*
  # Create API Keys Table

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `name` (text, unique per organization)
      - `key_hash` (text)
      - `permissions` (text[])
      - `created_at` (timestamptz)
      - `last_used` (timestamptz)
      - `expires_at` (timestamptz)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on `api_keys` table
    - Add policies for organization members to manage their API keys
*/

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL,
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(organization_id, name)
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Organization members can view their API keys"
  ON api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.organization_id = api_keys.organization_id
      AND up.id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can create API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.organization_id = api_keys.organization_id
      AND up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Organization admins can update API keys"
  ON api_keys
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.organization_id = api_keys.organization_id
      AND up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Organization admins can delete API keys"
  ON api_keys
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.organization_id = api_keys.organization_id
      AND up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX api_keys_organization_id_idx ON api_keys(organization_id);
CREATE INDEX api_keys_key_hash_idx ON api_keys(key_hash);