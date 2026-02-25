import React, { useState } from 'react';
import { Job, ViewState } from '../types';
import { JobCard } from '../components/JobCard';
import { Search, MapPin, SlidersHorizontal, X, Check, Building2, JapaneseYen, Clock, Briefcase, Star, Send, Sparkles, Mic, Zap, Filter, FileText, BrainCircuit, HeartHandshake } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

// --- EXPANDED MOCK DATA ---
const ALL_JOBS: Job[] = [
  {
    id: '1',
    catchphrase: '【完全在宅】自分のペースで働けるデータ入力・事務。通院配慮あり。',
    title: '一般事務（オープンポジション）',
    company: '株式会社トコトコ・テック',
    location: '全国（フルリモート）',
    salary: '月給 200,000円〜',
    type: 'Full-time',
    tags: ['完全在宅', '通院配慮', '精神障がい者活躍中', 'チャット中心'],
    celebrationMoney: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Immediate'
  },
  {
    id: '2',
    catchphrase: '【特例子会社】バリアフリー完備。安定した環境で長く働きたい方へ。',
    title: '総務アシスタント・軽作業',
    company: '未来サポート株式会社',
    location: '東京都品川区',
    salary: '月給 180,000円〜',
    type: 'Full-time',
    tags: ['バリアフリー', '定着率95%', '身体障がい者活躍中', '休憩室あり'],
    celebrationMoney: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Future'
  },
  {
    id: '3',
    catchphrase: '【非公開求人】ITスキルを活かす。発達障がいのあるエンジニア募集。',
    title: 'システムエンジニア・プログラマー',
    company: '非公開（大手IT企業）',
    location: '東京都渋谷区（ハイブリッド）',
    salary: '年収 400万〜600万円',
    type: 'Agent',
    tags: ['特性配慮あり', 'フレックス', 'イヤホンOK', '静かな環境'],
    isClosed: true,
    celebrationMoney: 100000,
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAgent: true
  },
  {
    id: '4',
    catchphrase: '【A型事業所】Webデザイン・動画編集。スキルを身につけて一般就労へ。',
    title: 'クリエイティブスタッフ',
    company: 'クリエイト・ラボ',
    location: '大阪府大阪市',
    salary: '時給 1,100円〜',
    type: 'A-Type',
    tags: ['未経験歓迎', '福祉就労', '支援員常駐', 'PC貸与'],
    celebrationMoney: 10000,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Immediate'
  },
  {
    id: '5',
    catchphrase: '【週20h未満】農園での野菜作り。自然の中で心身の健康を大切に。',
    title: '農園スタッフ',
    company: 'グリーンファーム・プロジェクト',
    location: '埼玉県さいたま市',
    salary: '時給 1,050円〜',
    type: 'Part-time',
    tags: ['屋外作業', '知的障がい者活躍中', '送迎バスあり', 'マイペース'],
    celebrationMoney: 0,
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Future'
  },
  {
    id: '6',
    catchphrase: '【時短正社員】経理・労務経験者募集。キャリアを諦めない働き方。',
    title: '管理部門スタッフ',
    company: '株式会社ネクストステージ',
    location: '神奈川県横浜市',
    salary: '月給 220,000円〜',
    type: 'Full-time',
    tags: ['時短勤務', '経験者優遇', '産業医連携'],
    celebrationMoney: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Immediate'
  },
];

const EMPLOYMENT_TYPES = [
  { id: 'Full-time', label: '正社員（障がい者枠）' },
  { id: 'Contract', label: '契約社員' },
  { id: 'Part-time', label: 'パート・アルバイト' },
  { id: 'A-Type', label: '就労継続支援A型' },
  { id: 'B-Type', label: '就労継続支援B型' },
  { id: 'Agent', label: 'エージェント紹介' },
  { id: 'Transition', label: '就労移行支援' },
];

interface JobSearchProps {
  setView?: (view: ViewState) => void;
  onJobSelect?: (job: Job) => void;
}

