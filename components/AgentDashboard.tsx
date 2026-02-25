import React, { useState } from 'react';
import { UserCheck, MessageCircle, Send, Calendar, CheckCircle2, Briefcase, Search, Video, JapaneseYen, Plus, Users, Bell, AlertTriangle, X, Eye, FileText, UserPlus, Shield, Lock, Building2, Check, ExternalLink, List, ThumbsDown, ArrowRight } from 'lucide-react';
import { Job, ChatMessage, ViewState } from '../types';
import { PageHeader } from './PageHeader';

// Mock Data
const MOCK_CANDIDATES = [
  { id: '1', name: '佐藤 健太', status: 'approved', lastMsg: 'ありがとうございます。検討します。', time: '10分前', unread: 2, avatar: 'S', agents: 1 },
  { id: '2', name: '田中 浩二', status: 'approved', lastMsg: '平日の19時以降なら可能です。', time: '2時間前', unread: 0, avatar: 'T', agents: 2 },
  { id: '3', name: '高橋 優子', status: 'pending', lastMsg: '（承認待ち）', time: '1日前', unread: 0, avatar: 'Y', agents: 0 },
];

const MOCK_SCOUT_LIST = [
  { id: 's1', name: 'M.K 様', age: '28歳', role: '一般事務', experience: '5年', tags: ['PCスキル', '簿記2級'], match: 95, agents: 1 },
  { id: 's2', name: 'Y.I 様', age: '35歳', role: 'エンジニア', experience: '10年', tags: ['Java', 'リモート希望'], match: 88, agents: 2 },
  { id: 's3', name: 'S.O 様', age: '24歳', role: '軽作業', experience: '3年', tags: ['コツコツ作業', '体力自信あり'], match: 82, agents: 0 },
  { id: 's4', name: 'K.T 様', age: '31歳', role: 'Webデザイナー', experience: '7年', tags: ['Photoshop', '在宅OK'], match: 91, agents: 1 },
];

const MOCK_PARTNERSHIP_REQUESTS = [
  { id: 'p1', company: '株式会社未来サポート', requestDate: '2024.05.25', status: 'pending', message: '精神障がい者の事務職採用を強化しており、貴社の実績を拝見しご連絡いたしました。' },
  { id: 'p2', company: 'テックソリューションズ', requestDate: '2024.05.20', status: 'active', message: '' },
  { id: 'p3', company: 'グリーンファーム', requestDate: '2024.05.24', status: 'pending', message: '農園スタッフの紹介も可能でしょうか？一度お話しできれば幸いです。' }
];

const MOCK_SENT_PROPOSALS = [
  { id: 'pr1', candidateName: '佐藤 健太', targetCompany: '未来サポート', sentDate: '2024.05.26', status: 'accepted', feedback: null, memo: '事務リーダー候補として推薦' },
  { id: 'pr2', candidateName: '高橋 優子', targetCompany: 'テックソリューションズ', sentDate: '2024.05.25', status: 'rejected', feedback: 'フルリモート案件は現在募集停止中のため', memo: 'PCスキルアピール' },
  { id: 'pr3', candidateName: '田中 浩二', targetCompany: 'グリーンファーム', sentDate: '2024.05.27', status: 'review', feedback: null, memo: '屋外作業適性あり' },
];

const MOCK_EXCLUSIVE_JOBS: Job[] = [
  {
    id: 'e1',
    catchphrase: '【非公開】大手IT企業 特例子会社 管理職候補',
    title: '特例子会社 管理者 (Manager)',
    company: '株式会社Global Tech',
    location: '東京都港区',
    salary: '年収 600万円〜',
    type: 'Agent',
    tags: ['非公開求人', 'マネジメント'],
    celebrationMoney: 100000,
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
    isAgent: true
  }
];

const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'c1', sender: 'agent', text: '佐藤様、担当の鈴木です。ご経歴を拝見し、ぜひ非公開求人をご紹介させてください。', timestamp: '昨日 10:00' },
    { id: 'c2', sender: 'user', text: 'よろしくお願いします。', timestamp: '昨日 12:30' },
  ]
};

