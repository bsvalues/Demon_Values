import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import { Ticket } from '../../lib/supabase/schema';
import { analyzeTicket } from '../../lib/ai/ticketAnalysis';

interface TicketAnalysisProps {
  ticket: Ticket;
}

export default function TicketAnalysis({ ticket }: TicketAnalysisProps) {
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['ticket-analysis', ticket.id],
    queryFn: () => analyzeTicket(ticket),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Brain className="h-8 w-8 text-demon-red animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-500">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>Failed to analyze ticket</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      {/* Completeness Check */}
      <div className="p-4 bg-black/40 border border-demon-red/30 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Information Completeness</h3>
          <div className={`flex items-center space-x-1 ${
            analysis.completeness.score > 0.7 ? 'text-green-500' : 'text-yellow-500'
          }`}>
            {analysis.completeness.score > 0.7 ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{Math.round(analysis.completeness.score * 100)}%</span>
          </div>
        </div>

        {analysis.completeness.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Missing Information:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {analysis.completeness.missingFields.map((field) => (
                <li key={field} className="text-yellow-500">{field}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested Articles */}
      {analysis.suggestedArticles.length > 0 && (
        <div className="p-4 bg-black/40 border border-demon-red/30 rounded-lg">
          <h3 className="font-semibold mb-4">Suggested Knowledge Base Articles</h3>
          <div className="space-y-3">
            {analysis.suggestedArticles.map((article) => (
              <div
                key={article.id}
                className="p-3 bg-black/40 rounded-lg hover:bg-demon-red/10 transition-colors cursor-pointer"
              >
                <h4 className="font-medium">{article.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{article.relevance}% match</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Response Suggestion */}
      <div className="p-4 bg-black/40 border border-demon-red/30 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Suggested Response</h3>
          <button className="px-3 py-1 bg-demon-red hover:bg-demon-red-dark rounded-lg text-sm flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>Use Response</span>
          </button>
        </div>
        <div className="p-3 bg-black/40 rounded-lg text-sm">
          {analysis.suggestedResponse}
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="p-4 bg-black/40 border border-demon-red/30 rounded-lg">
        <h3 className="font-semibold mb-4">Sentiment Analysis</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Customer Sentiment</span>
              <span className={
                analysis.sentiment.score > 0.6 ? 'text-green-500' :
                analysis.sentiment.score < 0.4 ? 'text-red-500' :
                'text-yellow-500'
              }>
                {analysis.sentiment.label}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                style={{ width: `${analysis.sentiment.score * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Urgency</span>
              <span className={
                analysis.urgency > 0.7 ? 'text-red-500' :
                analysis.urgency > 0.4 ? 'text-yellow-500' :
                'text-green-500'
              }>
                {analysis.urgency > 0.7 ? 'High' :
                 analysis.urgency > 0.4 ? 'Medium' :
                 'Low'}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                style={{ width: `${analysis.urgency * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}