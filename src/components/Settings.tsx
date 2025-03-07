import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, AlertCircle } from 'lucide-react';
import { updateProfile } from '../lib/auth';

export default function Settings() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.profile?.full_name || '',
    email: user?.email || '',
    organizationName: user?.organization?.name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(user.id, {
        full_name: formData.fullName,
      });
      setSuccess(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400">Manage your account and organization settings</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-2 text-green-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>Settings updated successfully</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Profile Information</h2>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-demon-red/50"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Organization Settings</h2>

          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300">
              Organization Name
            </label>
            <input
              id="organizationName"
              type="text"
              value={formData.organizationName}
              disabled
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}