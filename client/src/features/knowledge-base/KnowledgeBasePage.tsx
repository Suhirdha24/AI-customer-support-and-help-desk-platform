import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { toast } from '../../store/useToastStore.js';
import { Modal } from '../../components/Modal.js';
import { SkeletonCard } from '../../components/SkeletonLoader.js';
import { EmptyState } from '../../components/EmptyState.js';
import { KnowledgeBaseArticle, Category } from '../../types/index.js';
import { Search, Plus, Tag, ArrowRight } from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);

  // Selected article for reading
  const [activeArticle, setActiveArticle] = useState<KnowledgeBaseArticle | null>(null);

  // Create article modal (for admins)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newTags, setNewTags] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiClient.get('/admin/categories').then((res) => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim()) {
        const res = await apiClient.get(`/knowledge-base/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.data.success) setArticles(res.data.data);
      } else {
        const url = selectedCategory
          ? `/knowledge-base?categoryId=${selectedCategory}`
          : '/knowledge-base';
        const res = await apiClient.get(url);
        if (res.data.success) setArticles(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchQuery]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newCategoryId) {
      toast.error('Please fill all required article fields');
      return;
    }

    try {
      setCreating(true);
      const res = await apiClient.post('/knowledge-base', {
        title: newTitle,
        content: newContent,
        categoryId: newCategoryId,
        tags: newTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: 'PUBLISHED',
      });

      if (res.data.success) {
        toast.success('Article published to Knowledge Base!');
        setShowCreateModal(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        fetchArticles();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create article');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Knowledge Base & Documentation
          </h2>
          <p className="text-sm text-slate-500">
            Self-service documentation, troubleshooting guides, and AI grounding source repository.
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Article</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation by keywords, error codes, tags..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              !selectedCategory
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Articles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Try broadening your search term or select another category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-subtle hover:shadow-card cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {article.categoryId?.name || 'Help'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                  {article.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {article.tags?.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Reader Modal */}
      <Modal
        isOpen={!!activeArticle}
        onClose={() => setActiveArticle(null)}
        title={activeArticle?.title || 'Article'}
        maxWidth="max-w-3xl"
      >
        {activeArticle && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">{activeArticle.categoryId?.name}</span>
              <span>•</span>
              <span>Published {new Date(activeArticle.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
              {activeArticle.content}
            </div>

            {activeArticle.tags && activeArticle.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {activeArticle.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Admin Create Article Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Publish Knowledge Base Article"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Troubleshooting Webhook 504 Timeouts"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Category *</label>
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Article Body *</label>
            <textarea
              rows={8}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write full resolution steps, root cause analysis, or reference guides..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 leading-relaxed font-normal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="webhook, timeout, api, troubleshooting"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {creating ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
