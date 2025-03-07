import { Database } from '../../types/supabase';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

export type Ticket = Tables['tickets']['Row'];
export type TicketInsert = Tables['tickets']['Insert'];
export type TicketUpdate = Tables['tickets']['Update'];

export type TicketStatus = Enums['ticket_status'];
export type TicketPriority = Enums['ticket_priority'];

export type KnowledgeArticle = Tables['knowledge_articles']['Row'];
export type KnowledgeArticleInsert = Tables['knowledge_articles']['Insert'];
export type KnowledgeArticleUpdate = Tables['knowledge_articles']['Update'];

export type AIAgent = Tables['ai_agents']['Row'];
export type AIAgentInsert = Tables['ai_agents']['Insert'];
export type AIAgentUpdate = Tables['ai_agents']['Update'];

export type AIAgentVersion = Tables['ai_agent_versions']['Row'];
export type AIAgentVersionInsert = Tables['ai_agent_versions']['Insert'];
export type AIAgentVersionUpdate = Tables['ai_agent_versions']['Update'];

export type AIAgentLog = Tables['ai_agent_logs']['Row'];
export type AIAgentLogInsert = Tables['ai_agent_logs']['Insert'];
export type AIAgentLogUpdate = Tables['ai_agent_logs']['Update'];