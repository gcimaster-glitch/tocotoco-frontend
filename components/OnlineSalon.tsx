import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, UserCircle, Search, Filter, Plus, X, Tag, Send, AlertTriangle } from 'lucide-react';
import { ViewState } from '../types';
import { PageHeader } from './PageHeader';

const MOCK_POSTS = [
  {
    id: 1,
    author: 'ペンタ (30代/精神)',
    category: '働き方の悩み',
    content: '在宅ワークで働いている方、休憩時間はどのように過ごしていますか？\n一人だと切り替えが難しくて、ついつい働きすぎてしまいます。おすすめのリフレッシュ方法があれば教えてください！',
    likes: 15,
    comments: 4,
    time: '2時間前',
    tags: ['在宅ワーク', 'リフレッシュ', '精神障がい']
  },
  {
    id: 2,
    author: 'さくら (20代/身体)',
    category: '就職活動',
    content: '【面接のコツ】\n今日、トコトコ経由で面接を受けてきました！\n配慮事項について聞かれた時、AI履歴書で作った文章をそのまま伝えたらスムーズでした。「具体的で分かりやすい」と言ってもらえて嬉しかったです。準備って大事ですね。',
    likes: 42,
    comments: 8,
    time: '5時間前',
    tags: ['面接対策', '成功体験']
  },
  {
    id: 3,
    author: 'みらい (40代/発達)',
    category: '職場定着',
    content: '聴覚過敏があるので、職場でノイズキャンセリングイヤホンの使用を許可してもらいました。\n最初は言い出しにくかったけど、上司に相談したら「生産性が上がるならOK」と言ってもらえました。同じ悩みを持つ方、まずは相談してみるのが良いかもです。',
    likes: 38,
    comments: 12,
    time: '1日前',
    tags: ['合理的配慮', '聴覚過敏', '発達障がい']
  }
];

const CATEGORIES = ['働き方の悩み', '就職活動', '職場定着', '雑談・交流', 'スキルアップ', '支援機関'];

interface OnlineSalonProps {
  setView: (view: ViewState) => void;
}

