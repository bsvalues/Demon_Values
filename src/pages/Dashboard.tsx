import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket as TicketList, MessageCircle, Settings, Users, Key, LogOut, Menu, ChevronDown, Brain, BookOpen } from 'lucide-react';

// Lazy load dashboard components
const Tickets = React.lazy(() => import('../components/tickets/TicketList'));
const KnowledgeBase = React.lazy(() => import('../components/knowledge/KnowledgeBase'));
const AIPlayground = React.lazy(() => import('../components/ai/AIPlayground'));
const Settings = React.lazy(() => import('../components/Settings'));
const Team = React.lazy(() => import('../components/Team'));
const ApiKeys = React.lazy(() => import('../components/ApiKeys'));

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navigation = [
    { name: 'Tickets', path: '/dashboard', icon: TicketList },
    { name: 'Knowledge Base', path: '/dashboard/knowledge', icon: BookOpen },
    { name: 'AI Playground', path: '/dashboard/playground', icon: Brain },
    { name: 'Team', path: '/dashboard/team', icon: Users },
    { name: 'API Keys', path: '/dashboard/api-keys', icon: Key },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Top Navigation */}
      <div className="bg-black/40 border-b border-demon-red/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-demon-red/10"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-demon-red text-white' 
                        : 'hover:bg-demon-red/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-demon-red/10"
              >
                <div className="text-right">
                  <div className="font-medium">{user?.profile?.full_name}</div>
                  <div className="text-sm text-gray-400">{user?.organization?.name}</div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/80 border border-demon-red/30 rounded-lg shadow-lg backdrop-blur-sm">
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-demon-red/10"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="lg:hidden bg-black/80 border-b border-demon-red/30 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-demon-red text-white' 
                      : 'hover:bg-demon-red/10'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
            <div className="animate-spin text-demon-red">
              <svg className="h-8 w-8" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        }>
          <Routes>
            <Route index element={<Tickets />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="playground" element={<AIPlayground />} />
            <Route path="team" element={<Team />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  );
}