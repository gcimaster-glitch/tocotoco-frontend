import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Heart, Plus, ChevronRight, Tag, User, Clock, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';

interface Post {
  id: string;
  user_id: string;
  author_name: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  comment_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const CATEGORIES = [
  { id: '', label: 'すべて' },
  { id: 'experience', label: '就職体験談' },
  { id: 'advice', label: 'アドバイス' },
  { id: 'question', label: '質問・相談' },
  { id: 'news', label: 'ニュース・情報' },
];

const CATEGORY_COLORS: Record<string, string> = {
  experience: 'bg-emerald-100 text-emerald-700',
  advice: 'bg-blue-100 text-blue-700',
  question: 'bg-amber-100 text-amber-700',
  news: 'bg-purple-100 text-purple-700',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
};

interface CommunityProps {
  setView?: (view: string) => void;
}

export const Community: React.FC<CommunityProps> = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'experience' });
  const [postLoading, setPostLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      const res = await fetch(`${API_BASE_URL}/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openPost = async (post: Post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLikedPosts(prev => {
        const next = new Set(prev);
        if (data.liked) next.add(postId); else next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + (data.liked ? 1 : -1) } : p));
    } catch { /* ignore */ }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedPost || !token) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        setCommentText('');
        const res2 = await fetch(`${API_BASE_URL}/api/posts/${selectedPost.id}`);
        const data = await res2.json();
        setComments(data.comments || []);
      }
    } catch { /* ignore */ }
    setCommentLoading(false);
  };

  const handleNewPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !token) return;
    setPostLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        setShowNewPost(false);
        setNewPost({ title: '', content: '', category: 'experience' });
        fetchPosts();
      }
    } catch { /* ignore */ }
    setPostLoading(false);
  };

  if (selectedPost) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6 transition-colors">
          <ArrowLeft size={18} /> 一覧に戻る
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${CATEGORY_COLORS[selectedPost.category] || 'bg-stone-100 text-stone-600'}`}>
            {CATEGORIES.find(c => c.id === selectedPost.category)?.label || selectedPost.category}
          </span>
          <h1 className="text-2xl font-bold text-stone-900 mt-3 mb-4">{selectedPost.title}</h1>
          <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
            <span className="flex items-center gap-1"><User size={14} />{selectedPost.author_name}</span>
            <span className="flex items-center gap-1"><Clock size={14} />{formatDate(selectedPost.created_at)}</span>
            <span className="flex items-center gap-1"><Heart size={14} />{selectedPost.likes}</span>
          </div>
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> コメント（{comments.length}件）
          </h2>
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-4">まだコメントはありません。最初のコメントを投稿しましょう！</p>
            ) : comments.map(c => (
              <div key={c.id} className="bg-stone-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {c.author_name?.[0] || 'U'}
                  </div>
                  <span className="font-medium text-stone-700 text-sm">{c.author_name}</span>
                  <span className="text-stone-400 text-xs ml-auto">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
          {token ? (
            <div className="flex gap-2">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="コメントを入力..."
                rows={2}
                className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                onClick={handleComment}
                disabled={commentLoading || !commentText.trim()}
                className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {commentLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          ) : (
            <p className="text-stone-400 text-sm text-center">コメントするにはログインが必要です</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title="コミュニティ"
        subtitle="障がいをもつ方々の就職体験談・情報共有の場"
        breadcrumbs={[{ label: 'コミュニティ' }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* カテゴリフィルター */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
          {token && (
            <button
              onClick={() => setShowNewPost(true)}
              className="ml-auto flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              <Plus size={16} /> 投稿する
            </button>
          )}
        </div>

        {/* 新規投稿フォーム */}
        {showNewPost && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 mb-6">
            <h3 className="font-bold text-stone-800 mb-4">新しい投稿</h3>
            <div className="space-y-3">
              <select
                value={newPost.category}
                onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {CATEGORIES.filter(c => c.id).map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="タイトル"
                value={newPost.title}
                onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <textarea
                placeholder="本文を入力してください..."
                value={newPost.content}
                onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                rows={5}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNewPost(false)} className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm">キャンセル</button>
                <button
                  onClick={handleNewPost}
                  disabled={postLoading || !newPost.title.trim() || !newPost.content.trim()}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {postLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  投稿する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 投稿一覧 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p>まだ投稿がありません</p>
            {token && <p className="text-sm mt-1">最初の投稿者になりましょう！</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => openPost(post)}
                className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-stone-100 text-stone-600'}`}>
                        <Tag size={10} className="inline mr-1" />
                        {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-800 text-base leading-snug mb-1 truncate">{post.title}</h3>
                    <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">{post.content}</p>
                  </div>
                  <ChevronRight size={18} className="text-stone-300 flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1"><User size={12} />{post.author_name}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{formatDate(post.created_at)}</span>
                  <button
                    onClick={e => handleLike(post.id, e)}
                    className={`flex items-center gap-1 transition-colors ${likedPosts.has(post.id) ? 'text-rose-500' : 'hover:text-rose-400'}`}
                  >
                    <Heart size={12} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                    {post.likes}
                  </button>
                  <span className="flex items-center gap-1"><MessageSquare size={12} />{post.comment_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
