import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Shield, Trash2, AlertCircle } from 'lucide-react';

export default function Team() {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement team member invitation logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-400">{user?.organization?.name}</p>
        </div>

        <form onSubmit={handleInvite} className="flex items-center space-x-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="team@example.com"
            className="px-4 py-2 bg-black/40 border border-demon-red/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-demon-red/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Invite</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-black/40 border border-demon-red/30 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-demon-red/30">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-demon-red/30">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                {user?.profile?.full_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-demon-red" />
                  <span>Admin</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  disabled
                  className="text-gray-400 cursor-not-allowed"
                  title="Cannot remove organization owner"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
            {/* Add more team members here */}
          </tbody>
        </table>
      </div>
    </div>
  );
}