export const JobSearch: React.FC<JobSearchProps> = ({ setView, onJobSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  
  const [sendResume, setSendResume] = useState(true);
  const [sendPersonality, setSendPersonality] = useState(true);
  const [sendAptitude, setSendAptitude] = useState(true);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const filteredJobs = ALL_JOBS.filter(job => {
    const matchesSearch = job.title.includes(searchTerm) || job.company.includes(searchTerm) || job.location.includes(searchTerm) || job.tags.some(t => t.includes(searchTerm));
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
    return matchesSearch && matchesType;
  });

  const handleApply = () => {
    setIsApplied(true);
    setTimeout(() => {
      setSelectedJob(null);
      setIsApplied(false);
    }, 2000);
  };

  const handleStartInterview = () => {
    if (onJobSelect && selectedJob) {
      onJobSelect(selectedJob);
    }
    if (setView) {
      setView(ViewState.INTERVIEW_PRACTICE);
    }
  };

  return (
    <div className="w-full">
      <PageHeader 
        title="求人検索" 
        subtitle="あなたの「働きたい」を叶える場所を探しましょう"
        breadcrumbs={[{ label: '求人検索' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* --- HEADER & SEARCH --- */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="text" 
                placeholder="キーワード（在宅、データ入力、週3日など）" 
                className="w-full pl-12 pr-4 py-3 bg-white text-stone-900 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64 relative">
               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
               <input 
                type="text" 
                placeholder="勤務地" 
                className="w-full pl-12 pr-4 py-3 bg-white text-stone-900 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-stone-400"
              />
            </div>
            <button className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-md">
              検索
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR FILTERS --- */}
          <div className="lg:w-72 flex-shrink-0 space-y-8">
            <div>
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={16} /> 雇用・就労形態
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {EMPLOYMENT_TYPES.map((type) => {
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleType(type.id)}
                      className={`
                        px-4 py-3 rounded-lg text-xs font-bold border transition-all duration-200 relative overflow-hidden group text-left flex items-center
                        ${isSelected 
                          ? 'bg-stone-800 border-stone-800 text-white shadow-md' 
                          : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'}
                      `}
                    >
                      <span className="relative z-10 leading-tight flex-1">{type.label}</span>
                      {isSelected && <Check size={14} className="text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

             <div>
               <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Filter size={16} /> 特徴・配慮事項
              </h3>
              <div className="flex flex-wrap gap-2">
                 {['在宅OK', '時短勤務', '通院配慮', '車椅子OK', '未経験歓迎', '定着支援あり', '静かな環境', '筆談対応'].map(tag => (
                   <span key={tag} className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-500 hover:border-stone-400 cursor-pointer transition-colors">
                     {tag}
                   </span>
                 ))}
              </div>
            </div>
          </div>

          {/* --- RESULTS GRID --- */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-stone-700">検索結果: <span className="text-stone-900 text-xl">{filteredJobs.length}</span> 件</h2>
              <select className="bg-white border border-stone-200 text-stone-600 text-sm font-bold rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-stone-50">
                <option>おすすめ順</option>
                <option>新着順</option>
                <option>給与が高い順</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <p className="text-stone-400 font-bold">条件に一致する求人が見つかりませんでした。</p>
              </div>
            )}
          </div>
        </div>

        {/* --- JOB DETAIL MODAL --- */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedJob(null)} />
            
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300">
               <button 
                 onClick={() => setSelectedJob(null)}
                 className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 text-white transition-colors"
               >
                 <X size={24} />
               </button>

               {/* Image Side */}
               <div className="md:w-2/5 h-64 md:h-auto relative">
                 <img src={selectedJob.imageUrl} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex flex-col justify-end p-8 text-white">
                   <div className="flex items-center gap-2 mb-2">
                     <Building2 size={16} className="text-emerald-400" />
                     <span className="font-bold">{selectedJob.company}</span>
                   </div>
                   <h2 className="text-2xl font-bold leading-tight mb-4">{selectedJob.title}</h2>
                   <div className="flex flex-wrap gap-2">
                     {selectedJob.tags.map(tag => (
                       <span key={tag} className="text-[10px] bg-white/20 backdrop-blur border border-white/30 px-2 py-1 rounded">#{tag}</span>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Content Side */}
               <div className="md:w-3/5 p-8 overflow-y-auto bg-white flex flex-col">
                 <div className="flex-1">
                   <div className="flex items-start justify-between mb-6">
                     <div>
                        <p className="text-emerald-600 font-bold text-sm mb-1">募集要項</p>
                        <h3 className="text-xl font-bold text-stone-900">{selectedJob.catchphrase}</h3>
                     </div>
                     {selectedJob.celebrationMoney > 0 && (
                       <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex flex-col items-center border border-emerald-100 shrink-0 ml-4">
                         <Star size={14} className="mb-1" fill="currentColor" />
                         祝い金
                         <span>{selectedJob.celebrationMoney.toLocaleString()}円</span>
                       </div>
                     )}
                   </div>

                   {/* --- AI MATCH ANALYSIS --- */}
                   <div className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2 text-emerald-700 font-bold">
                              <Sparkles size={18} />
                              AIマッチング分析
                           </div>
                           <div className="text-2xl font-black text-emerald-800">88<span className="text-sm font-medium">%</span></div>
                        </div>
                        <div className="w-full bg-white/50 h-2 rounded-full mb-3 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <p className="text-xs text-emerald-800/80 leading-relaxed font-medium">
                          あなたの希望する「通院配慮」と「静かな環境」という条件が、この企業の職場環境と合致します。また、事務経験も評価されるでしょう。
                        </p>
                      </div>
                   </div>

                   <div className="space-y-6 mb-8">
                     <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                         <MapPin size={20} className="text-stone-500" />
                       </div>
                       <div>
                         <div className="text-xs font-bold text-stone-400">勤務地</div>
                         <div className="font-bold text-stone-800">{selectedJob.location}</div>
                       </div>
                     </div>
                     
                     <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                         <JapaneseYen size={20} className="text-stone-500" />
                       </div>
                       <div>
                         <div className="text-xs font-bold text-stone-400">給与</div>
                         <div className="font-bold text-stone-800 text-lg">{selectedJob.salary}</div>
                       </div>
                     </div>

                     <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                         <Clock size={20} className="text-stone-500" />
                       </div>
                       <div>
                         <div className="text-xs font-bold text-stone-400">勤務時間</div>
                         <div className="font-bold text-stone-800">9:30 - 16:30 (休憩1h / 通院日は調整可)</div>
                       </div>
                     </div>
                   </div>

                   <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8">
                     <h4 className="font-bold text-stone-800 mb-2">求人詳細・配慮事項</h4>
                     <p className="text-sm text-stone-600 leading-relaxed">
                       バックオフィス業務全般をお任せします。完全在宅勤務が可能で、チャットツールを用いたコミュニケーションが中心です。<br/>
                       産業医との定期面談や、ジョブコーチによる定着支援も利用可能です。
                     </p>
                   </div>
                 </div>

                 <div className="pt-6 border-t border-stone-100 space-y-3">
                   {!isApplied ? (
                     <>
                       {/* --- Application Options --- */}
                       <div className="bg-blue-50/50 p-4 rounded-xl mb-2 border border-blue-100">
                          <p className="text-xs font-bold text-stone-500 mb-3">提出書類を選択してください</p>
                          <div className="space-y-2">
                             <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={sendResume} 
                                  onChange={(e) => setSendResume(e.target.checked)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
                                   <FileText size={16} className="text-stone-400" />
                                   AI履歴書 (配慮事項含む)
                                   <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 rounded">推奨</span>
                                </div>
                             </label>
                             
                             <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={sendPersonality} 
                                  onChange={(e) => setSendPersonality(e.target.checked)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
                                   <BrainCircuit size={16} className="text-indigo-400" />
                                   AI適性診断結果
                                </div>
                             </label>
                          </div>
                       </div>

                       <button 
                         onClick={handleApply}
                         className="w-full bg-white border-2 border-stone-200 text-stone-600 py-3 rounded-xl font-bold text-lg hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                       >
                         通常応募する
                       </button>
                       {setView && (
                         <button 
                           onClick={handleStartInterview}
                           className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.01] transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden group"
                         >
                           <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                           <Mic size={20} />
                           AI一次面接を受けて応募する
                           <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-black ml-1 flex items-center gap-0.5">
                             <Zap size={10} fill="currentColor" /> 選考優遇
                           </span>
                         </button>
                       )}
                     </>
                   ) : (
                     <button disabled className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-inner flex items-center justify-center gap-2 cursor-default">
                       <Check size={24} className="animate-bounce" /> 応募が完了しました！
                     </button>
                   )}
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};