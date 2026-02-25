import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PipelineItem, PipelineStatus, ViewState, ChatMessage, Job, AgentProposal, UserPlan } from '../types';
import { 
  Mail, Briefcase, TrendingUp, Search, MoreHorizontal, Clock, 
  User, MapPin, Tag, Star, CheckCircle2, Sparkles, FileText, X,
  Calendar, Users, ArrowUpRight, MessageSquare, Zap, CalendarDays, CheckSquare,
  LayoutList, LayoutGrid, BrainCircuit, HeartHandshake, Building2,
  ArrowRight, UserCheck, Send, JapaneseYen, Video, Download, Plus, BarChart3, Loader2, PenTool, ChevronRight, Bell, Handshake,
  Eye, EyeOff, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Lock, Target, Gem
} from 'lucide-react';
import { PageHeader } from './PageHeader';
import { HelpPopover } from './ui/HelpPopover';
import { PricingModal } from './PricingModal';
import { CONFIG } from '../config';

interface DashboardProps {
  userRole: 'job_seeker' | 'employer' | 'admin';
  setView?: (view: ViewState) => void;
  pipelineData?: PipelineItem[]; // For Employer
  seekerApplications?: any[]; // For Job Seeker
  jobs?: Job[]; // For Employer (Passed from App state)
  onPipelineUpdate?: (newData: PipelineItem[]) => void;
  onStartDiagnostic?: (type: 'personality' | 'aptitude') => void;
  diagnosticResults?: { personality?: any, aptitude?: any };
}

const MOCK_SCOUTS = [
  { id: 1, company: '未来サポート株式会社', title: '【特例子会社】総務アシスタント', salary: '月給 18万円〜', message: '「コツコツ正確に作業できる」という強みに魅力を感じました。バリアフリー環境も整っております。', date: '2024.05.20 18:45', source: 'エージェント紹介', isSecret: true },
  { id: 2, company: 'トコトコ・テック', title: '【完全在宅】データ入力事務', salary: '月給 20万円〜', message: '通院などの配慮事項についても、柔軟に対応可能です。ぜひ詳細をご覧ください。', date: '2024.05.18 11:20', source: '企業直接スカウト', isSecret: false },
  { id: 3, company: 'グリーンファーム', title: '農園スタッフ', salary: '時給 1,050円〜', message: '自然の中でマイペースに働けます。送迎バスもありますので、通勤の負担も少ない環境です。', date: '2024.05.15 08:30', source: 'AIマッチング', isSecret: false },
];

const AGENT_CHAT_HISTORY: ChatMessage[] = [
    { id: 'c1', sender: 'agent', text: '佐藤様、担当エージェントの鈴木です。ご経歴と配慮事項を拝見し、マッチしそうな特例子会社の求人がございます。', timestamp: '昨日 10:00' },
    { id: 'c2', sender: 'user', text: 'ありがとうございます。どのような環境でしょうか？', timestamp: '昨日 12:30' },
    { id: 'c3', sender: 'agent', text: '静かな環境で、自分のペースで業務ができるデータ入力のお仕事です。産業医も常駐しています。', timestamp: '昨日 12:35' },
    { id: 'c4', sender: 'user', text: '安心できそうです。詳細を教えていただけますか？', timestamp: '昨日 13:00' },
];

const MOCK_INTERVIEWS = [
  { id: 1, time: '10:00', candidate: '山田 太郎', type: '一次面接 (AI)', job: '一般事務', method: 'AI録画', status: '完了' },
  { id: 2, time: '14:00', candidate: '佐藤 健太', type: '最終面接', job: 'システムエンジニア', method: 'オンライン', status: '予定' },
  { id: 3, time: '16:30', candidate: '田中 浩二', type: '見学・面談', job: '軽作業スタッフ', method: '対面', status: '予定' },
  { id: 4, time: '18:00', candidate: '鈴木 美咲', type: 'カジュアル面談', job: 'Webデザイナー', method: 'オンライン', status: '予定' },
];

const MOCK_EMPLOYER_PARTNERS = [
  { id: 'a1', name: 'Inclusive Career', rep: '鈴木 一郎', status: 'active', candidates: 3, fee: '30%' },
  { id: 'a2', name: 'Support Link', rep: '高橋 さくら', status: 'pending', candidates: 0, fee: '25%' },
];