interface AgentDashboardProps {
  setView: (view: ViewState) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates' | 'scout' | 'partners' | 'proposals'>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [showJobSelector, setShowJobSelector] = useState(false);
  
  // Local state
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [partners, setPartners] = useState(MOCK_PARTNERSHIP_REQUESTS);
  const [sentProposals, setSentProposals] = useState(MOCK_SENT_PROPOSALS);

  // Proposal Modal State
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [newProposal, setNewProposal] = useState({ candidateId: '', companyId: '', comment: '', salary: '' });

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
  const currentMessages = selectedCandidateId ? (chats[selectedCandidateId] || []) : [];

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedCandidateId) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      sender: 'agent',
      text: chatInput,
      timestamp: 'たった今'
    };
    setChats(prev => ({
      ...prev,
      [selectedCandidateId]: [...(prev[selectedCandidateId] || []), newMsg]
    }));
    setChatInput('');
  };

  const handleApprove = (id: string) => {
    alert(`担当申請を送信しました。求職者(${id})の承認を待っています...`);
    setTimeout(() => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'approved', agents: c.agents + 1 } : c));
        alert("求職者が担当申請を承認しました！チャットが可能になりました。");
    }, 1500);
  };

  const handleScout = (id: string) => {
      alert(`スカウトを送信しました。承認されると担当リストに追加されます。`);
      const scoutedUser = MOCK_SCOUT_LIST.find(s => s.id === id);
      if(scoutedUser) {
          const newCandidate = {
              id: scoutedUser.id,
              name: scoutedUser.name.replace(' 様', ''),
              status: 'pending',
              lastMsg: '（スカウト送信済み・承認待ち）',
              time: 'たった今',
              unread: 0,
              avatar: scoutedUser.name.charAt(0),
              agents: scoutedUser.agents
          };
          if(!candidates.find(c => c.id === newCandidate.id)) {
              setCandidates(prev => [newCandidate, ...prev]);
          }
          setActiveTab('candidates');
      }
  };

  const handlePartnerAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      setPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
      alert('提携申請を承認しました。\n今後、この企業へ候補者を紹介できます。');
    } else {
      setPartners(prev => prev.filter(p => p.id !== id));
      alert('提携申請を却下しました。');
    }
  };

  const handleSubmitProposal = () => {
    if (!newProposal.candidateId || !newProposal.companyId) {
      alert('候補者と提出先企業を選択してください');
      return;
    }
    const candidate = candidates.find(c => c.id === newProposal.candidateId);
    const company = partners.find(p => p.company === newProposal.companyId); // Mock mapping using name as ID for demo
    
    const newEntry = {
      id: `pr_${Date.now()}`,
      candidateName: candidate?.name || 'Unknown',
      targetCompany: newProposal.companyId,
      sentDate: new Date().toLocaleDateString(),
      status: 'review',
      feedback: null,
      memo: newProposal.comment
    };
    
    setSentProposals([newEntry, ...sentProposals]);
    setShowProposalModal(false);
    setNewProposal({ candidateId: '', companyId: '', comment: '', salary: '' });
    alert('企業へ「ブラインド提案」を送信しました。\nまずは匿名情報として企業に届きます。');
  };

  // --- SUB-COMPONENTS ---

  const DashboardHome = () => (
    <div className="space-y-6 animate-in fade-in">
       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MessageCircle size={20}/></div>
                <span className="text-xs font-bold text-stone-400">今週の対応</span>
             </div>
             <div className="text-2xl font-black text-stone-800">24<span className="text-sm font-medium text-stone-400 ml-1">件</span></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck size={20}/></div>
                <span className="text-xs font-bold text-stone-400">担当中</span>
             </div>
             <div className="text-2xl font-black text-stone-800">{candidates.filter(c => c.status === 'approved').length}<span className="text-sm font-medium text-stone-400 ml-1">名</span></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Send size={20}/></div>
                <span className="text-xs font-bold text-stone-400">提案中</span>
             </div>
             <div className="text-2xl font-black text-stone-800">{sentProposals.filter(p => p.status === 'review').length}<span className="text-sm font-medium text-stone-400 ml-1">件</span></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20}/></div>
                <span className="text-xs font-bold text-stone-400">NG/見送り</span>
             </div>
             <div className="text-2xl font-black text-stone-800 text-red-600">{sentProposals.filter(p => p.status === 'rejected').length}<span className="text-sm font-medium text-stone-400 ml-1">件</span></div>
          </div>
       </div>

       {/* Notifications */}
       <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Bell size={18}/> お知らせ・タスク</h3>
          <div className="space-y-3">
             {sentProposals.some(p => p.status === 'rejected') && (
               <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <ThumbsDown size={18} className="text-red-600 shrink-0 mt-0.5"/>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-red-900">提案が見送られました ({sentProposals.filter(p => p.status === 'rejected').length}件)</p>
                     <p className="text-xs text-red-700 mt-1">企業のフィードバックを確認し、次の提案に活かしましょう。</p>
                     <button onClick={() => setActiveTab('proposals')} className="mt-2 text-xs bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50">フィードバックを見る</button>
                  </div>
               </div>
             )}
             {partners.some(p => p.status === 'pending') && (
               <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <Building2 size={18} className="text-purple-600 shrink-0 mt-0.5"/>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-purple-900">企業からの提携リクエストが届いています ({partners.filter(p => p.status === 'pending').length}件)</p>
                     <button onClick={() => setActiveTab('partners')} className="mt-2 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-500">確認する</button>
                  </div>
               </div>
             )}
          </div>
       </div>
    </div>
  );

  const ProposalsManager = () => (
    <div className="animate-in fade-in h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg flex items-center gap-2"><Send size={20}/> 提案管理 (ブラインド審査状況)</h2>
          <button 
            onClick={() => setShowProposalModal(true)}
            className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-stone-800 shadow-lg flex items-center gap-2"
          >
             <Plus size={16}/> 新規提案を作成
          </button>
       </div>

       <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                   <tr>
                      <th className="p-4">候補者</th>
                      <th className="p-4">提案先企業</th>
                      <th className="p-4">提案日</th>
                      <th className="p-4">ステータス</th>
                      <th className="p-4">フィードバック / メモ</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                   {sentProposals.map(proposal => (
                      <tr key={proposal.id} className="hover:bg-stone-50 transition-colors">
                         <td className="p-4 font-bold">{proposal.candidateName}</td>
                         <td className="p-4 text-stone-700 flex items-center gap-2">
                            <Building2 size={14} className="text-stone-400"/>
                            {proposal.targetCompany}
                         </td>
                         <td className="p-4 text-stone-500 font-mono">{proposal.sentDate}</td>
                         <td className="p-4">
                            {proposal.status === 'review' && (
                               <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-200">
                                  <Eye size={12}/> 審査中
                               </span>
                            )}
                            {proposal.status === 'accepted' && (
                               <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">
                                  <CheckCircle2 size={12}/> 承認 (実名開示)
                               </span>
                            )}
                            {proposal.status === 'rejected' && (
                               <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">
                                  <X size={12}/> 見送り
                               </span>
                            )}
                         </td>
                         <td className="p-4">
                            {proposal.status === 'rejected' && proposal.feedback ? (
                               <div className="bg-red-50 p-2 rounded border border-red-100 text-red-800 text-xs">
                                  <span className="font-bold">理由:</span> {proposal.feedback}
                               </div>
                            ) : (
                               <span className="text-stone-400 text-xs">{proposal.memo}</span>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const PartnerManager = () => (
    <div className="animate-in fade-in">
       <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Building2 size={20}/> 企業提携管理</h2>
       
       <div className="space-y-6">
          {/* Pending Requests */}
          <div>
             <h3 className="text-sm font-bold text-stone-500 mb-3 ml-1">承認待ちリクエスト ({partners.filter(p => p.status === 'pending').length})</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.filter(p => p.status === 'pending').length === 0 && (
                   <p className="text-sm text-stone-400 italic p-4">現在、承認待ちのリクエストはありません。</p>
                )}
                {partners.filter(p => p.status === 'pending').map(req => (
                   <div key={req.id} className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                      <div className="flex justify-between items-start mb-2">
                         <div className="font-bold text-stone-800 text-lg">{req.company}</div>
                         <div className="text-xs text-stone-400">{req.requestDate}</div>
                      </div>
                      <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg mb-4 italic">"{req.message}"</p>
                      <div className="flex gap-2">
                         <button onClick={() => handlePartnerAction(req.id, 'approve')} className="flex-1 bg-stone-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-stone-800 flex items-center justify-center gap-1">
                            <Check size={14}/> 承認
                         </button>
                         <button onClick={() => handlePartnerAction(req.id, 'reject')} className="flex-1 bg-white border border-stone-200 text-stone-600 py-2 rounded-lg text-sm font-bold hover:bg-stone-50 flex items-center justify-center gap-1">
                            <X size={14}/> 却下
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Active Partners */}
          <div>
             <h3 className="text-sm font-bold text-stone-500 mb-3 ml-1">提携中の企業 ({partners.filter(p => p.status === 'active').length})</h3>
             <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                   <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                      <tr>
                         <th className="p-4">企業名</th>
                         <th className="p-4">提携開始日</th>
                         <th className="p-4">ステータス</th>
                         <th className="p-4 text-right">アクション</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-100">
                      {partners.filter(p => p.status === 'active').map(p => (
                         <tr key={p.id}>
                            <td className="p-4 font-bold">{p.company}</td>
                            <td className="p-4 text-stone-500">{p.requestDate}</td>
                            <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">提携中</span></td>
                            <td className="p-4 text-right">
                               <button className="text-emerald-600 font-bold hover:underline flex items-center justify-end gap-1">
                                  求人を見る <ExternalLink size={12}/>
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );

  const CandidateManager = () => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
        {/* Candidate List */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-stone-100 bg-stone-50">
            <h2 className="font-bold text-stone-800">担当候補者</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {candidates.map(candidate => (
              <div 
                key={candidate.id}
                onClick={() => setSelectedCandidateId(candidate.id)}
                className={`p-4 border-b border-stone-50 cursor-pointer hover:bg-stone-50 ${selectedCandidateId === candidate.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
              >
                <div className="flex justify-between mb-1">
                   <span className="font-bold">{candidate.name}</span>
                   {candidate.status === 'pending' ? (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">承認待ち</span>
                   ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">担当中</span>
                   )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                   <Users size={12}/> 
                   <span className={candidate.agents >= 2 ? 'text-red-500 font-bold' : ''}>
                     担当エージェント: {candidate.agents}/2名
                   </span>
                </div>
                <p className="text-xs text-stone-400 truncate">{candidate.lastMsg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-12 md:col-span-8 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
           {selectedCandidate ? (
              selectedCandidate.status === 'pending' ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-stone-50/50">
                    <Lock size={48} className="text-stone-300 mb-4"/>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">チャット機能はロックされています</h3>
                    <p className="text-stone-500 text-sm mb-6 max-w-md">
                       求職者からの担当承認（マッチング成立）が必要です。<br/>
                       現在の担当者数: {selectedCandidate.agents}/2名
                    </p>
                    
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm max-w-sm w-full">
                       <h4 className="font-bold text-stone-800 mb-2">担当申請ステータス</h4>
                       {selectedCandidate.agents >= 2 ? (
                          <div className="text-red-500 font-bold text-sm flex items-center justify-center gap-2">
                             <AlertTriangle size={16}/> 担当上限(2名)に達しています
                          </div>
                       ) : (
                          <>
                             <p className="text-xs text-stone-500 mb-4">
                                あなたが担当エージェントになるには、求職者の承認が必要です。
                             </p>
                             <button onClick={() => handleApprove(selectedCandidate.id)} className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-lg">
                                担当申請を再送する
                             </button>
                          </>
                       )}
                    </div>
                 </div>
              ) : (
                 <>
                    {/* Chat Interface */}
                    <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600">{selectedCandidate.avatar}</div>
                          <div>
                             <h3 className="font-bold text-sm">{selectedCandidate.name} 様</h3>
                             <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> 承認済み</span>
                          </div>
                       </div>
                       <button onClick={() => setShowJobSelector(true)} className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-stone-800">
                          <Briefcase size={12}/> 求人紹介
                       </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
                       {currentMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`p-3 rounded-xl text-sm max-w-[70%] shadow-sm ${msg.sender === 'agent' ? 'bg-stone-800 text-white rounded-tr-none' : 'bg-white border border-stone-200 rounded-tl-none'}`}>
                                {msg.text}
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="p-4 border-t border-stone-100 bg-white">
                       <div className="flex gap-2">
                          <input 
                             value={chatInput} 
                             onChange={(e) => setChatInput(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                             className="flex-1 bg-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-200 transition-all" 
                             placeholder="メッセージを入力..."
                          />
                          <button onClick={handleSendMessage} className="bg-stone-900 text-white p-3 rounded-xl hover:bg-stone-800 transition-colors"><Send size={18}/></button>
                       </div>
                    </div>
                 </>
              )
           ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400 flex-col">
                 <MessageCircle size={48} className="mb-4 opacity-20"/>
                 <p>候補者を選択してください</p>
              </div>
           )}
        </div>
    </div>
  );

  const ScoutManager = () => (
     <div className="animate-in fade-in">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Search size={20}/> 求職者を探す (スカウト)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {MOCK_SCOUT_LIST.map(seeker => {
              const isMaxAgents = seeker.agents >= 2;
              return (
              <div key={seeker.id} className={`bg-white p-6 rounded-2xl border ${isMaxAgents ? 'border-red-100 bg-red-50/20' : 'border-stone-200'} shadow-sm hover:shadow-md transition-all relative overflow-hidden`}>
                 {isMaxAgents && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold z-10">担当上限</div>
                 )}
                 <div className="flex justify-between items-start mb-3">
                    <div>
                       <h3 className="font-bold text-lg">{seeker.name} ({seeker.age})</h3>
                       <p className="text-sm text-stone-500">{seeker.role} / 経験{seeker.experience}</p>
                    </div>
                    <div className="text-xl font-black text-emerald-600">{seeker.match}% <span className="text-[10px] text-stone-400 font-normal">MATCH</span></div>
                 </div>
                 <div className="flex flex-wrap gap-1 mb-4">
                    {seeker.tags.map(tag => <span key={tag} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded">{tag}</span>)}
                 </div>
                 <div className="flex justify-between items-center mt-auto pt-3 border-t border-stone-100">
                    <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                       <Users size={12}/> {seeker.agents}/2名
                    </span>
                    <button 
                       onClick={() => handleScout(seeker.id)}
                       disabled={isMaxAgents}
                       className={`text-sm font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${isMaxAgents ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                    >
                       <Send size={14}/> スカウト
                    </button>
                 </div>
              </div>
           )})}
        </div>
     </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="w-full">
      <PageHeader 
        title="エージェント管理" 
        subtitle="担当候補者および提携企業の管理"
        breadcrumbs={[{ label: 'エージェント管理' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 h-full flex flex-col">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
           {/* Tabs */}
           <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit overflow-x-auto">
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'dashboard' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>ダッシュボード</button>
              <button onClick={() => setActiveTab('candidates')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'candidates' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>候補者管理</button>
              <button onClick={() => setActiveTab('scout')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'scout' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>スカウト</button>
              <button onClick={() => setActiveTab('partners')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'partners' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>企業提携管理</button>
              <button onClick={() => setActiveTab('proposals')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'proposals' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>提案管理</button>
           </div>
           
           <button onClick={() => setView(ViewState.AGENT_PROFILE_EDIT)} className="hidden sm:flex text-xs font-bold text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 items-center gap-2">
              <FileText size={14} /> プロフィール編集
           </button>
        </div>

        <div className="flex-1">
           {activeTab === 'dashboard' && <DashboardHome />}
           {activeTab === 'candidates' && <CandidateManager />}
           {activeTab === 'scout' && <ScoutManager />}
           {activeTab === 'partners' && <PartnerManager />}
           {activeTab === 'proposals' && <ProposalsManager />}
        </div>

        {/* Job Selection Modal (Existing) */}
        {showJobSelector && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
                 <h3 className="font-bold mb-4 text-lg">求人を選択して紹介</h3>
                 <div className="space-y-2 mb-4">
                    {MOCK_EXCLUSIVE_JOBS.map(job => (
                       <div key={job.id} onClick={() => { setShowJobSelector(false); alert('求人を送信しました'); }} className="p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 hover:border-emerald-200 transition-colors">
                          <div className="flex justify-between">
                             <div className="font-bold text-sm text-stone-800">{job.title}</div>
                             <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">非公開</span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1">{job.salary} / {job.location}</div>
                       </div>
                    ))}
                 </div>
                 <button onClick={() => setShowJobSelector(false)} className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200">キャンセル</button>
              </div>
           </div>
        )}

        {/* Proposal Creation Modal (New) */}
        {showProposalModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowProposalModal(false)} />
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 z-10 flex flex-col max-h-[90vh]">
                 <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                    <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><Send size={20} className="text-purple-600"/> 新規ブラインド提案</h3>
                    <button onClick={() => setShowProposalModal(false)} className="bg-stone-100 p-1.5 rounded-full hover:bg-stone-200"><X size={16}/></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {/* Candidate Selection */}
                    <div>
                       <label className="block text-xs font-bold text-stone-500 mb-1">提案する候補者</label>
                       <select 
                         className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-900"
                         value={newProposal.candidateId}
                         onChange={(e) => setNewProposal({...newProposal, candidateId: e.target.value})}
                       >
                          <option value="">選択してください</option>
                          {candidates.filter(c => c.status === 'approved').map(c => (
                             <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                       </select>
                    </div>

                    {/* Company Selection */}
                    <div>
                       <label className="block text-xs font-bold text-stone-500 mb-1">提案先企業</label>
                       <select 
                         className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-900"
                         value={newProposal.companyId}
                         onChange={(e) => setNewProposal({...newProposal, companyId: e.target.value})}
                       >
                          <option value="">選択してください</option>
                          {partners.filter(p => p.status === 'active').map(p => (
                             <option key={p.id} value={p.company}>{p.company}</option>
                          ))}
                       </select>
                    </div>

                    {/* Salary */}
                    <div>
                       <label className="block text-xs font-bold text-stone-500 mb-1">希望年収条件</label>
                       <input 
                         className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-900"
                         placeholder="例: 300万円以上"
                         value={newProposal.salary}
                         onChange={(e) => setNewProposal({...newProposal, salary: e.target.value})}
                       />
                    </div>

                    {/* Comment */}
                    <div>
                       <label className="block text-xs font-bold text-stone-500 mb-1">推薦コメント (ブラインド審査用)</label>
                       <textarea 
                         className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-900 h-32"
                         placeholder="個人が特定されない範囲で、候補者の強みや推薦理由を記入してください。"
                         value={newProposal.comment}
                         onChange={(e) => setNewProposal({...newProposal, comment: e.target.value})}
                       />
                       <p className="text-[10px] text-stone-400 mt-1">※このコメントと経歴概要のみが企業に開示されます。実名は伏せられます。</p>
                    </div>
                 </div>

                 <div className="mt-6 pt-4 border-t border-stone-100 flex gap-3">
                    <button onClick={() => setShowProposalModal(false)} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-200">キャンセル</button>
                    <button onClick={handleSubmitProposal} className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 shadow-md">送信する</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};