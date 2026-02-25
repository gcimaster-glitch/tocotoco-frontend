import React, { useState } from 'react';
import { ViewState, Job, AgentStrategy } from '../types';
import { PageHeader } from './PageHeader';
import { JobCard } from './JobCard';
import { Sparkles, Save, ArrowLeft, Plus, X, Image as ImageIcon, Loader2, RefreshCw, Lock, Zap, Target, Gem } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { HelpPopover } from './ui/HelpPopover';

interface EmployerJobCreateProps {
  setView: (view: ViewState) => void;
  onJobCreate?: (job: Job) => void;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Office
  'https://images.unsplash.com/photo-1593642632823-8f785667771b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Remote/Laptop
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Factory/Light work
  'https://images.unsplash.com/photo-1625246333195-58197bd47d26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Agriculture
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Diverse Meeting
];

export const EmployerJobCreate: React.FC<EmployerJobCreateProps> = ({ setView, onJobCreate }) => {
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    catchphrase: '',
    company: '株式会社未来サポート', 
    location: '',
    salary: '',
    type: 'Full-time',
    tags: [],
    celebrationMoney: 0,
    imageUrl: PRESET_IMAGES[0],
    startDate: 'Future',
    isClosed: false,
    description: '',
    requirements: '',
    analysisScore: 0,
  });

  const [agentStrategy, setAgentStrategy] = useState<AgentStrategy>({
    briefing: '',
    targetCompanies: '',
    feeBonus: '',
    speedCommitment: false
  });

  const [tagInput, setTagInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStrategyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAgentStrategy(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAdvice(null);

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setTimeout(() => {
        setFormData(prev => ({ ...prev, analysisScore: Math.floor(Math.random() * 20) + 80 }));
        setAiAdvice("「在宅ワーク」「通院配慮」といったキーワードが含まれており、求職者の検索意図と合致しています。業務内容の具体性をもう少し高めると、さらにマッチング精度が上がります。");
        setIsAnalyzing(false);
      }, 1500);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        あなたは障がい者雇用に特化した求人広告の専門家です。以下の求人情報を分析し、評価スコア（0-100）と改善アドバイスを出力してください。
        
        タイトル: ${formData.title}
        キャッチコピー: ${formData.catchphrase}
        給与: ${formData.salary}
        仕事内容: ${formData.description}
        
        出力フォーマット（JSON）:
        {
          "score": 85,
          "advice": "具体的なアドバイス..."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || "{}");
      setFormData(prev => ({ ...prev, analysisScore: result.score || 75 }));
      setAiAdvice(result.advice || "情報の充実度がやや不足しています。");
    } catch (e) {
      console.error(e);
      setAiAdvice("AI解析に失敗しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.salary) {
      alert("必須項目（タイトル、給与）を入力してください");
      return;
    }

    const newJob: Job = {
      id: `job_${Date.now()}`,
      ...formData as Job,
      analysisScore: formData.analysisScore || 0,
      agentStrategy: agentStrategy
    };

    if (onJobCreate) {
      onJobCreate(newJob);
    }
    
    alert("求人を保存しました！\n提携エージェントに通知が送信されます。");
    setView(ViewState.DASHBOARD);
  };

  return (
    <div className="w-full bg-[#FAFAF9] min-h-screen pb-20">
      <PageHeader 
        title="新規求人作成" 
        subtitle="AI解析を活用して、魅力的な求人票を作成しましょう"
        breadcrumbs={[{ label: '管理画面', view: ViewState.DASHBOARD }, { label: '求人作成' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- LEFT: FORM --- */}
          <div className="lg:w-2/3 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6 border-b border-stone-100 pb-2">基本情報</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">
                     求人タイトル <span className="text-red-500">*</span>
                     <HelpPopover content="求職者が最初に目にする項目です。職種名だけでなく、働き方の特徴（例：在宅OK、時短勤務）を含めるとクリック率が向上します。" />
                  </label>
                  <input 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    placeholder="例: 一般事務（障がい者枠）完全在宅"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">キャッチコピー</label>
                  <input 
                    name="catchphrase"
                    value={formData.catchphrase}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    placeholder="例: 通院配慮あり。あなたのペースで働ける環境です。"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">雇用形態</label>
                      <select 
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                      >
                        <option value="Full-time">正社員（障がい者枠）</option>
                        <option value="Contract">契約社員</option>
                        <option value="Part-time">パート・アルバイト</option>
                        <option value="A-Type">就労継続支援A型</option>
                        <option value="B-Type">就労継続支援B型</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">勤務地エリア</label>
                      <input 
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        placeholder="例: 東京都千代田区（在宅可）"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">給与表記 <span className="text-red-500">*</span></label>
                      <input 
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        placeholder="例: 月給 20万円〜"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">入社祝い金 (円)</label>
                      <input 
                        type="number"
                        name="celebrationMoney"
                        value={formData.celebrationMoney}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        placeholder="0"
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6 border-b border-stone-100 pb-2">詳細情報・条件</h3>
              
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-1">
                      タグ (検索用キーワード)
                      <HelpPopover content="求職者が検索する際や、本音フィルターでマッチングする際に使用されます。「在宅OK」「通院配慮」など特徴的なキーワードを追加してください。" />
                   </label>
                   <div className="flex gap-2 mb-2">
                      <input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        placeholder="タグを入力してEnter (例: 在宅OK, 時短勤務)"
                      />
                      <button onClick={handleAddTag} className="bg-stone-100 p-3 rounded-xl hover:bg-stone-200"><Plus size={20}/></button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {formData.tags?.map(tag => (
                        <span key={tag} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                           #{tag} <button onClick={() => removeTag(tag)}><X size={12}/></button>
                        </span>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-1">仕事内容</label>
                   <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none h-32 text-sm"
                      placeholder="具体的な業務内容を入力してください..."
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-1">応募要件</label>
                   <textarea 
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none h-24 text-sm"
                      placeholder="必須スキルや歓迎スキル、必要な障がい者手帳の有無など..."
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-2">カバー画像を選択</label>
                   <div className="grid grid-cols-5 gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                         <div 
                           key={i} 
                           onClick={() => setFormData(prev => ({...prev, imageUrl: img}))}
                           className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${formData.imageUrl === img ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                         >
                            <img src={img} className="w-full h-full object-cover" />
                         </div>
                      ))}
                   </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isClosed} 
                        onChange={(e) => setFormData(prev => ({...prev, isClosed: e.target.checked}))}
                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-1">
                         <span className="text-sm font-bold text-stone-700">非公開求人として保存 (スカウト専用)</span>
                         <HelpPopover content="求人一覧には表示されず、エージェント紹介やスカウト送信時のみ求職者に開示されます。配慮事項の調整が必要なポジションなどに適しています。" />
                      </div>
                   </label>
                </div>
              </div>
            </div>

            {/* --- AGENT STRATEGY SECTION --- */}
            <div className="bg-stone-900 text-white p-6 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none"></div>
               
               <div className="flex items-center gap-2 mb-6 relative z-10 border-b border-white/10 pb-3">
                  <Lock size={20} className="text-purple-400" />
                  <h3 className="font-bold text-lg">エージェント向け戦略設定 (非公開)</h3>
                  <span className="text-[10px] bg-purple-500/20 border border-purple-500/50 text-purple-300 px-2 py-0.5 rounded ml-2">強力なフック</span>
               </div>

               <div className="space-y-5 relative z-10">
                  <p className="text-xs text-stone-400">
                     この情報は一般には公開されず、提携エージェントにのみ開示されます。<br/>
                     「ぶっちゃけ」トークや特別条件を入力して、優先紹介を促しましょう。
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-stone-400 mb-1 flex items-center gap-1">
                           <Target size={12}/> ターゲット人物像 (裏要件)
                           <HelpPopover content="「精神障がいの方も歓迎」「在宅ワーク経験者」など、求人票には書きにくい具体的なターゲット像を入力してください。" />
                        </label>
                        <input 
                           name="targetCompanies"
                           value={agentStrategy.targetCompanies}
                           onChange={handleStrategyChange}
                           className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-purple-400 outline-none text-sm text-white placeholder-white/30"
                           placeholder="例: 在宅ワーク経験者、PCスキルが高い方"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-stone-400 mb-1 flex items-center gap-1">
                           <Gem size={12}/> 特別インセンティブ (上乗せ)
                           <HelpPopover content="エージェントに支払う紹介手数料への上乗せ条件です。「早期入社で+5%」など、優先度を上げてもらうための動機付けになります。" />
                        </label>
                        <input 
                           name="feeBonus"
                           value={agentStrategy.feeBonus}
                           onChange={handleStrategyChange}
                           className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-purple-400 outline-none text-sm text-white placeholder-white/30"
                           placeholder="例: 3ヶ月定着で+10%"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-stone-400 mb-1 flex items-center gap-1">
                        エージェントへのブリーフィング (本音コメント)
                        <HelpPopover content="採用の背景や緊急度、絶対に譲れないポイント、配慮可能な範囲などを、エージェントだけに伝えるメッセージです。" />
                     </label>
                     <textarea 
                        name="briefing"
                        value={agentStrategy.briefing}
                        onChange={handleStrategyChange}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-purple-400 outline-none h-24 text-sm text-white placeholder-white/30"
                        placeholder="例: 通院への配慮は柔軟に行います。週4日勤務からのスタートも相談可能です。"
                     />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/50 transition-colors">
                     <input 
                        type="checkbox" 
                        name="speedCommitment"
                        checked={agentStrategy.speedCommitment}
                        onChange={(e) => setAgentStrategy(prev => ({...prev, speedCommitment: e.target.checked}))}
                        className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 bg-stone-800 border-stone-600"
                     />
                     <div>
                        <div className="text-sm font-bold text-emerald-400 flex items-center gap-2"><Zap size={14} fill="currentColor"/> 24時間以内レスポンス確約</div>
                        <div className="text-[10px] text-emerald-200/70">エージェントに「即対応」をアピールし、優先度を上げてもらいます。</div>
                     </div>
                  </label>
               </div>
            </div>

          </div>

          {/* --- RIGHT: PREVIEW & AI --- */}
          <div className="lg:w-1/3 space-y-6">
             
             {/* AI Analysis Card */}
             <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                   <Sparkles className="text-yellow-400" /> AI求人解析
                </h3>
                
                <div className="flex items-end gap-2 mb-4 relative z-10">
                   <div className="text-5xl font-black">{formData.analysisScore || '-'}</div>
                   <div className="text-sm font-bold opacity-70 mb-2">/ 100点</div>
                </div>

                {aiAdvice && (
                   <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 text-xs leading-relaxed border border-white/10 relative z-10">
                      {aiAdvice}
                   </div>
                )}

                <button 
                   onClick={handleAnalyze}
                   disabled={isAnalyzing}
                   className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors relative z-10 disabled:opacity-70"
                >
                   {isAnalyzing ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                   {formData.analysisScore ? '再解析する' : 'AIでスコアを診断'}
                </button>
             </div>

             {/* Preview Card */}
             <div>
                <h3 className="font-bold text-stone-500 text-xs mb-3 uppercase tracking-wider">プレビュー</h3>
                <div className="pointer-events-none transform scale-95 origin-top">
                   <JobCard job={{...formData, id: 'preview'} as Job} onClick={() => {}} />
                </div>
             </div>

             {/* Actions */}
             <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm sticky top-24">
                <div className="flex flex-col gap-3">
                   <button onClick={handleSave} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 shadow-lg flex items-center justify-center gap-2">
                      <Save size={18} /> 求人を公開・保存
                   </button>
                   <button onClick={() => setView(ViewState.DASHBOARD)} className="w-full bg-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-200 flex items-center justify-center gap-2">
                      <ArrowLeft size={18} /> キャンセル
                   </button>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};