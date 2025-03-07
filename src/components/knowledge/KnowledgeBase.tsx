import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { KnowledgeArticle } from '../../lib/supabase/schema';
import { Loader, Plus, Search, Tag } from 'lucide-react';

export default function KnowledgeBase() {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`
          *,
          created_by (
            id,
            profile:users_profile (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KnowledgeArticle[];
    }
  });

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
        Failed to load articles: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <button className="px-4 py-2 bg-demon-red hover:bg-demon-red-dark rounded-lg flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Article</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search articles..."
          className="w-full bg-black/40 border border-demon-red/30 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-demon-red/50"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.map((article) => (
          <div
            key={article.id}
            className="bg-black/40 border border-demon-red/30 rounded-lg p-6 hover:border-demon-red/50 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {article.content}
            </p>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-demon-red/10 text-demon-red"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                By {article.created_by?.profile?.full_name}
              </span>
              <span>
                {new Date(article.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}