const MOCK_PROPOSALS: AgentProposal[] = [
  {
    id: 'pr1',
    agentName: 'Inclusive Career',
    candidateMaskedName: 'K.S 様',
    candidateAge: '30代',
    candidateExperience: '事務経験 5年',
    candidateSkills: ['PCスキル', '正確性', 'マニュアル作成'],
    agentComment: '精神障害者保健福祉手帳をお持ちですが、服薬管理ができており安定して就業可能です。静かな環境であれば高い集中力を発揮します。',
    salaryExpectation: '250万円〜',
    status: 'review',
    receivedDate: '2024.05.26'
  },
  {
    id: 'pr2',
    agentName: 'Support Link',
    candidateMaskedName: 'M.T 様',
    candidateAge: '20代',
    candidateExperience: 'Webデザイン 3年',
    candidateSkills: ['Photoshop', 'Illustrator', '在宅希望'],
    agentComment: '聴覚に障がいがありますが、チャットツール等でのコミュニケーションは円滑です。在宅ワークでの実績も豊富です。',
    salaryExpectation: '300万円〜',
    status: 'review',
    receivedDate: '2024.05.25'
  }
];

const STATUS_CONFIG: Record<PipelineStatus, { label: string; color: string; bg: string; help: string }> = {
  matching: { 
    label: 'マッチング候補', 
    color: 'text-stone-600', 
    bg: 'bg-stone-100',
    help: 'AIマッチングまたは直接応募のあった候補者です。'
  },
  scout_sent: { 
    label: 'スカウト送信済', 
    color: 'text-blue-700', 
    bg: 'bg-blue-50',
    help: 'アプローチ（スカウト）を送信し、返信待ちの状態です。'
  },
  interview: { 
    label: '面接・実習調整', 
    color: 'text-amber-700', 
    bg: 'bg-amber-50',
    help: '書類選考通過。面接や職場実習の日程を調整中のフェーズです。'
  },
  offer: { 
    label: '選考中・内定', 
    color: 'text-purple-700', 
    bg: 'bg-purple-50',
    help: '最終選考が終了し、オファー（内定通知）を出す段階です。'
  },
  hired: { 
    label: '入社確定', 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50',
    help: '入社が確定しました。定着支援の準備を進めてください。'
  },
  agent_meeting: { 
    label: 'エージェント面談', 
    color: 'text-rose-700', 
    bg: 'bg-rose-50',
    help: '支援機関・エージェントからの紹介を受け、初期面談を設定する段階です。'
  },
};

const REJECTION_REASONS = [
  "スキル・経験の不一致",
  "希望条件（勤務地・給与）のミスマッチ",
  "必要な配慮の提供が困難",
  "他候補者での決定",
  "その他"
];

// Mock Details Generator
const getMockCandidateDetail = (name: string, status: string) => ({
  name: name,
  age: "30代前半",
  gender: "男性",
  disability: status === 'matching' ? "精神障がい (手帳2級)" : "開示済み (精神障がい)",
  history: "一般事務 5年 (金融機関バックオフィス)",
  skills: ["Word/Excel (Macro)", "簿記2級", "正確性", "チャットツール"],
  accommodations: "突発的な電話対応が苦手なため、チャットやメールでの連絡を希望します。通院のため月1回の平日休みが必要です。",
  selfPR: "前職では事務センターにてデータ入力と書類チェックを担当しておりました。ミスなく正確に処理することに自信があります。現在は服薬により体調は安定しており、即戦力として貢献したいと考えております。",
  aiAnalysis: {
    score: 92,
    summary: "事務処理能力が非常に高く、即戦力として期待できます。配慮事項も明確で、環境さえ整えば長期安定就労が見込めます。電話対応を免除することで、高いパフォーマンスを発揮するでしょう。"
  }
});

