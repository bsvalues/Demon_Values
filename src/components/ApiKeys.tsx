import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { generateApiKey } from '../lib/auth';

export default function ApiKeys() {
  const { user } = useAuth();
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organization?.id) return;

    try {
      setError(null);
      const result = await generateApiKey(user.organization.id, newKeyName, ['read']);
      // Handle new key creation
      setNewKeyName('');
      setShowNewKeyForm(false);
    } catch (err) {
      console.error('Failed to create API key:', err);
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-gray-400">{user?.organization?.name}</p>
        </div>

        <button
          onClick={() => setShowNewKeyForm(true)}
          className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Key</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {showNewKeyForm && (
        <form onSubmit={handleCreateKey} className="bg-black/40 border border-demon-red/30 rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="keyName" className="block text-sm font-medium text-gray-300">
              Key Name
            </label>
            <input
              id="keyName"
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-demon-red/50"
              placeholder="Production API Key"
            />
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowNewKeyForm(false)}
              className="px-4 py-2 bg-black/40 hover:bg-demon-red/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="bg-black/40 border border-demon-red/30 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-demon-red/30">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Key</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Created</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-demon-red/30">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-demon-red" />
                  <span>Example Key</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <code className="bg-black/40 px-2 py-1 rounded">••••••••</code>
                  <button
                    onClick={() => copyToClipboard('example-key')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'example-key' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                2024-03-06
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button className="text-red-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}