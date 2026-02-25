import React, { useState } from 'react';
import { ViewState, AgentProfile } from '../types';
import { PageHeader } from './PageHeader';
import { Star, Building2, CheckCircle2, Search, Filter, Briefcase, Zap, X, Trophy, MapPin, Users } from 'lucide-react';

const MOCK_AGENTS: AgentProfile[] = [
  {
    id: 'a1',
    agencyName: 'Inclusive Career',
    representative: '鈴木 一郎',
    specialtyTags: ['精神・発達障がい', '事務職', '定着支援'],
    feeRate: '35%',
    description: '精神・発達障がいのある方の事務職紹介に強みを持っています。入社後の定着支援専任スタッフが在籍しており、高い定着率を誇ります。',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    trackRecord: 150,
    retentionRate: '95%',
    strongArea: '関東'
  },
  {
    id: 'a2',
    agencyName: 'Work Partner',
    representative: '高橋 さくら',
    specialtyTags: ['身体障がい', '在宅ワーク', 'エンジニア'],
    feeRate: '30%',
    description: 'ITエンジニアやデザイナーなど、専門スキルを持つ身体障がい者の方の紹介に特化しています。完全在宅案件のマッチング実績多数。',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    trackRecord: 85,
    retentionRate: '92%',
    strongArea: '全国（リモート）'
  },
  {
    id: 'a3',
    agencyName: 'Challenge Support',
    representative: 'Mike Tanaka',
    specialtyTags: ['知的障がい', '軽作業', '実習対応'],
    feeRate: '25%',
    description: '知的障がいのある方の軽作業・清掃業務などのマッチングを得意としています。職場実習のコーディネートから丁寧にサポートします。',
    logoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    trackRecord: 200,
    retentionRate: '98%',
    strongArea: '東京都心'
  },
  {
    id: 'a4',
    agencyName: 'Future Link',
    representative: '佐藤 健',
    specialtyTags: ['特例子会社', '新卒・第二新卒', 'キャリアアップ'],
    feeRate: '35%',
    description: '特例子会社への紹介実績が豊富です。新卒や若手層のキャリア形成支援に力を入れており、長期的な育成を前提とした紹介を行います。',
    logoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    trackRecord: 120,
    retentionRate: '88%',
    strongArea: '東海・関西'
  }
];

interface EmployerAgentSearchProps {
  setView: (view: ViewState) => void;
}

