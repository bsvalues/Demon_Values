import React from 'react';
import { Brain, Play, Save, History, Settings } from 'lucide-react';

export default function AIPlayground() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Playground</h1>
          <p className="text-gray-400">Test and fine-tune AI agent responses</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-black/40 hover:bg-demon-red/10 rounded-lg flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>History</span>
          </button>
          <button className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Save Version</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Prompt</h2>
              <button className="p-2 hover:bg-demon-red/10 rounded-lg">
                <Settings className="h-5 w-5" />
              </button>
            </div>
            <textarea
              className="w-full h-64 bg-black/40 border border-demon-red/30 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-demon-red/50"
              placeholder="Enter your prompt here..."
            />
            <button className="mt-4 w-full px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center justify-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Run</span>
            </button>
          </div>

          <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Context</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Agent Type
                </label>
                <select className="w-full bg-black/40 border border-demon-red/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-demon-red/50">
                  <option value="support">Support Agent</option>
                  <option value="triage">Triage Agent</option>
                  <option value="sentiment">Sentiment Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Temperature
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Response</h2>
            <div className="h-64 bg-black/40 border border-demon-red/30 rounded-lg p-4 overflow-auto">
              <p className="text-gray-400">Response will appear here...</p>
            </div>
          </div>

          <div className="bg-black/40 border border-demon-red/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Analysis</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Response Quality</h3>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-demon-red to-demon-orange" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Tone Analysis</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Professional</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-demon-red to-demon-orange" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Completeness</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Complete</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-demon-red to-demon-orange" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}