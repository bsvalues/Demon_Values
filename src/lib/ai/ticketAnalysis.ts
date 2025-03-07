import { Ticket } from '../supabase/schema';
import { supabase } from '../supabase';

interface TicketAnalysis {
  completeness: {
    score: number;
    missingFields: string[];
  };
  suggestedArticles: Array<{
    id: string;
    title: string;
    relevance: number;
  }>;
  suggestedResponse: string;
  sentiment: {
    score: number;
    label: string;
  };
  urgency: number;
}

export async function analyzeTicket(ticket: Ticket): Promise<TicketAnalysis> {
  // Analyze ticket completeness
  const completeness = analyzeCompleteness(ticket);

  // Find relevant knowledge base articles
  const articles = await findRelevantArticles(ticket);

  // Generate suggested response
  const response = await generateResponse(ticket);

  // Analyze sentiment and urgency
  const sentiment = analyzeSentiment(ticket);
  const urgency = calculateUrgency(ticket);

  return {
    completeness,
    suggestedArticles: articles,
    suggestedResponse: response,
    sentiment,
    urgency
  };
}

function analyzeCompleteness(ticket: Ticket) {
  const requiredFields = [
    { name: 'Description', check: () => ticket.description.length > 50 },
    { name: 'Steps to Reproduce', check: () => ticket.description.includes('steps') },
    { name: 'Expected Behavior', check: () => ticket.description.includes('expected') },
    { name: 'System Information', check: () => ticket.description.includes('system') }
  ];

  const missingFields = requiredFields
    .filter(field => !field.check())
    .map(field => field.name);

  return {
    score: (requiredFields.length - missingFields.length) / requiredFields.length,
    missingFields
  };
}

async function findRelevantArticles(ticket: Ticket) {
  // In a real implementation, this would use vector similarity search
  // For now, we'll use a simple keyword match
  const { data: articles } = await supabase
    .from('knowledge_articles')
    .select('id, title')
    .textSearch('content', ticket.description)
    .limit(3);

  return (articles || []).map(article => ({
    id: article.id,
    title: article.title,
    relevance: Math.round(Math.random() * 30 + 70) // Simulated relevance score
  }));
}

async function generateResponse(ticket: Ticket) {
  // In a real implementation, this would use an LLM
  // For now, return a template response
  return `Thank you for reporting this issue. I understand you're experiencing problems with ${
    ticket.title.toLowerCase()
  }. I'll help you resolve this as quickly as possible.

Could you please provide:
1. More specific details about when this started
2. Any error messages you're seeing
3. Steps you've already taken to resolve this

I'll investigate this right away and get back to you with a solution.`;
}

function analyzeSentiment(ticket: Ticket) {
  // In a real implementation, this would use an ML model
  // For now, use simple keyword analysis
  const negativeWords = ['error', 'problem', 'issue', 'bug', 'broken', 'not working'];
  const urgentWords = ['urgent', 'asap', 'emergency', 'critical', 'blocking'];

  const text = ticket.description.toLowerCase();
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  const urgentCount = urgentWords.filter(word => text.includes(word)).length;

  const score = Math.max(0, Math.min(1, 1 - (negativeCount * 0.2 + urgentCount * 0.3)));

  return {
    score,
    label: score > 0.6 ? 'Positive' : score > 0.4 ? 'Neutral' : 'Negative'
  };
}

function calculateUrgency(ticket: Ticket) {
  // Combine multiple factors for urgency calculation
  const factors = [
    ticket.priority === 'urgent' ? 1 : 
    ticket.priority === 'high' ? 0.75 :
    ticket.priority === 'medium' ? 0.5 : 0.25,
    
    ticket.description.toLowerCase().includes('urgent') ? 1 : 0,
    ticket.description.toLowerCase().includes('asap') ? 1 : 0,
    ticket.description.length < 100 ? 0.5 : 0 // Short descriptions might indicate urgency
  ];

  return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
}