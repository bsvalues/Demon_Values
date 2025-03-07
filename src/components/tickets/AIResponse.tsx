import React, { useEffect, useState } from 'react';
import { Brain, XCircle } from 'lucide-react';
import { Ticket } from '../../lib/supabase/schema';
import { supportAgent } from '../../lib/ai/agents/supportAgent';
import { marked } from 'marked';

interface AIResponseProps {
  ticket: Ticket;
  onComplete: (response: string) => void;
  onCancel: () => void;
}

export default function AIResponse({ ticket, onComplete, onCancel }: AIResponseProps) {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let subscription: any;

    const generateResponse = async () => {
      try {
        // Subscribe to streaming response
        subscription = supportAgent.getResponseStream().subscribe({
          next: (chunk) => setResponse(chunk),
          complete: () => setIsGenerating(false)
        });

        // Generate response
        const result = await supportAgent.generateResponse(ticket);
        onComplete(result.content);
      } catch (error) {
        console.error('Failed to generate response:', error);
        onCancel();
      }
    };

    generateResponse();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      supportAgent.stop();
    };
  }, [ticket]);

  return (
    <div className="flex space-x-3">
      <div className="p-2 rounded-full bg-blue-500">
        <Brain className={`h-5 w-5 ${isGenerating ? 'animate-pulse' : ''}`} />
      </div>
      <div className="flex-1">
        <div className="relative">
          {isGenerating && (
            <button
              onClick={onCancel}
              className="absolute top-2 right-2 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </button>
          )}
          <div 
            className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: marked(response) }}
          />
        </div>
        {isGenerating && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
            <div className="h-1 w-1 rounded-full bg-blue-500 animate-ping" />
            <span>AI is typing...</span>
          </div>
        )}
      </div>
    </div>
  );
}