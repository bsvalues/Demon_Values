import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Ticket } from '../../lib/supabase/schema';
import { 
  Loader, 
  Send, 
  User, 
  Bot, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Brain
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AIResponse from './AIResponse';

interface TicketDetailsProps {
  ticket: Ticket;
  onClose: () => void;
}

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
});

type MessageForm = z.infer<typeof messageSchema>;

export default function TicketDetails({ ticket, onClose }: TicketDetailsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAIResponse, setShowAIResponse] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
  });

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['ticket-messages', ticket.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          sender:sender_id (
            id,
            profile:users_profile (
              full_name
            )
          ),
          ai_agent:ai_agent_id (
            id,
            name
          )
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const addMessage = useMutation({
    mutationFn: async (data: MessageForm) => {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          message_type: 'user',
          content: data.content,
          sender_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticket.id] });
      reset();
      setShowAIResponse(true);
    },
  });

  const addAIResponse = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          message_type: 'ai',
          content,
          ai_agent_id: 'support-agent', // Replace with actual agent ID
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticket.id] });
      setShowAIResponse(false);
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/80 border border-demon-red/30 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-demon-red/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{ticket.title}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Opened {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-demon-red/10 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="h-8 w-8 text-demon-red animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Failed to load messages
            </div>
          ) : messages?.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <MessageSquare className="h-6 w-6 mr-2" />
              No messages yet
            </div>
          ) : (
            messages?.map((message) => (
              <div
                key={message.id}
                className={`flex space-x-3 ${
                  message.message_type === 'user' ? 'justify-end' : ''
                }`}
              >
                <div className={`flex items-start space-x-3 max-w-[70%] ${
                  message.message_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-2 rounded-full ${
                    message.message_type === 'user' ? 'bg-demon-red' :
                    message.message_type === 'ai' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}>
                    {message.message_type === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : message.message_type === 'ai' ? (
                      <Brain className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className={`p-4 rounded-lg ${
                      message.message_type === 'user' ? 'bg-demon-red/10 border border-demon-red/30' :
                      message.message_type === 'ai' ? 'bg-blue-500/10 border border-blue-500/30' :
                      'bg-gray-500/10 border border-gray-500/30'
                    }`}>
                      <div 
                        className="prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: marked(message.content) }}
                      />
                    </div>
                    <div className={`mt-1 text-xs text-gray-400 flex items-center space-x-2 ${
                      message.message_type === 'user' ? 'justify-end' : ''
                    }`}>
                      <span>
                        {message.sender?.profile?.full_name || message.ai_agent?.name || 'System'}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {showAIResponse && (
            <AIResponse 
              ticket={ticket}
              onComplete={(response) => addAIResponse.mutate(response)}
              onCancel={() => setShowAIResponse(false)}
            />
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-demon-red/30">
          <form onSubmit={handleSubmit((data) => addMessage.mutate(data))} className="flex space-x-4">
            <div className="flex-1">
              <textarea
                {...register('content')}
                rows={3}
                className="w-full bg-black/40 border border-demon-red/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-demon-red/50"
                placeholder="Type your message..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2 h-fit disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}