export const Dashboard: React.FC<DashboardProps> = ({ userRole, setView, pipelineData, seekerApplications, jobs, onPipelineUpdate, onStartDiagnostic, diagnosticResults }) => {
  const [localPipeline, setLocalPipeline] = useState<PipelineItem[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [hoveredOverId, setHoveredOverId] = useState<string | null>(null);
  
  // Modals
  const [selectedReport, setSelectedReport] = useState<{name: string, content: string} | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); 
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null); // For detail modal
  const [selectedScout, setSelectedScout] = useState<any | null>(null); // For job seeker scout detail
  
  // View Modes
  const [employerTab, setEmployerTab] = useState<'pipeline' | 'jobs' | 'partners'>('pipeline');
  const [partners, setPartners] = useState(MOCK_EMPLOYER_PARTNERS);
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Agent Chat State
  const [agentMessages, setAgentMessages] = useState<ChatMessage[]>(AGENT_CHAT_HISTORY);
  const [agentInput, setAgentInput] = useState('');

  // Guide State
  const [showSetupGuide, setShowSetupGuide] = useState(true);

  // Billing State
  const [currentPlan, setCurrentPlan] = useState<UserPlan>('free');

  useEffect(() => {
    if (pipelineData) {
      setLocalPipeline(pipelineData);
    }
  }, [pipelineData]);

  // ... (Handlers) ...
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: PipelineStatus) => {
    e.preventDefault();
    if (draggedItemId) {
      const draggedItem = localPipeline.find(i => i.id === draggedItemId);
      if (!draggedItem) return;

      const updatedItem = { ...draggedItem, status, lastUpdated: 'たった今' };
      const remainingItems = localPipeline.filter(i => i.id !== draggedItemId);
      
      let newList = [...remainingItems];
      if (hoveredOverId && hoveredOverId !== draggedItemId) {
         const dropIndex = remainingItems.findIndex(i => i.id === hoveredOverId);
         if (dropIndex !== -1) {
            newList.splice(dropIndex, 0, updatedItem);
         } else {
            newList.push(updatedItem);
         }
      } else {
         newList.push(updatedItem);
      }

      setLocalPipeline(newList);
      if (onPipelineUpdate) {
        onPipelineUpdate(newList);
      }
      setDraggedItemId(null);
      setHoveredOverId(null);
    }
  };

  const openReport = (e: React.MouseEvent, name: string, report: string) => {
    e.stopPropagation(); // Prevent opening candidate modal
    if (CONFIG.ENABLE_BILLING && currentPlan === 'free') {
        setShowPricingModal(true);
        return;
    }
    setSelectedReport({ name, content: report });
  };

  const handleCandidateClick = (candidate: PipelineItem) => {
    const mockDetail = getMockCandidateDetail(candidate.candidateName, candidate.status);
    setSelectedCandidate({ ...candidate, ...mockDetail });
  };

  const handleSendAgentMessage = () => {
    if (!agentInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      sender: 'user',
      text: agentInput,
      timestamp: 'たった今'
    };
    setAgentMessages([...agentMessages, newMsg]);
    setAgentInput('');
  };

  const handleAcceptProposal = (proposal: AgentProposal) => {
    if(window.confirm(`「${proposal.candidateMaskedName}」の紹介を承認し、面談へ進みますか？\n(実名・詳細プロフィールが開示されます)`)) {
       setProposals(prev => prev.filter(p => p.id !== proposal.id));
       const newItem: PipelineItem = {
          id: `new_${Date.now()}`,
          candidateName: proposal.candidateMaskedName.replace(' 様', ' 氏 (実名開示済)'),
          candidateId: `c_${Date.now()}`,
          targetCompany: '自社',
          jobTitle: '検討中ポジション',
          status: 'agent_meeting',
          lastUpdated: 'たった今',
          agentMemo: `[${proposal.agentName}] ${proposal.agentComment}`
       };
       if (onPipelineUpdate) onPipelineUpdate([...localPipeline, newItem]);
       setEmployerTab('pipeline');
       alert('承認しました。「候補者パイプライン」に追加されました。');
    }
  };

  const handleRejectProposal = (id: string) => {
    if (!rejectionReason) {
      alert('今後のマッチング精度向上のため、不採用理由を選択してください。');
      return;
    }
    setProposals(prev => prev.filter(p => p.id !== id));
    setRejectModalOpen(null);
    setRejectionReason('');
    alert(`紹介を見送りました。\nフィードバック「${rejectionReason}」をエージェントに送信しました。`);
  };

  const ReportModal = () => {
    if (!selectedReport) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedReport(null)} />
        <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden transform border border-stone-200">
           <div className="p-6 border-b border-stone-100 bg-stone-50 z-10 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <User size={20} className="text-stone-400" />
                  {selectedReport.name} 様
                </h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 bg-white text-stone-400 rounded-full hover:bg-stone-100"><X size={20} /></button>
           </div>
           <div className="p-8 overflow-y-auto custom-scrollbar bg-white flex-1">
             <article className="prose prose-stone prose-sm max-w-none">
               <ReactMarkdown>{selectedReport.content}</ReactMarkdown>
             </article>
           </div>
        </div>
      </div>
    );
  };

  const RejectModal = () => {
    if (!rejectModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setRejectModalOpen(null)} />
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 z-10">
           <h3 className="text-lg font-bold text-stone-800 mb-2">紹介を見送る</h3>
           <p className="text-sm text-stone-500 mb-4">
             エージェントへのフィードバックにご協力ください。<br/>
             この理由はエージェントに通知され、今後の紹介精度向上に役立てられます。
           </p>
           
           <div className="space-y-2 mb-6">
             {REJECTION_REASONS.map(reason => (
               <label key={reason} className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                 <input 
                   type="radio" 
                   name="rejectionReason" 
                   value={reason}
                   checked={rejectionReason === reason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                 />
                 <span className="text-sm font-bold text-stone-700">{reason}</span>
               </label>
             ))}
           </div>

           <div className="flex gap-3">
             <button onClick={() => setRejectModalOpen(null)} className="flex-1 py-3 text-stone-500 font-bold text-sm hover:bg-stone-100 rounded-xl">キャンセル</button>
             <button onClick={() => handleRejectProposal(rejectModalOpen)} className="flex-1 py-3 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 shadow-md">
               送信して見送る
             </button>
           </div>
        </div>
      </div>
    );
  };

  // --- CANDIDATE DETAIL MODAL (NEW) ---
  const CandidateDetailModal = () => {
    if (!selectedCandidate) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCandidate(null)} />
        <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden transform">
           
           {/* Header */}
           <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-start">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center text-stone-500">
                    <User size={32}/>
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-stone-900">{selectedCandidate.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                       <span className="bg-white border border-stone-200 px-2 py-0.5 rounded">{selectedCandidate.age}</span>
                       <span className="bg-white border border-stone-200 px-2 py-0.5 rounded">{selectedCandidate.gender}</span>
                       <span className="text-stone-400">|</span>
                       <span className="text-stone-700 font-bold">{selectedCandidate.jobTitle} 候補</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-2 bg-white text-stone-400 rounded-full hover:bg-stone-100 transition-colors"><X size={20}/></button>
           </div>

           {/* Content */}
           <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-8">
              {/* AI Analysis Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                 <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={20} className="text-indigo-500" />
                    <h3 className="font-bold text-indigo-900">AIマッチング分析</h3>
                 </div>
                 <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl font-black text-indigo-600">{selectedCandidate.aiAnalysis.score}<span className="text-sm font-medium text-indigo-400">/100</span></div>
                    <div className="h-10 w-px bg-indigo-200"></div>
                    <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                       {selectedCandidate.aiAnalysis.summary}
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2"><Briefcase size={18} className="text-stone-400"/> 職務経歴・スキル</h4>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-3">
                       <div>
                          <span className="text-xs text-stone-400 font-bold block mb-1">経歴概要</span>
                          <p className="text-sm text-stone-700">{selectedCandidate.history}</p>
                       </div>
                       <div>
                          <span className="text-xs text-stone-400 font-bold block mb-1">主なスキル</span>
                          <div className="flex flex-wrap gap-2">
                             {selectedCandidate.skills.map((skill: string, i: number) => (
                                <span key={i} className="bg-white border border-stone-200 px-2 py-1 rounded text-xs font-bold text-stone-600">{skill}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2"><HeartHandshake size={18} className="text-stone-400"/> 障がい・配慮事項</h4>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-3">
                       <div>
                          <span className="text-xs text-stone-400 font-bold block mb-1">障がい種別</span>
                          <p className="text-sm text-stone-700 font-bold">{selectedCandidate.disability}</p>
                       </div>
                       <div>
                          <span className="text-xs text-stone-400 font-bold block mb-1">必要な配慮</span>
                          <p className="text-sm text-stone-700 leading-relaxed bg-white p-2 rounded border border-stone-100">
                             {selectedCandidate.accommodations}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <div>
                 <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2"><User size={18} className="text-stone-400"/> 自己PR</h4>
                 <div className="bg-white p-5 rounded-xl border border-stone-200 text-sm text-stone-600 leading-relaxed">
                    {selectedCandidate.selfPR}
                 </div>
              </div>
              
              {selectedCandidate.agentMemo && (
                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-sm">
                    <h4 className="font-bold text-purple-800 mb-1 flex items-center gap-2"><MessageSquare size={16}/> エージェントコメント</h4>
                    <p className="text-purple-700">{selectedCandidate.agentMemo}</p>
                 </div>
              )}
           </div>

           {/* Footer Actions */}
           <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-4">
              <button className="flex-1 py-3 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-100 flex items-center justify-center gap-2">
                 <MessageSquare size={18}/> メッセージを送る
              </button>
              <button className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 flex items-center justify-center gap-2 shadow-lg">
                 <Calendar size={18}/> 面接を設定する
              </button>
           </div>
        </div>
      </div>
    );
  };

  // --- SCOUT DETAIL MODAL (JOB SEEKER) ---
  const ScoutDetailModal = () => {
    if (!selectedScout) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedScout(null)} />
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 z-10 flex flex-col">
           <button onClick={() => setSelectedScout(null)} className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-400 hover:bg-stone-200"><X size={20}/></button>
           
           <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{selectedScout.source}</span>
                 {selectedScout.isSecret && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Lock size={10}/> 非公開求人</span>}
              </div>
              <h2 className="text-xl font-bold text-stone-900 leading-tight mb-1">{selectedScout.title}</h2>
              <p className="text-stone-500 font-bold text-sm">{selectedScout.company}</p>
           </div>

           <div className="bg-stone-50 p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-2 border-b border-stone-200 pb-2">
                 <span className="text-xs font-bold text-stone-400">提示年収/月給</span>
                 <span className="text-emerald-600 font-black text-lg">{selectedScout.salary}</span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap font-medium">
                 {selectedScout.message}
              </p>
           </div>

           <div className="flex gap-3 mt-auto">
              <button onClick={() => setSelectedScout(null)} className="flex-1 py-3 text-stone-500 font-bold text-sm hover:bg-stone-100 rounded-xl border border-stone-200">辞退する</button>
              <button onClick={() => { alert('応募しました！'); setSelectedScout(null); }} className="flex-1 py-3 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 shadow-md">
                 詳細を見て応募
              </button>
           </div>
        </div>
      </div>
    );
  };

  const JobDetailModal = () => {
    if (!selectedJob) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedJob(null)} />
        <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden transform">
           <div className="relative h-48 overflow-hidden shrink-0">
              <img src={selectedJob.imageUrl} className="w-full h-full object-cover" alt="" />
              <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors z-20">
                <X size={20} />
              </button>
           </div>
           <div className="p-6 overflow-y-auto custom-scrollbar bg-white flex-1 space-y-4">
              <span className="text-xs font-bold text-white bg-stone-900 px-2 py-1 rounded">{selectedJob.type}</span>
              <h2 className="text-xl font-bold">{selectedJob.title}</h2>
              <p className="text-lg font-bold text-stone-700">{selectedJob.catchphrase}</p>
              <div className="space-y-2 text-sm text-stone-600">
                 <p><span className="font-bold">給与:</span> {selectedJob.salary}</p>
                 <p><span className="font-bold">勤務地:</span> {selectedJob.location}</p>
              </div>
              <div className="border-t border-stone-100 pt-4">
                 <h4 className="font-bold text-sm mb-2">仕事内容</h4>
                 <p className="text-sm leading-relaxed text-stone-600 whitespace-pre-wrap">{selectedJob.description || '詳細情報なし'}</p>
              </div>
           </div>
           <div className="p-4 border-t border-stone-100 flex gap-3 bg-stone-50 z-10">
             <button onClick={() => setSelectedJob(null)} className="flex-1 py-3 text-stone-600 font-bold text-sm hover:bg-stone-200 rounded-xl">閉じる</button>
           </div>
        </div>
      </div>
    );
  };

  const isJobSeeker = userRole === 'job_seeker';

  // --- JOB SEEKER VIEW ---
  if (isJobSeeker) {
    return (
      <div className="w-full">
        {selectedJob && <JobDetailModal />}
        {selectedScout && <ScoutDetailModal />}
        <PageHeader 
          title="マイページ" 
          subtitle="選考状況とスカウト、エージェントとのやり取りを管理します"
          breadcrumbs={[{ label: 'マイページ' }]}
          setView={setView}
          backgroundImage="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
           
           {/* --- AI DIAGNOSTICS LINK (Moved to Top) --- */}
           <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden mb-8 shadow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10 flex-1">
                 <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit size={24} className="text-indigo-600" />
                    <h3 className="font-bold text-lg text-indigo-900">AI適職・特性診断</h3>
                 </div>
                 <p className="text-sm text-indigo-700 max-w-2xl leading-relaxed">
                    あなたの「得意」と「働きやすさ」をAIが分析します。診断結果は応募書類に活用でき、企業へのアピール材料になります。まだ診断を受けていない方は、ぜひお試しください。
                 </p>
              </div>
              <button 
                onClick={() => onStartDiagnostic && onStartDiagnostic('aptitude')}
                className="relative z-10 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 shadow-md transition-all hover:scale-105 whitespace-nowrap"
              >
                 <BrainCircuit size={20} /> AI診断を受ける
              </button>
           </div>

           {/* Application Status */}
           <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><Briefcase size={22}/> 選考状況</h2>
           {seekerApplications && seekerApplications.length > 0 ? (
              <div className="space-y-4">
                 {seekerApplications.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                       <div>
                          <div className="text-xs text-stone-400 mb-1">{app.date} 応募</div>
                          <h3 className="font-bold text-lg text-stone-800">{app.company}</h3>
                          <p className="text-sm text-stone-500">{app.title}</p>
                       </div>
                       <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="flex-1 md:flex-none">
                             <div className="text-xs font-bold text-stone-400 mb-1">ステータス</div>
                             <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                                {app.status}
                             </span>
                          </div>
                          <div className="flex-1 md:flex-none">
                             <div className="text-xs font-bold text-stone-400 mb-1">次のアクション</div>
                             <span className="text-sm font-bold text-stone-700">{app.nextAction}</span>
                          </div>
                          <button className="p-2 text-stone-400 hover:bg-stone-100 rounded-full"><MoreHorizontal size={20}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="bg-stone-50 border border-dashed border-stone-200 p-10 text-center rounded-2xl">
                 <p className="text-stone-400 font-bold">現在進行中の選考はありません</p>
                 <button onClick={() => setView && setView(ViewState.JOB_SEARCH)} className="mt-4 text-emerald-600 font-bold hover:underline">求人を探す</button>
              </div>
           )}

           {/* Scouts */}
           <h2 className="text-xl font-bold text-stone-800 mt-12 mb-6 flex items-center gap-2"><Mail size={22}/> 受信スカウト</h2>
           <div className="space-y-4">
              {MOCK_SCOUTS.map(scout => (
                 <div 
                   key={scout.id} 
                   onClick={() => setSelectedScout(scout)}
                   className={`bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md cursor-pointer hover:scale-[1.01] ${scout.isSecret ? 'border-amber-200 bg-amber-50/30' : 'border-stone-200'}`}
                 >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{scout.source}</span>
                          {scout.isSecret && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> 非公開</span>}
                          <span className="text-xs text-stone-400">{scout.date}</span>
                       </div>
                    </div>
                    <h3 className="font-bold text-lg text-stone-800 mb-1">{scout.title} <span className="text-sm font-normal text-stone-500">at {scout.company}</span></h3>
                    <p className="text-sm font-bold text-emerald-600 mb-3">{scout.salary}</p>
                    <div className="bg-stone-50 p-3 rounded-xl text-sm text-stone-600 leading-relaxed line-clamp-2">
                       {scout.message}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // --- EMPLOYER VIEW ---
  if (userRole === 'employer') {
    const getItemsByStatus = (status: PipelineStatus) => localPipeline.filter(i => i.status === status);
    
    return (
      <div className="w-full">
        {selectedReport && <ReportModal />}
        {rejectModalOpen && <RejectModal />}
        {selectedCandidate && <CandidateDetailModal />}
        <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} currentPlan={currentPlan} />
        
        <PageHeader 
          title="採用管理" 
          subtitle="求人管理と候補者パイプラインを一元管理"
          breadcrumbs={[{ label: '採用管理' }]}
          setView={setView}
          backgroundImage="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80"
        />

        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col min-h-[800px]">
          
          {/* SETUP GUIDE WIDGET */}
          {showSetupGuide && employerTab === 'pipeline' && (
            <div className="mb-8 bg-stone-900 rounded-2xl p-6 text-white relative overflow-hidden animate-in fade-in slide-in-from-top-4">
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               <button onClick={() => setShowSetupGuide(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors"><X size={20}/></button>
               
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                  <CheckCircle2 className="text-emerald-400" /> セットアップ・ガイド
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => setEmployerTab('jobs')}>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-400 font-bold text-xs border border-emerald-400/50 px-2 py-0.5 rounded">STEP 1</span>
                        {jobs && jobs.length > 0 ? <CheckCircle2 size={16} className="text-emerald-400"/> : <ArrowRight size={16} className="text-stone-400"/>}
                     </div>
                     <h4 className="font-bold text-sm mb-1">求人を作成する</h4>
                     <p className="text-xs text-stone-400">AIを活用して魅力的な求人票を作成し、エージェント向け戦略を設定しましょう。</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => setView && setView(ViewState.EMPLOYER_FIND_AGENT)}>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-400 font-bold text-xs border border-emerald-400/50 px-2 py-0.5 rounded">STEP 2</span>
                        {partners.some(p => p.status === 'active') ? <CheckCircle2 size={16} className="text-emerald-400"/> : <ArrowRight size={16} className="text-stone-400"/>}
                     </div>
                     <h4 className="font-bold text-sm mb-1">支援機関と提携する</h4>
                     <p className="text-xs text-stone-400">貴社の領域に強いエージェントや就労移行支援事業所を検索し、パートナーシップを結びましょう。</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => setView && setView(ViewState.EMPLOYER_SCOUT)}>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-400 font-bold text-xs border border-emerald-400/50 px-2 py-0.5 rounded">STEP 3</span>
                        <ArrowRight size={16} className="text-stone-400"/>
                     </div>
                     <h4 className="font-bold text-sm mb-1">AIスカウトを送る</h4>
                     <p className="text-xs text-stone-400">AI診断を受けたハイポテンシャル層へ、直接スカウトを送ってアプローチ。</p>
                  </div>
               </div>
            </div>
          )}

          {/* Tab Switcher & Plan Status */}
          <div className="flex justify-between items-center mb-6">
             <div className="flex gap-4 overflow-x-auto pb-2">
                <button 
                  onClick={() => setEmployerTab('pipeline')}
                  className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${employerTab === 'pipeline' ? 'bg-stone-900 text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                >
                   <LayoutList size={18}/> 候補者パイプライン
                </button>
                <button 
                  onClick={() => setEmployerTab('jobs')}
                  className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${employerTab === 'jobs' ? 'bg-stone-900 text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                >
                   <Briefcase size={18}/> 求人管理・AI解析
                </button>
                <button 
                  onClick={() => setEmployerTab('partners')}
                  className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${employerTab === 'partners' ? 'bg-stone-900 text-white shadow-lg' : 'bg-white text-stone-500 hover:bg-stone-50'}`}
                >
                   <Handshake size={18}/> 支援機関・エージェント管理
                   {proposals.length > 0 && <span className="bg-red-50 text-white text-[10px] px-2 py-0.5 rounded-full">{proposals.length}</span>}
                </button>
             </div>
             
             {CONFIG.ENABLE_BILLING && (
                <div className="hidden md:flex items-center gap-2">
                   <span className="text-xs font-bold text-stone-500">Plan:</span>
                   <button 
                     onClick={() => setShowPricingModal(true)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${currentPlan === 'free' ? 'bg-stone-200 text-stone-600 hover:bg-stone-300' : 'bg-emerald-100 text-emerald-700'}`}
                   >
                      {currentPlan === 'free' ? 'Free' : 'Pro'}
                      {currentPlan === 'free' && <Zap size={12} className="text-stone-500"/>}
                   </button>
                </div>
             )}
          </div>

          {/* PIPELINE TAB */}
          {employerTab === 'pipeline' && (
             <div className="animate-in fade-in">
               {/* KPI & Schedule Section */}
               <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8 flex-shrink-0">
                  <div className="xl:col-span-1 grid grid-cols-2 gap-4">
                     <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="text-stone-500 text-xs font-bold mb-2 flex items-center gap-1"><Users size={14} className="text-blue-500"/> 新規応募</div>
                        <div className="text-3xl font-bold text-stone-800">12<span className="text-sm text-stone-400 font-medium ml-1">名</span></div>
                     </div>
                     <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                        <div className="text-blue-100 text-xs font-bold mb-2 flex items-center gap-1"><Zap size={14}/> アクション</div>
                        <div className="text-lg font-bold leading-tight">AI面接評価待ち <br/>3件</div>
                     </div>
                  </div>
                  <div className="xl:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 relative">
                     <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Calendar size={18}/> 本日の面接・実習</h2>
                     <div className="flex gap-4 overflow-x-auto">
                        {MOCK_INTERVIEWS.map(int => (
                           <div key={int.id} className="min-w-[200px] p-3 border rounded-xl bg-stone-50">
                              <div className="font-bold text-sm">{int.time} - {int.candidate}</div>
                              <div className="text-xs text-stone-500">{int.type}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Kanban Board */}
               <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar min-h-[500px]">
                 <div className="flex gap-4 h-full min-w-[1400px]">
                   {(Object.keys(STATUS_CONFIG) as PipelineStatus[]).map((statusKey) => {
                     const status = statusKey as PipelineStatus;
                     return (
                     <div 
                       key={status} 
                       className={`flex-1 min-w-[280px] rounded-xl flex flex-col border transition-colors duration-300 max-h-full ${draggedItemId ? 'border-purple-200 bg-purple-50/30' : 'border-stone-200 bg-stone-50'}`}
                       onDragOver={handleDragOver}
                       onDrop={(e) => handleDrop(e, status)}
                     >
                       <div className={`p-3 border-b border-stone-200 flex justify-between items-center sticky top-0 rounded-t-xl z-10 ${STATUS_CONFIG[status].bg} bg-opacity-90 backdrop-blur-sm`}>
                         <div className="flex items-center gap-1">
                            <span className={`font-bold text-sm ${STATUS_CONFIG[status].color}`}>{STATUS_CONFIG[status].label}</span>
                            <HelpPopover content={STATUS_CONFIG[status].help} />
                         </div>
                         <span className="bg-white text-stone-500 px-2 py-0.5 rounded-md text-xs font-bold border">{getItemsByStatus(status).length}</span>
                       </div>
                       <div className="p-2 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                         {getItemsByStatus(status).map((item) => (
                           <div 
                             key={item.id} 
                             draggable
                             onDragStart={(e) => handleDragStart(e, item.id)}
                             onDragEnter={() => setHoveredOverId(item.id)}
                             onClick={() => handleCandidateClick(item)}
                             className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-lg transition-all cursor-grab active:cursor-grabbing hover:scale-[1.02] ${hoveredOverId === item.id ? 'border-blue-500 border-2' : 'border-stone-200'}`}
                           >
                             <div className="font-bold text-stone-800 text-sm mb-1">{item.candidateName}</div>
                             <div className="text-xs text-stone-500 mb-2">{item.jobTitle}</div>
                             {item.hasAiInterview && item.aiInterviewReport && (
                               <button 
                                 onClick={(e) => openReport(e, item.candidateName, item.aiInterviewReport!)} 
                                 className={`w-full border rounded px-2 py-1 text-xs font-bold mb-2 flex items-center justify-center gap-1 transition-colors ${currentPlan === 'free' ? 'bg-stone-100 text-stone-500 border-stone-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                               >
                                 {currentPlan === 'free' ? <Lock size={10} /> : null}
                                 AIレポート (Score: {item.aiInterviewScore})
                               </button>
                             )}
                             <div className="text-[10px] text-stone-400 text-right">{item.lastUpdated}</div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )})}
                 </div>
               </div>
             </div>
          )}

          {/* JOBS TAB */}
          {employerTab === 'jobs' && (
             <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold">求人管理</h2>
                   <button 
                     onClick={() => setView && setView(ViewState.EMPLOYER_JOB_CREATE)} 
                     className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-stone-800 shadow-lg transition-all hover:scale-105"
                   >
                      <Plus size={18}/> 新規求人作成
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {jobs && jobs.map(job => (
                      <div key={job.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold bg-stone-100 px-2 py-1 rounded text-stone-600">{job.type}</span>
                            {job.isClosed && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded flex items-center gap-1"><Lock size={10}/> 非公開</span>}
                         </div>
                         <h3 className="font-bold text-lg mb-1">{job.title}</h3>
                         <p className="text-sm text-stone-500 mb-4 line-clamp-1">{job.catchphrase}</p>
                         <div className="bg-stone-50 p-3 rounded-xl mb-4 border border-stone-100">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold text-stone-500 flex items-center gap-1"><Sparkles size={12}/> AI求人スコア</span>
                               <span className="text-lg font-black text-indigo-600">{job.analysisScore || '-'}</span>
                            </div>
                            {job.analysisScore && (
                                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full rounded-full" style={{width: `${job.analysisScore}%`}}></div>
                                </div>
                            )}
                         </div>
                         
                         {job.agentStrategy && (
                            <div className="mt-4 pt-4 border-t border-stone-100 bg-purple-50/50 p-3 rounded-xl">
                               <div className="flex items-center gap-2 mb-2">
                                  <Lock size={12} className="text-purple-600"/>
                                  <span className="text-xs font-bold text-purple-800">エージェント向け戦略 (非公開)</span>
                               </div>
                               <p className="text-[10px] text-purple-900/80 mb-1 flex items-start gap-1">
                                  <Target size={10} className="mt-0.5 shrink-0"/> <span className="font-bold">Target:</span> {job.agentStrategy.targetCompanies || '指定なし'}
                               </p>
                               <p className="text-[10px] text-purple-900/80 flex items-start gap-1">
                                  <Gem size={10} className="mt-0.5 shrink-0"/> <span className="font-bold">Bonus:</span> {job.agentStrategy.feeBonus || 'なし'}
                               </p>
                            </div>
                         )}
                      </div>
                   ))}
                   {(!jobs || jobs.length === 0) && (
                      <div className="col-span-3 text-center py-20 bg-stone-50 border border-dashed border-stone-300 rounded-3xl">
                         <p className="text-stone-400 font-bold">求人情報がありません。<br/>新規求人を作成してください。</p>
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* PARTNERS TAB */}
          {employerTab === 'partners' && (
             <div className="animate-in fade-in space-y-12">
                <div>
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Mail size={24} className="text-purple-600"/> 
                      新規紹介 (ブラインド審査)
                      {proposals.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{proposals.length}件</span>}
                   </h2>
                   {proposals.length === 0 ? (
                      <div className="bg-stone-50 border border-dashed border-stone-200 p-8 text-center rounded-2xl text-stone-400">
                         現在、新しい紹介はありません。
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {proposals.map(proposal => (
                            <div key={proposal.id} className="bg-white rounded-2xl border border-purple-200 shadow-lg relative overflow-hidden group">
                               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                               <div className="p-6">
                                  <div className="flex justify-between items-start mb-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center relative overflow-hidden">
                                           <div className="absolute inset-0 bg-stone-300 blur-sm flex items-center justify-center text-stone-400">
                                              <User size={24} />
                                           </div>
                                           <EyeOff size={16} className="absolute text-stone-600 z-10" />
                                        </div>
                                        <div>
                                           <h3 className="font-bold text-lg text-stone-800">{proposal.candidateMaskedName}</h3>
                                           <p className="text-xs text-stone-500">{proposal.candidateAge} / {proposal.candidateExperience}</p>
                                        </div>
                                     </div>
                                     <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 font-bold">
                                        {proposal.agentName}
                                     </span>
                                  </div>
                                  <p className="text-sm text-stone-700 leading-relaxed font-medium mb-4">"{proposal.agentComment}"</p>
                                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                                     <button onClick={() => setRejectModalOpen(proposal.id)} className="flex-1 py-3 border border-stone-200 text-stone-500 font-bold text-sm rounded-xl">見送る</button>
                                     <button onClick={() => handleAcceptProposal(proposal)} className="flex-1 py-3 bg-stone-900 text-white font-bold text-sm rounded-xl">興味あり (詳細開示)</button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          )}

        </div>
      </div>
    );
  }

  // Fallback
  return null;
};