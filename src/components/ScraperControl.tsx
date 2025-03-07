import React, { useEffect } from 'react';
import { Download, AlertTriangle, CheckCircle, Loader, Settings, RefreshCw, Database } from 'lucide-react';
import { propertyScraper } from '../lib/scraper/core';

export default function ScraperControl() {
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState({ current: 0, total: 0, status: '' });
  const [showSettings, setShowSettings] = React.useState(false);
  const [result, setResult] = React.useState<{
    success?: boolean;
    scraped?: number;
    errors?: string[];
    warnings?: string[];
    duration?: number;
  } | null>(null);

  useEffect(() => {
    const subscription = propertyScraper.getProgress().subscribe(progress => {
      setProgress(progress);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);

    try {
      const result = await propertyScraper.scrapeProperties('Tri-Cities, WA');
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        scraped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Download className="h-5 w-5 text-demon-red" />
            <span>Property Scraper</span>
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-demon-red/10 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleScrape}
          disabled={loading}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            loading 
              ? 'bg-demon-red/20 cursor-not-allowed' 
              : 'bg-demon-red hover:bg-demon-red-dark'
          }`}
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Scraping...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Start Scraping</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-black/40 rounded-lg space-y-4">
          <h4 className="font-medium">Scraper Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Batch Size</label>
              <input
                type="number"
                className="w-full bg-black/40 border border-demon-red/30 rounded px-3 py-1"
                placeholder="20"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Delay (ms)</label>
              <input
                type="number"
                className="w-full bg-black/40 border border-demon-red/30 rounded px-3 py-1"
                placeholder="2000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{progress.status}</span>
            </div>
            <span>{Math.round(progress.current)}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-demon-red to-demon-orange transition-all duration-300"
              style={{ width: `${progress.current}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`space-y-4 ${
          result.success 
            ? 'text-green-500' 
            : 'text-red-500'
        }`}>
          {/* Status Summary */}
          <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
            <div className="flex items-center space-x-3">
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {result.success ? 'Scraping Complete' : 'Scraping Failed'}
              </span>
            </div>
            {result.duration && (
              <span className="text-sm text-gray-400">
                Duration: {(result.duration / 1000).toFixed(1)}s
              </span>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-demon-red" />
                <span className="text-sm text-gray-400">Properties Scraped</span>
              </div>
              <div className="text-2xl font-semibold text-white">
                {result.scraped?.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-black/40 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-400">Issues Found</span>
              </div>
              <div className="text-2xl font-semibold text-white">
                {(result.errors?.length || 0) + (result.warnings?.length || 0)}
              </div>
            </div>
          </div>

          {/* Errors & Warnings */}
          {(result.errors?.length || 0) > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-500">Errors</h4>
              {result.errors?.map((error, i) => (
                <div key={i} className="p-3 bg-red-500/10 rounded-lg text-sm">
                  {error}
                </div>
              ))}
            </div>
          )}

          {(result.warnings?.length || 0) > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-500">Warnings</h4>
              {result.warnings?.map((warning, i) => (
                <div key={i} className="p-3 bg-yellow-500/10 rounded-lg text-sm">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}