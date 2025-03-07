import React from 'react';
import { BarChart2, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TrendAnalyzer from './TrendAnalyzer';
import MarketSentimentPanel from './MarketSentimentPanel';
import AIAnalyticsPanel from './AIAnalyticsPanel';

export default function Analytics() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = React.useState<'trends' | 'sentiment' | 'ai'>('trends');

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-400">{user?.organization?.name}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedView('trends')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              selectedView === 'trends' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/10'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Trends</span>
          </button>
          <button
            onClick={() => setSelectedView('sentiment')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              selectedView === 'sentiment' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/10'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Market Sentiment</span>
          </button>
          <button
            onClick={() => setSelectedView('ai')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              selectedView === 'ai' 
                ? 'bg-demon-red text-white' 
                : 'bg-black/40 hover:bg-demon-red/10'
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>AI Analysis</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-gray-400">Total Properties</div>
            <BarChart2 className="h-5 w-5 text-demon-red" />
          </div>
          <div className="mt-2 text-2xl font-bold">2,547</div>
          <div className="mt-1 text-sm text-green-500">+12.5% from last month</div>
        </div>

        <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-gray-400">Average Value</div>
            <DollarSign className="h-5 w-5 text-demon-red" />
          </div>
          <div className="mt-2 text-2xl font-bold">$425,000</div>
          <div className="mt-1 text-sm text-green-500">+5.2% from last month</div>
        </div>

        {/* Add more stat cards as needed */}
      </div>

      {/* Main Content */}
      <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
        {selectedView === 'trends' && <TrendAnalyzer properties={[]} />}
        {selectedView === 'sentiment' && <MarketSentimentPanel properties={[]} />}
        {selectedView === 'ai' && <AIAnalyticsPanel property={{
          id: '1',
          address: '123 Main St',
          value: 500000,
          latitude: 37.7749,
          longitude: -122.4194,
          cluster: 'residential'
        }} />}
      </div>
    </div>
  );
}