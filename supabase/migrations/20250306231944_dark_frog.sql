/*
  # Initial Schema Setup

  1. Tables
    - organizations: Core organization data
    - users_profile: User profiles linked to organizations
    - tickets: Support tickets
    - ticket_messages: Messages within tickets
    - knowledge_articles: Knowledge base articles
    - ai_agents: AI agent configurations
    - ai_agent_versions: Version history for AI agents
    - ai_agent_logs: Execution logs for AI agents
    - feedback: User feedback on tickets and messages

  2. Security
    - RLS enabled on all tables
    - Policies for organization-based access control
    - Secure references to auth.users

  3. Performance
    - Indexes on frequently queried columns
    - Optimized foreign key relationships
*/

-- Create enums
DO $$ 
BEGIN
  CREATE TYPE ticket_status AS ENUM ('new', 'open', 'pending', 'resolved', 'closed');
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  CREATE TYPE message_type AS ENUM ('user', 'agent', 'ai', 'system');
EXCEPTION 
  WHEN duplicate_object THEN null;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create organizations table
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

-- Create users_profile table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT users_profile_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create tickets table
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
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  message_type message_type NOT NULL,
  content text NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ai_agent_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create knowledge_articles table
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

-- Create ai_agents table
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

-- Create ai_agent_versions table
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

-- Create ai_agent_logs table
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

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  message_id uuid REFERENCES ticket_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_view_own_org" ON organizations
  FOR SELECT TO authenticated
  USING (id IN (
    SELECT organization_id FROM users_profile WHERE id = auth.uid()
  ));

CREATE POLICY "users_view_org_profiles" ON users_profile
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users_profile WHERE id = auth.uid()
  ));

CREATE POLICY "users_update_own_profile" ON users_profile
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_view_org_tickets" ON tickets
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users_profile WHERE id = auth.uid()
  ));

CREATE POLICY "users_create_org_tickets" ON tickets
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users_profile WHERE id = auth.uid()
  ));

CREATE POLICY "users_view_ticket_messages" ON ticket_messages
  FOR SELECT TO authenticated
  USING (ticket_id IN (
    SELECT t.id FROM tickets t
    JOIN users_profile p ON p.organization_id = t.organization_id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "users_view_org_articles" ON knowledge_articles
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users_profile WHERE id = auth.uid()
  ));

CREATE POLICY "users_view_org_agents" ON ai_agents
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users_profile WHERE id = auth.uid()
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_profile_org ON users_profile(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_org ON knowledge_articles(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_org ON ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_versions_agent ON ai_agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_agent ON ai_agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_ticket ON ai_agent_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_feedback_ticket ON feedback(ticket_id);

-- Create updated_at triggers
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