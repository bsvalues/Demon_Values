import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Loader, X } from 'lucide-react';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

type TicketForm = z.infer<typeof ticketSchema>;

interface CreateTicketProps {
  onClose: () => void;
}

export default function CreateTicket({ onClose }: CreateTicketProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'medium'
    }
  });

  const createTicket = useMutation({
    mutationFn: async (data: TicketForm) => {
      const { error } = await supabase
        .from('tickets')
        .insert({
          ...data,
          organization_id: user?.organization?.id,
          created_by: user?.id,
          status: 'new'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/80 border border-demon-red/30 rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-demon-red/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => createTicket.mutate(data))} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-demon-red/50"
              placeholder="Brief description of the issue"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-demon-red/50"
              placeholder="Detailed description of the issue"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300">
              Priority
            </label>
            <select
              id="priority"
              {...register('priority')}
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-demon-red/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-500">{errors.priority.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-black/40 hover:bg-demon-red/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}