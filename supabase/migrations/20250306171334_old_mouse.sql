/*
  # Initial Support Platform Schema

  1. New Tables
    - `tickets`: Support ticket tracking
    - `knowledge_articles`: Knowledge base articles
    - `ai_agents`: AI agent configurations
    - `ai_agent_versions`: Version history for AI agents
    - `ai_agent_logs`: Logging for AI interactions

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access
    
  3. Enums
    - ticket_status
    - ticket_priority
*/

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

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'new',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI agents
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI agent versions
CREATE TABLE IF NOT EXISTS ai_agent_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  version text NOT NULL,
  prompt text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- AI agent logs
CREATE TABLE IF NOT EXISTS ai_agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES ai_agent_versions(id) ON DELETE CASCADE,
  ticket_id uuid REFERENCES tickets(id) ON DELETE SET NULL,
  input text NOT NULL,
  output text NOT NULL,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_logs ENABLE ROW LEVEL SECURITY;

-- Tickets policies
CREATE POLICY "Users can view tickets in their organization"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users_profile 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create tickets in their organization"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users_profile 
      WHERE id = auth.uid()
    )
  );

-- Knowledge articles policies
CREATE POLICY "Users can view knowledge articles in their organization"
  ON knowledge_articles
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users_profile 
      WHERE id = auth.uid()
    )
  );

-- AI agents policies
CREATE POLICY "Users can view AI agents in their organization"
  ON ai_agents
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users_profile 
      WHERE id = auth.uid()
    )
  );

-- AI agent versions policies
CREATE POLICY "Users can view AI agent versions in their organization"
  ON ai_agent_versions
  FOR SELECT
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM ai_agents
      WHERE organization_id IN (
        SELECT organization_id 
        FROM users_profile 
        WHERE id = auth.uid()
      )
    )
  );

-- AI agent logs policies
CREATE POLICY "Users can view AI agent logs in their organization"
  ON ai_agent_logs
  FOR SELECT
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM ai_agents
      WHERE organization_id IN (
        SELECT organization_id 
        FROM users_profile 
        WHERE id = auth.uid()
      )
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_org ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_org ON knowledge_articles(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_org ON ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_versions_agent ON ai_agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_agent ON ai_agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_ticket ON ai_agent_logs(ticket_id);

-- Update triggers
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_knowledge_articles_updated_at
  BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();