export const OnlineSalon: React.FC<OnlineSalonProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState(MOCK_POSTS);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState(CATEGORIES[0]);
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [displayName, setDisplayName] = useState('匿名さん'); // Display Name input

  const handleAddTag = () => {
    if (tagInput.trim() && !newPostTags.includes(tagInput.trim())) {
      setNewPostTags([...newPostTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewPostTags(newPostTags.filter(t => t !== tag));
  };

  const handleSubmitPost = () => {
    if (!newPostContent.trim()) return;

    const newPost = {
        id: Date.now(),
        author: displayName || '匿名ユーザー',
        category: newPostCategory,
        content: newPostContent,
        likes: 0,
        comments: 0,
        time: 'たった今',
        tags: newPostTags.length > 0 ? newPostTags : ['New']
    };
    
    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
    setNewPostContent('');
    setNewPostTags([]);
    alert("コミュニティに投稿しました！");
  };

  return (
    <div className="w-full">
      <PageHeader 
        title="Tocotoco Community" 
        subtitle="同じ悩みを持つ仲間とつながる、安心・安全な匿名コミュニティ"
        breadcrumbs={[{ label: 'サロン' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-12">
        
        {/* Guideline Banner */}
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-8 flex items-start gap-3">
           <AlertTriangle size={20} className="text-emerald-600 mt-0.5 shrink-0" />
           <div className="text-sm text-emerald-800">
              <p className="font-bold mb-1">安心してご利用いただくために</p>
              <p>このサロンは、障がいのある当事者の方々が安心して交流できる場です。本名は使用せず、必ず「表示名（ニックネーム）」で投稿してください。誹謗中傷や個人情報の特定につながる書き込みは禁止されています。</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
             <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
             >
               <Plus size={18} /> 新規投稿を作成
             </button>

             <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
               <h3 className="font-bold text-stone-700 mb-3 text-sm flex items-center gap-2"><Filter size={14}/> カテゴリ</h3>
               <ul className="space-y-1 text-sm font-medium text-stone-600">
                 <li 
                   onClick={() => setActiveTab('all')}
                   className={`p-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'all' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50'}`}
                 >
                   # すべて
                 </li>
                 {CATEGORIES.map(cat => (
                   <li 
                     key={cat}
                     onClick={() => setActiveTab(cat)}
                     className={`p-2 rounded-lg cursor-pointer transition-colors ${activeTab === cat ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-stone-50'}`}
                   >
                     # {cat}
                   </li>
                 ))}
               </ul>
             </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
             
             {/* Search Bar */}
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
               <input 
                 type="text" 
                 placeholder="キーワード検索（例：在宅、面接、配慮...）" 
                 className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
               />
             </div>

             {/* Posts */}
             {posts.filter(p => activeTab === 'all' || p.category === activeTab).map(post => (
               <div key={post.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-sm">
                        {post.author.charAt(0)}
                     </div>
                     <div>
                       <div className="font-bold text-stone-800 text-sm">{post.author}</div>
                       <div className="text-xs text-stone-400">{post.time}</div>
                     </div>
                   </div>
                   <button className="text-stone-300 hover:text-stone-600"><MoreHorizontal size={20} /></button>
                 </div>

                 <div className="mb-4">
                   <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded mb-2">
                     {post.category}
                   </span>
                   <p className="text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                     {post.content}
                   </p>
                 </div>

                 <div className="flex items-center gap-2 mb-4">
                   {post.tags.map(tag => (
                     <span key={tag} className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">#{tag}</span>
                   ))}
                 </div>

                 <div className="flex items-center gap-6 pt-4 border-t border-stone-100 text-stone-500 text-sm">
                   <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
                     <Heart size={18} /> {post.likes}
                   </button>
                   <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                     <MessageSquare size={18} /> {post.comments} コメント
                   </button>
                   <button className="flex items-center gap-1.5 hover:text-stone-800 transition-colors ml-auto">
                     <Share2 size={18} />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* --- CREATE POST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 z-10 flex flex-col max-h-[90vh]">
             
             <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-2">
                <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                   <MessageSquare className="text-emerald-500" size={20} /> 新規投稿を作成
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-stone-100 p-1.5 rounded-full hover:bg-stone-200"><X size={16}/></button>
             </div>

             <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Display Name Input */}
                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-2">表示名（ニックネーム）</label>
                   <input 
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="例：はなこ (20代/事務職)"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                   />
                   <p className="text-[10px] text-stone-400 mt-1">※本名は入力しないでください。</p>
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-2">カテゴリ</label>
                   <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setNewPostCategory(cat)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newPostCategory === cat ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                         >
                            {cat}
                         </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-2">本文</label>
                   <textarea 
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl h-40 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm placeholder-stone-400"
                      placeholder="相談したいことや共有したい体験を書きましょう..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-2">タグ (任意)</label>
                   <div className="flex gap-2 mb-2">
                      <input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none"
                        placeholder="タグ入力してEnter"
                      />
                      <button onClick={handleAddTag} className="bg-stone-100 px-3 rounded-lg hover:bg-stone-200"><Plus size={18}/></button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {newPostTags.map(tag => (
                         <span key={tag} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-emerald-100">
                            #{tag} <button onClick={() => removeTag(tag)} className="hover:text-emerald-900"><X size={12}/></button>
                         </span>
                      ))}
                   </div>
                </div>
             </div>

             <div className="pt-6 mt-2 border-t border-stone-100 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-stone-500 font-bold text-sm hover:bg-stone-100 rounded-xl">キャンセル</button>
                <button 
                  onClick={handleSubmitPost} 
                  disabled={!newPostContent.trim() || !displayName.trim()}
                  className="px-8 py-2.5 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                >
                   <Send size={16} /> 投稿する
                </button>
             </div>

          </div>
        </div>
      )}
    </div>
  );
};