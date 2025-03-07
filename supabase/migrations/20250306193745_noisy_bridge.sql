/*
  # Initial Schema Setup for AI Support Platform

  1. Tables
    - organizations: Organization details and settings
    - users_profile: Extended user profile information
    - tickets: Support tickets
    - ticket_messages: Messages within tickets
    - knowledge_articles: Knowledge base articles
    - ai_agents: AI agent configurations
    - ai_agent_versions: Version history for AI agents
    - ai_agent_logs: Interaction logs for AI agents
    - feedback: User feedback on AI responses

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for organization-based access control
    - Secure defaults for all tables

  3. Indexes
    - Optimized for common queries
    - Support for full-text search
*/

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enums
CREATE TYPE ticket_status AS ENUM (
  'new',
  'open',
  'pending',
  'resolved',
  'closed'
);

CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE message_type AS ENUM (
  'user',
  'agent',
  'ai',
  'system'
);

-- Organizations table (create this first since other tables reference it)
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

-- User profiles table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  organization uuid NOT NULL REFERENCES organizations ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI agents table
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization uuid NOT NULL REFERENCES organizations ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI agent versions
CREATE TABLE IF NOT EXISTS ai_agent_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents ON DELETE CASCADE,
  version text NOT NULL,
  prompt text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization uuid NOT NULL REFERENCES organizations ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'new',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES auth.users ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ticket messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets ON DELETE CASCADE,
  message_type message_type NOT NULL,
  content text NOT NULL,
  sender_id uuid REFERENCES auth.users ON DELETE SET NULL,
  ai_agent_id uuid REFERENCES ai_agents ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization uuid NOT NULL REFERENCES organizations ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI agent logs
CREATE TABLE IF NOT EXISTS ai_agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES ai_agent_versions ON DELETE CASCADE,
  ticket_id uuid REFERENCES tickets ON DELETE SET NULL,
  input text NOT NULL,
  output text NOT NULL,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets ON DELETE CASCADE,
  message_id uuid REFERENCES ticket_messages ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Users can view their organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id::uuid = (
      SELECT profile.organization::uuid
      FROM users_profile profile
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- User profile policies
CREATE POLICY "Users can view profiles in their organization"
  ON users_profile
  FOR SELECT
  TO authenticated
  USING (
    organization::uuid = (
      SELECT profile.organization::uuid
      FROM users_profile profile
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- AI agents policies
CREATE POLICY "Users can view AI agents in their organization"
  ON ai_agents
  FOR SELECT
  TO authenticated
  USING (
    organization::uuid = (
      SELECT profile.organization::uuid
      FROM users_profile profile
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- AI agent versions policies
CREATE POLICY "Users can view AI agent versions in their organization"
  ON ai_agent_versions
  FOR SELECT
  TO authenticated
  USING (
    agent_id::uuid IN (
      SELECT a.id::uuid
      FROM ai_agents a
      JOIN users_profile profile ON profile.organization::uuid = a.organization::uuid
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- Tickets policies
CREATE POLICY "Users can view tickets in their organization"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    organization::uuid = (
      SELECT profile.organization::uuid
      FROM users_profile profile
      WHERE profile.id = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can create tickets in their organization"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization::uuid = (
      SELECT profile.organization::uuid
      FROM users_profile profile
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- Ticket messages policies
CREATE POLICY "Users can view messages for tickets in their organization"
  ON ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    ticket_id::uuid IN (
      SELECT t.id::uuid
      FROM tickets t
      JOIN users_profile profile ON profile.organization::uuid = t.organization::uuid
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- Knowledge articles policies
CREATE POLICY "Users can view knowledge articles in their organization"
  ON knowledge_articles
  FOR SELECT
  TO authenticated
  USING (
    organization::uuid = (
      SELECT profile.organization::uuid
      FROM users_profile profile
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- AI agent logs policies
CREATE POLICY "Users can view AI agent logs in their organization"
  ON ai_agent_logs
  FOR SELECT
  TO authenticated
  USING (
    agent_id::uuid IN (
      SELECT a.id::uuid
      FROM ai_agents a
      JOIN users_profile profile ON profile.organization::uuid = a.organization::uuid
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- Feedback policies
CREATE POLICY "Users can view feedback in their organization"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    ticket_id::uuid IN (
      SELECT t.id::uuid
      FROM tickets t
      JOIN users_profile profile ON profile.organization::uuid = t.organization::uuid
      WHERE profile.id = auth.uid()::uuid
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_profile_org ON users_profile(organization);
CREATE INDEX IF NOT EXISTS idx_tickets_org ON tickets(organization);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_org ON knowledge_articles(organization);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_org ON ai_agents(organization);
CREATE INDEX IF NOT EXISTS idx_ai_agent_versions_agent ON ai_agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_agent ON ai_agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_ticket ON ai_agent_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_feedback_ticket ON feedback(ticket_id);

-- Update triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_articles_updated_at
  BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();