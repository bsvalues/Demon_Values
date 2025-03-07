import { BehaviorSubject } from 'rxjs';
import { supabase } from '../../supabase';
import { Ticket } from '../../supabase/schema';

interface AgentResponse {
  content: string;
  confidence: number;
  sources?: Array<{
    id: string;
    title: string;
    relevance: number;
  }>;
}

export class SupportAgent {
  private response$ = new BehaviorSubject<string>('');
  private isGenerating = false;

  async generateResponse(ticket: Ticket): Promise<AgentResponse> {
    if (this.isGenerating) {
      throw new Error('Response generation already in progress');
    }

    this.isGenerating = true;
    this.response$.next('');

    try {
      // Fetch relevant knowledge base articles
      const { data: articles } = await supabase
        .from('knowledge_articles')
        .select('id, title, content')
        .textSearch('content', ticket.description)
        .limit(3);

      // Simulate streaming response generation
      const response = await this.streamResponse(ticket, articles || []);

      return {
        content: response,
        confidence: 0.85,
        sources: articles?.map(article => ({
          id: article.id,
          title: article.title,
          relevance: Math.random() * 20 + 80 // Simulated relevance score
        }))
      };
    } finally {
      this.isGenerating = false;
    }
  }

  private async streamResponse(
    ticket: Ticket,
    articles: Array<{ title: string; content: string }>
  ): Promise<string> {
    const response = `Thank you for reaching out about "${ticket.title}". I understand your concern and I'll help you resolve this issue.

Based on your description, I've identified a few potential solutions:

1. First, let's verify the exact problem you're experiencing:
   - When did this issue start?
   - Are there any error messages?
   - Have you tried any solutions already?

2. From our knowledge base, here are some relevant articles that might help:
${articles.map(article => `   - ${article.title}`).join('\n')}

3. In the meantime, here are some immediate steps you can take:
   - Clear your browser cache and cookies
   - Try accessing the system in a different browser
   - Ensure all required software is up to date

Please let me know if you've already tried any of these solutions or if you need more specific guidance.`;

    // Simulate streaming by sending chunks of the response
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words.slice(0, i + 1).join(' ');
      this.response$.next(chunk);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return response;
  }

  getResponseStream() {
    return this.response$.asObservable();
  }

  stop() {
    this.isGenerating = false;
    this.response$.complete();
  }
}

export const supportAgent = new SupportAgent();