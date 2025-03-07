import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Ticket } from '../../lib/supabase/schema';
import { Loader, Plus, Filter, Search } from 'lucide-react';
import CreateTicket from './CreateTicket';
import TicketAnalysis from './TicketAnalysis';
import TicketDetails from './TicketDetails';

export default function TicketList() {
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          assigned_to (
            id,
            profile:users_profile (
              full_name
            )
          ),
          created_by (
            id,
            profile:users_profile (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    }
  });

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 text-demon-red animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
        Failed to load tickets: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <button 
          onClick={() => setShowCreateTicket(true)}
          className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full bg-black/40 border border-demon-red/30 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-demon-red/50"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button className="px-4 py-2 bg-black/40 hover:bg-demon-red/10 rounded-lg flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="col-span-2 bg-black/40 border border-demon-red/30 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-demon-red/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-demon-red/30">
              {tickets?.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => handleTicketClick(ticket)}
                  className={`hover:bg-demon-red/5 cursor-pointer ${
                    selectedTicket?.id === ticket.id ? 'bg-demon-red/10' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{ticket.title}</div>
                    <div className="text-sm text-gray-400">{ticket.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {ticket.assigned_to?.profile?.full_name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Analysis Panel */}
        <div className="col-span-1">
          {selectedTicket ? (
            <TicketAnalysis ticket={selectedTicket} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a ticket to view analysis
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <CreateTicket onClose={() => setShowCreateTicket(false)} />
      )}

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <TicketDetails 
          ticket={selectedTicket} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </div>
  );
}