export const EmployerAgentSearch: React.FC<EmployerAgentSearchProps> = ({ setView }) => {
  // partnership status: 'none', 'pending', 'active'
  const [partnerships, setPartnerships] = useState<Record<string, 'none' | 'pending' | 'active'>>({
    'a2': 'active' 
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

  const handleRequest = (agentId: string) => {
    setPartnerships(prev => ({ ...prev, [agentId]: 'pending' }));
    setSelectedAgent(null);
    alert('提携リクエストを送信しました。\nエージェントからの承認をお待ちください。');
  };

  const filteredAgents = MOCK_AGENTS.filter(agent => 
    agent.agencyName.includes(searchTerm) || 
    agent.specialtyTags.some(tag => tag.includes(searchTerm))
  );

  return (
    <div className="w-full bg-[#FAFAF9] min-h-screen pb-20">
      <PageHeader 
        title="エージェント検索・提携" 
        subtitle="貴社の採用要件にマッチするプロフェッショナルなエージェントを探せます"
        breadcrumbs={[{ label: '採用管理', view: ViewState.DASHBOARD }, { label: 'エージェントを探す' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 mb-8 flex gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="キーワード検索（例: 精神、在宅、エンジニア...）"
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
              />
           </div>
           <button className="bg-stone-100 text-stone-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-200">
              <Filter size={18} /> 条件絞り込み
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredAgents.map(agent => {
             const status = partnerships[agent.id] || 'none';
             return (
               <div key={agent.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full group cursor-pointer" onClick={() => setSelectedAgent(agent)}>
                  {/* Header Color Line */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-stone-200 to-stone-400 group-hover:from-emerald-400 group-hover:to-teal-500 transition-all"></div>
                  
                  <div className="p-6 flex flex-col flex-1">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden border border-stone-100 shrink-0">
                              <img src={agent.logoUrl} className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <h4 className="font-bold text-stone-900 leading-tight mb-1">{agent.agencyName}</h4>
                              <div className="flex items-center gap-2 text-xs text-stone-500">
                                 <div className="flex items-center gap-0.5 text-yellow-500 font-bold">
                                    <Star size={12} fill="currentColor"/> {agent.rating}
                                 </div>
                                 <span className="text-stone-300">|</span>
                                 <span>実績 {agent.trackRecord}件</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.specialtyTags.map(tag => (
                           <span key={tag} className="text-[10px] font-bold bg-stone-50 text-stone-600 px-2 py-1 rounded border border-stone-200 group-hover:border-emerald-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                              #{tag}
                           </span>
                        ))}
                     </div>

                     <p className="text-sm text-stone-600 leading-relaxed mb-6 line-clamp-3 flex-1">
                        {agent.description}
                     </p>

                     <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 mb-6">
                        <div className="flex justify-between items-center text-sm">
                           <span className="font-bold text-stone-500">手数料率（目安）</span>
                           <span className="font-black text-stone-800">{agent.feeRate}</span>
                        </div>
                     </div>

                     <div className="mt-auto">
                        {status === 'active' ? (
                           <button disabled className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                              <CheckCircle2 size={18} /> 提携済み
                           </button>
                        ) : status === 'pending' ? (
                           <button disabled className="w-full bg-stone-100 text-stone-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                              <Zap size={18} /> 申請中...
                           </button>
                        ) : (
                           <button 
                             onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); }}
                             className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                           >
                              詳細を見る
                           </button>
                        )}
                     </div>
                  </div>
               </div>
             );
           })}
        </div>

        {/* Agent Detail Modal */}
        {selectedAgent && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedAgent(null)} />
              <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 overflow-hidden">
                 <button onClick={() => setSelectedAgent(null)} className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-black/10 p-2 rounded-full transition-colors"><X size={20}/></button>
                 
                 {/* Header Image/Banner */}
                 <div className="h-32 bg-stone-900 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 </div>
                 
                 <div className="px-8 pb-8 pt-0 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-end -mt-10 mb-6">
                       <div className="flex items-end gap-4">
                          <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
                             <img src={selectedAgent.logoUrl} className="w-full h-full object-cover rounded-xl" />
                          </div>
                          <div className="mb-1">
                             <h2 className="text-2xl font-black text-stone-900">{selectedAgent.agencyName}</h2>
                             <p className="text-sm text-stone-500 font-bold">担当: {selectedAgent.representative}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-3xl font-black text-yellow-500 flex items-center gap-1 justify-end">
                             {selectedAgent.rating} <Star size={24} fill="currentColor"/>
                          </div>
                          <p className="text-xs text-stone-400 font-bold">エージェント評価</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                       <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-100">
                          <Trophy size={20} className="mx-auto text-emerald-500 mb-2"/>
                          <div className="text-2xl font-black text-stone-800">{selectedAgent.trackRecord}</div>
                          <div className="text-[10px] text-stone-400 font-bold">成約実績</div>
                       </div>
                       <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-100">
                          <Users size={20} className="mx-auto text-blue-500 mb-2"/>
                          <div className="text-2xl font-black text-stone-800">{selectedAgent.retentionRate}</div>
                          <div className="text-[10px] text-stone-400 font-bold">入社後定着率</div>
                       </div>
                       <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-100">
                          <MapPin size={20} className="mx-auto text-purple-500 mb-2"/>
                          <div className="text-sm font-bold text-stone-800 mt-1.5">{selectedAgent.strongArea}</div>
                          <div className="text-[10px] text-stone-400 font-bold mt-1">得意エリア</div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <h4 className="font-bold text-stone-800 mb-2 text-sm">紹介方針・強み</h4>
                          <p className="text-stone-600 text-sm leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
                             {selectedAgent.description}
                          </p>
                       </div>
                       
                       <div>
                          <h4 className="font-bold text-stone-800 mb-2 text-sm">得意分野タグ</h4>
                          <div className="flex flex-wrap gap-2">
                             {selectedAgent.specialtyTags.map(tag => (
                                <span key={tag} className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-bold text-stone-600 shadow-sm">
                                   {tag}
                                </span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-3">
                    <button onClick={() => setSelectedAgent(null)} className="flex-1 py-3 text-stone-500 font-bold text-sm hover:bg-stone-200 rounded-xl">閉じる</button>
                    {partnerships[selectedAgent.id] === 'active' ? (
                       <button disabled className="flex-1 py-3 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-xl border border-emerald-200">提携済み</button>
                    ) : partnerships[selectedAgent.id] === 'pending' ? (
                       <button disabled className="flex-1 py-3 bg-stone-200 text-stone-500 font-bold text-sm rounded-xl">申請中</button>
                    ) : (
                       <button onClick={() => handleRequest(selectedAgent.id)} className="flex-[2] py-3 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 shadow-lg flex items-center justify-center gap-2">
                          <Building2 size={16}/> 提携を申し込む
                       </button>
                    )}
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};