import React, { useState } from 'react';
import { 
  Users, Building2, Briefcase, TrendingUp, AlertCircle, Settings, 
  CheckCircle2, XCircle, Search, LayoutDashboard, DollarSign, 
  Megaphone, Server, Shield, Lock, FileText, Ban, MoreHorizontal,
  Activity, Power, RefreshCw, ChevronDown, Filter, UserPlus
} from 'lucide-react';
import { ViewState } from '../types';
import { PageHeader } from './PageHeader';

// --- INITIAL MOCK DATA ---
const INITIAL_USERS = {
  seekers: [
    { id: 'u1', name: '佐藤 健太', email: 'sato@example.com', status: 'active', registered: '2023-12-01' },
    { id: 'u2', name: '田中 浩二', email: 'tanaka@example.com', status: 'active', registered: '2024-01-15' },
    { id: 'u3', name: '鈴木 一郎', email: 'suzuki@example.com', status: 'banned', registered: '2024-02-10' },
    { id: 'u4', name: '高橋 優子', email: 'takahashi@example.com', status: 'active', registered: '2024-03-05' },
    { id: 'u5', name: '渡辺 徹', email: 'watanabe@example.com', status: 'active', registered: '2024-04-22' },
  ],
  employers: [
    { id: 'c1', name: '株式会社未来サポート', plan: 'Enterprise', status: 'active', jobs: 5, lastLogin: '2時間前' },
    { id: 'c2', name: 'テクノロジーパートナーズ', plan: 'Standard', status: 'active', jobs: 2, lastLogin: '1日前' },
    { id: 'c3', name: 'グリーンファーム', plan: 'Free', status: 'pending', jobs: 0, lastLogin: '3日前' },
    { id: 'c4', name: 'ソーシャル・インクルージョン', plan: 'Premium', status: 'active', jobs: 3, lastLogin: '10分前' },
  ],
  agents: [
    { id: 'a1', name: 'Inclusive Career', agency: 'Inclusive Co.', status: 'approved', rating: 4.8, candidates: 12 },
    { id: 'a2', name: 'Work Partner', agency: 'Partner Ltd.', status: 'pending', rating: 0, candidates: 0 },
    { id: 'a3', name: 'Challenge Support', agency: 'Challenge Inc.', status: 'approved', rating: 4.5, candidates: 8 },
  ]
};

const INITIAL_JOBS = {
  general: [
    { id: 'j1', title: '一般事務（障がい者枠）', company: '株式会社未来サポート', type: '正社員', status: 'public', views: 1240, reports: 0 },
    { id: 'j2', title: '軽作業スタッフ', company: 'グリーンファーム', type: 'パート', status: 'closed', views: 500, reports: 0 },
    { id: 'j3', title: 'データ入力', company: 'テクノロジーパートナーズ', type: '契約社員', status: 'public', views: 890, reports: 1 },
  ],
  agent: [
    { id: 'aj1', title: '【非公開】特例子会社 管理者', company: '非公開', type: 'Agent', fee: '35%', status: 'active', candidates: 5 },
    { id: 'aj2', title: '【非公開】エンジニア', company: '非公開', type: 'Agent', fee: '30%', status: 'active', candidates: 3 },
    { id: 'aj3', title: '【非公開】人事アシスタント', company: '大手商社', type: 'Agent', fee: '30%', status: 'paused', candidates: 0 },
  ]
};

const INITIAL_FINANCE = {
  commissions: [
    { id: 'tr1', agent: 'Inclusive Career', candidate: '佐藤 健太', amount: 800000, status: 'paid', date: '2024-05-01' },
    { id: 'tr2', agent: 'Challenge Support', candidate: '田中 浩二', amount: 600000, status: 'pending', date: '2024-05-15' },
    { id: 'tr3', agent: 'Work Partner', candidate: '伊藤 さくら', amount: 450000, status: 'processing', date: '2024-05-20' },
  ],
  ads: [
    { id: 'ad1', client: 'テクノロジーパートナーズ', type: 'Top Banner', impressions: 45000, ctr: '1.2%', status: 'active', budget: 500000 },
    { id: 'ad2', client: 'Academy Z', type: 'Sidebar', impressions: 12000, ctr: '0.8%', status: 'paused', budget: 100000 },
  ]
};

type AdminSection = 'overview' | 'users' | 'jobs' | 'finance' | 'system';

interface AdminDashboardProps {
  setView: (view: ViewState) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  
  // Data State
  const [users, setUsers] = useState(INITIAL_USERS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [finance, setFinance] = useState(INITIAL_FINANCE);
  const [systemStatus, setSystemStatus] = useState({ maintenance: false, registration: true });
  
  // Tabs State
  const [userTab, setUserTab] = useState<'seekers' | 'employers' | 'agents'>('seekers');
  const [jobTab, setJobTab] = useState<'general' | 'agent'>('general');

  // --- ACTIONS ---
  const toggleUserStatus = (role: 'seekers'|'employers'|'agents', id: string) => {
    const newStatus = role === 'agents' ? 'approved' : 'active';
    const failStatus = role === 'agents' ? 'rejected' : 'banned';
    
    setUsers(prev => ({
      ...prev,
      [role]: prev[role].map(u => {
        if (u.id === id) {
          if (u.status === 'pending') return { ...u, status: newStatus };
          return { ...u, status: u.status === 'active' || u.status === 'approved' ? failStatus : newStatus };
        }
        return u;
      })
    }));
  };

  const toggleJobStatus = (type: 'general'|'agent', id: string) => {
    setJobs(prev => ({
      ...prev,
      [type]: prev[type].map(j => j.id === id ? { ...j, status: j.status === 'public' || j.status === 'active' ? 'closed' : j.status === 'closed' ? 'public' : 'active' } : j)
    }));
  };

  const toggleAdStatus = (id: string) => {
    setFinance(prev => ({
      ...prev,
      ads: prev.ads.map(ad => ad.id === id ? { ...ad, status: ad.status === 'active' ? 'paused' : 'active' } : ad)
    }));
  };

  // --- RENDER HELPERS ---

  const SidebarItem = ({ section, icon: Icon, label }: { section: AdminSection, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm mb-1 ${activeSection === section ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      public: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      paid: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      processing: 'bg-purple-100 text-purple-700 border-purple-200',
      paused: 'bg-stone-100 text-stone-500 border-stone-200',
      closed: 'bg-stone-100 text-stone-500 border-stone-200',
      banned: 'bg-red-100 text-red-700 border-red-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  // --- SECTIONS ---

  const OverviewSection = () => (
    <div className="space-y-6 animate-in fade-in">
      {/* System Status Banner */}
      {systemStatus.maintenance && (
        <div className="bg-red-500 text-white p-3 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
           <div className="flex items-center gap-2 font-bold"><AlertCircle size={20}/> 現在メンテナンスモードで稼働中です。ユーザーはアクセスできません。</div>
           <button onClick={() => setSystemStatus(p => ({...p, maintenance: false}))} className="bg-white text-red-600 px-4 py-1 rounded-lg text-xs font-bold hover:bg-red-50">解除する</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 text-stone-500 font-bold text-xs mb-2"><Users size={16}/> 総ユーザー数</div>
           <div className="text-3xl font-black text-stone-800">1,245</div>
           <div className="text-xs text-emerald-600 font-bold mt-1">+12% vs 先月</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 text-stone-500 font-bold text-xs mb-2"><Briefcase size={16}/> 有効求人数</div>
           <div className="text-3xl font-black text-stone-800">{jobs.general.filter(j => j.status === 'public').length + jobs.agent.filter(j => j.status === 'active').length}</div>
           <div className="text-xs text-stone-400 font-bold mt-1">内 エージェント求人: {jobs.agent.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 text-stone-500 font-bold text-xs mb-2"><DollarSign size={16}/> 今月の収益 (概算)</div>
           <div className="text-3xl font-black text-stone-800">¥2.8M</div>
           <div className="text-xs text-emerald-600 font-bold mt-1">+8% vs 先月</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 text-stone-500 font-bold text-xs mb-2"><Server size={16}/> システム稼働状況</div>
           <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full ${systemStatus.maintenance ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
             <span className="text-xl font-bold text-stone-800">{systemStatus.maintenance ? 'Maintenance' : 'Normal'}</span>
           </div>
           <div className="text-xs text-stone-400 font-bold mt-1">API Latency: 45ms</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><AlertCircle size={18}/> 要対応アラート</h3>
            <div className="space-y-3">
               {users.agents.some(u => u.status === 'pending') && (
                 <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="flex items-center gap-3">
                       <Users size={16} className="text-amber-600"/>
                       <span className="text-sm font-bold text-amber-900">エージェント承認待ち: {users.agents.filter(u => u.status === 'pending').length}件</span>
                    </div>
                    <button onClick={() => {setActiveSection('users'); setUserTab('agents');}} className="text-xs bg-white border border-amber-200 px-3 py-1 rounded-lg text-amber-700 font-bold hover:bg-amber-100">確認</button>
                 </div>
               )}
               {jobs.general.some(j => j.reports > 0) && (
                 <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-3">
                       <FileText size={16} className="text-red-600"/>
                       <span className="text-sm font-bold text-red-900">不適切な求人の通報: {jobs.general.filter(j => j.reports > 0).length}件</span>
                    </div>
                    <button onClick={() => {setActiveSection('jobs'); setJobTab('general');}} className="text-xs bg-white border border-red-200 px-3 py-1 rounded-lg text-red-700 font-bold hover:bg-red-100">確認</button>
                 </div>
               )}
               {users.employers.some(c => c.status === 'pending') && (
                 <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-3">
                       <Building2 size={16} className="text-blue-600"/>
                       <span className="text-sm font-bold text-blue-900">企業アカウント審査待ち: {users.employers.filter(c => c.status === 'pending').length}件</span>
                    </div>
                    <button onClick={() => {setActiveSection('users'); setUserTab('employers');}} className="text-xs bg-white border border-blue-200 px-3 py-1 rounded-lg text-blue-700 font-bold hover:bg-blue-100">確認</button>
                 </div>
               )}
            </div>
         </div>
         
         <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><TrendingUp size={18}/> 成約推移 (Weekly)</h3>
            <div className="h-40 flex items-end gap-2 px-2">
               {[40, 60, 45, 70, 85, 60, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-stone-100 rounded-t-lg relative group cursor-pointer">
                     <div 
                        className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-600 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        style={{ height: `${h}%` }}
                     ></div>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h}件
                     </div>
                  </div>
               ))}
            </div>
            <div className="flex justify-between text-xs text-stone-400 mt-2 font-mono">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
         </div>
      </div>
    </div>
  );

  const UserManagementSection = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="bg-stone-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
             <button onClick={() => setUserTab('seekers')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors ${userTab === 'seekers' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}>求職者</button>
             <button onClick={() => setUserTab('employers')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors ${userTab === 'employers' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}>採用企業</button>
             <button onClick={() => setUserTab('agents')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors ${userTab === 'agents' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}>エージェント</button>
          </div>
          <div className="relative w-full sm:w-64">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
             <input type="text" placeholder="名前やIDで検索" className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none bg-white" />
          </div>
       </div>

       <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <tr>
                     <th className="p-4 whitespace-nowrap">ID/名前</th>
                     <th className="p-4 whitespace-nowrap">{userTab === 'agents' ? '所属' : userTab === 'employers' ? 'プラン' : 'Email'}</th>
                     <th className="p-4 whitespace-nowrap">{userTab === 'agents' ? '担当候補者数' : '登録日/ログイン'}</th>
                     <th className="p-4 whitespace-nowrap">ステータス</th>
                     <th className="p-4 whitespace-nowrap text-right">アクション</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {userTab === 'seekers' && users.seekers.map(u => (
                     <tr key={u.id} className="hover:bg-stone-50">
                        <td className="p-4 font-bold whitespace-nowrap">{u.name} <span className="text-xs text-stone-400 font-normal block">{u.id}</span></td>
                        <td className="p-4 text-stone-600">{u.email}</td>
                        <td className="p-4 text-stone-600">{u.registered}</td>
                        <td className="p-4"><StatusBadge status={u.status} /></td>
                        <td className="p-4 text-right">
                           <button 
                              onClick={() => toggleUserStatus('seekers', u.id)}
                              className={`p-2 rounded-lg transition-colors ${u.status === 'banned' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}
                              title={u.status === 'banned' ? '利用停止を解除' : '利用停止にする'}
                           >
                              {u.status === 'banned' ? <CheckCircle2 size={16}/> : <Ban size={16}/>}
                           </button>
                        </td>
                     </tr>
                  ))}
                  {userTab === 'employers' && users.employers.map(u => (
                     <tr key={u.id} className="hover:bg-stone-50">
                        <td className="p-4 font-bold whitespace-nowrap">{u.name} <span className="text-xs text-stone-400 font-normal block">{u.id}</span></td>
                        <td className="p-4 text-stone-600"><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 text-xs font-bold">{u.plan}</span></td>
                        <td className="p-4 text-stone-600">{u.lastLogin}</td>
                        <td className="p-4"><StatusBadge status={u.status} /></td>
                        <td className="p-4 text-right flex justify-end gap-2">
                           {u.status === 'pending' && (
                              <button onClick={() => toggleUserStatus('employers', u.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700">審査完了</button>
                           )}
                           <button className="p-2 hover:bg-stone-200 rounded-lg"><MoreHorizontal size={16}/></button>
                        </td>
                     </tr>
                  ))}
                  {userTab === 'agents' && users.agents.map(u => (
                     <tr key={u.id} className="hover:bg-stone-50">
                        <td className="p-4 font-bold whitespace-nowrap">{u.name} <span className="text-xs text-stone-400 font-normal block">{u.id}</span></td>
                        <td className="p-4 text-stone-600">{u.agency}</td>
                        <td className="p-4 text-stone-600">{u.candidates}名</td>
                        <td className="p-4"><StatusBadge status={u.status} /></td>
                        <td className="p-4 text-right">
                           {u.status === 'pending' ? (
                              <div className="flex gap-2 justify-end">
                                 <button onClick={() => toggleUserStatus('agents', u.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 size={12}/> 承認
                                 </button>
                                 <button className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 border border-red-100">
                                    却下
                                 </button>
                              </div>
                           ) : (
                              <button className="p-2 hover:bg-stone-200 rounded-lg"><Settings size={16}/></button>
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

  const JobManagementSection = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex gap-4 border-b border-stone-200">
          <button onClick={() => setJobTab('general')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${jobTab === 'general' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400'}`}>一般求人情報</button>
          <button onClick={() => setJobTab('agent')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${jobTab === 'agent' ? 'border-purple-600 text-purple-600' : 'border-transparent text-stone-400'}`}>エージェント求人 (非公開)</button>
       </div>

       <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <tr>
                     <th className="p-4 whitespace-nowrap">求人タイトル</th>
                     <th className="p-4 whitespace-nowrap">企業名</th>
                     <th className="p-4 whitespace-nowrap">タイプ</th>
                     <th className="p-4 whitespace-nowrap">{jobTab === 'agent' ? '手数料率' : '閲覧数/通報'}</th>
                     <th className="p-4 whitespace-nowrap">ステータス</th>
                     <th className="p-4 whitespace-nowrap text-right">操作</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {jobTab === 'general' ? jobs.general.map(j => (
                     <tr key={j.id} className="hover:bg-stone-50">
                        <td className="p-4 font-bold">{j.title}</td>
                        <td className="p-4 text-stone-600">{j.company}</td>
                        <td className="p-4 text-stone-600">{j.type}</td>
                        <td className="p-4 text-stone-600 flex items-center gap-2">
                           {j.views} 
                           {j.reports > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">! {j.reports}</span>}
                        </td>
                        <td className="p-4"><StatusBadge status={j.status} /></td>
                        <td className="p-4 text-right">
                           <button 
                              onClick={() => toggleJobStatus('general', j.id)}
                              className={`p-2 rounded-lg transition-colors ${j.status === 'closed' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                           >
                              {j.status === 'closed' ? <RefreshCw size={16}/> : <Ban size={16}/>}
                           </button>
                        </td>
                     </tr>
                  )) : jobs.agent.map(j => (
                     <tr key={j.id} className="hover:bg-purple-50/30">
                        <td className="p-4 font-bold flex items-center gap-2"><Lock size={14} className="text-purple-500"/> {j.title}</td>
                        <td className="p-4 text-stone-600">{j.company}</td>
                        <td className="p-4 text-stone-600">{j.type}</td>
                        <td className="p-4 font-bold text-purple-700">{j.fee}</td>
                        <td className="p-4"><StatusBadge status={j.status} /></td>
                        <td className="p-4 text-right">
                           <button onClick={() => toggleJobStatus('agent', j.id)} className="text-stone-400 hover:text-stone-600 p-2"><Settings size={16}/></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
       </div>
    </div>
  );

  const FinanceSection = () => (
    <div className="space-y-8 animate-in fade-in">
       {/* Commissions */}
       <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-stone-800 flex items-center gap-2"><DollarSign size={20}/> エージェント手数料管理</h3>
             <button className="text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg font-bold hover:bg-stone-200 flex items-center gap-1">
                <Search size={12}/> 支払い履歴検索
             </button>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                   <tr>
                      <th className="p-4">取引ID</th>
                      <th className="p-4">エージェント</th>
                      <th className="p-4">決定候補者</th>
                      <th className="p-4 text-right">手数料額</th>
                      <th className="p-4">確定日</th>
                      <th className="p-4">状態</th>
                      <th className="p-4 text-right">請求書</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                   {finance.commissions.map(c => (
                      <tr key={c.id}>
                         <td className="p-4 font-mono text-stone-400">{c.id}</td>
                         <td className="p-4 font-bold">{c.agent}</td>
                         <td className="p-4">{c.candidate}</td>
                         <td className="p-4 text-right font-bold text-stone-800">¥{c.amount.toLocaleString()}</td>
                         <td className="p-4 text-stone-500">{c.date}</td>
                         <td className="p-4"><StatusBadge status={c.status} /></td>
                         <td className="p-4 text-right">
                            <button className="text-xs font-bold text-blue-600 hover:underline">DL</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* Ads */}
       <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-stone-800 flex items-center gap-2"><Megaphone size={20}/> 広告管理</h3>
             <button className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-stone-800 shadow">新規広告枠作成</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {finance.ads.map(ad => (
                <div key={ad.id} className={`bg-white p-4 rounded-xl border transition-colors shadow-sm flex justify-between items-center ${ad.status === 'active' ? 'border-emerald-200 shadow-emerald-50' : 'border-stone-200'}`}>
                   <div>
                      <div className="flex items-center gap-2">
                         <div className="font-bold text-stone-800">{ad.type}</div>
                         <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 rounded">{ad.id}</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1 mb-2">Client: <strong>{ad.client}</strong></div>
                      <div className="flex gap-3 text-xs text-stone-600 bg-stone-50 p-2 rounded-lg">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-stone-400">Impression</span>
                            <span className="font-bold">{ad.impressions.toLocaleString()}</span>
                         </div>
                         <div className="w-px bg-stone-200"></div>
                         <div className="flex flex-col">
                            <span className="text-[10px] text-stone-400">CTR</span>
                            <span className="font-bold">{ad.ctr}</span>
                         </div>
                         <div className="w-px bg-stone-200"></div>
                         <div className="flex flex-col">
                            <span className="text-[10px] text-stone-400">Budget</span>
                            <span className="font-bold">¥{ad.budget.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={ad.status} />
                      <div className="flex gap-1">
                         <button 
                           onClick={() => toggleAdStatus(ad.id)}
                           className={`p-2 rounded-lg transition-colors ${ad.status === 'active' ? 'bg-stone-100 text-stone-500 hover:bg-stone-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                         >
                            {ad.status === 'active' ? <Power size={16}/> : <CheckCircle2 size={16}/>}
                         </button>
                         <button className="p-2 bg-stone-100 text-stone-500 rounded-lg hover:bg-stone-200"><Settings size={16}/></button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  const SystemSection = () => (
     <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Settings Panel */}
           <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Server size={18}/> 稼働設定</h3>
              <div className="space-y-4">
                 
                 {/* Maintenance Mode Toggle */}
                 <div className={`flex justify-between items-center p-4 rounded-xl border transition-all ${systemStatus.maintenance ? 'bg-red-50 border-red-100' : 'bg-stone-50 border-stone-100'}`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-full ${systemStatus.maintenance ? 'bg-red-100 text-red-600' : 'bg-stone-200 text-stone-500'}`}>
                          <AlertCircle size={20} />
                       </div>
                       <div>
                          <div className={`font-bold text-sm ${systemStatus.maintenance ? 'text-red-800' : 'text-stone-800'}`}>メンテナンスモード</div>
                          <div className="text-xs text-stone-500">ユーザーからのアクセスを遮断します</div>
                       </div>
                    </div>
                    <button 
                       onClick={() => setSystemStatus(p => ({ ...p, maintenance: !p.maintenance }))}
                       className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${systemStatus.maintenance ? 'bg-red-500' : 'bg-stone-300'}`}
                    >
                       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${systemStatus.maintenance ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>

                 {/* Registration Toggle */}
                 <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-stone-200 text-stone-500 rounded-full">
                          <UserPlus size={20} />
                       </div>
                       <div>
                          <div className="font-bold text-sm text-stone-800">新規登録の受付</div>
                          <div className="text-xs text-stone-500">一時的に新規ユーザー登録を停止</div>
                       </div>
                    </div>
                    <button 
                       onClick={() => setSystemStatus(p => ({ ...p, registration: !p.registration }))}
                       className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${systemStatus.registration ? 'bg-emerald-500' : 'bg-stone-300'}`}
                    >
                       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${systemStatus.registration ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>

              </div>
           </div>

           {/* Security Logs */}
           <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-stone-800 flex items-center gap-2"><Shield size={18}/> セキュリティログ</h3>
                 <span className="text-[10px] bg-stone-100 px-2 py-1 rounded text-stone-500">Realtime</span>
              </div>
              <div className="flex-1 bg-stone-900 rounded-xl p-4 overflow-y-auto custom-scrollbar font-mono text-xs max-h-64">
                 <div className="text-emerald-400 mb-1">[INFO] System check: OK</div>
                 <div className="text-stone-400 mb-1 border-b border-stone-800 pb-1">10:42:05 - Auto-scaling triggered (Load: 45%)</div>
                 <div className="text-emerald-400 mb-1">10:42:01 - Admin login success (IP: 192.168.1.1)</div>
                 <div className="text-amber-400 mb-1">09:15:33 - Failed login attempt: user_992 (3rd try)</div>
                 <div className="text-stone-400 mb-1">08:00:00 - Daily backup completed (Size: 4.2GB)</div>
                 <div className="text-stone-400 mb-1">02:00:00 - Batch job 'matching_score' started</div>
                 <div className="text-red-400 mb-1">01:30:00 - API Rate Limit Warning (Client: Service_B)</div>
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="text-stone-500 mb-1 opacity-50">00:00:00 - Log entry archive...</div>
                 ))}
              </div>
           </div>
        </div>
     </div>
  );

  return (
    <div className="flex h-screen bg-[#FAFAF9] pt-16 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-stone-200 flex-shrink-0 flex flex-col p-4">
         <div className="mb-8 px-2">
            <h2 className="text-xl font-black tracking-tight text-stone-900">Admin <span className="text-stone-400 font-light">Panel</span></h2>
         </div>
         <nav className="flex-1 space-y-1">
            <SidebarItem section="overview" icon={LayoutDashboard} label="ダッシュボード" />
            <SidebarItem section="users" icon={Users} label="ユーザー管理" />
            <SidebarItem section="jobs" icon={Briefcase} label="求人情報管理" />
            <SidebarItem section="finance" icon={DollarSign} label="収益・広告" />
            <SidebarItem section="system" icon={Settings} label="システム設定" />
         </nav>
         <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500">A</div>
            <div>
               <div className="text-xs font-bold text-stone-400">Logged in as</div>
               <div className="text-sm font-bold text-stone-800">Admin User</div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full">
         <PageHeader 
            title="システム管理" 
            subtitle="プラットフォーム全体の状況確認と設定"
            breadcrumbs={[{ label: '管理画面' }]}
            setView={setView}
            backgroundImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
         />
         
         <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h1 className="text-3xl font-bold text-stone-900 capitalize flex items-center gap-2">
                     {activeSection === 'overview' && 'システム稼働状況'}
                     {activeSection === 'users' && 'ユーザー管理'}
                     {activeSection === 'jobs' && '求人情報管理'}
                     {activeSection === 'finance' && '収益・広告管理'}
                     {activeSection === 'system' && 'システム設定'}
                  </h1>
                  <p className="text-stone-500 text-sm mt-1">
                     {activeSection === 'overview' && 'プラットフォーム全体のステータスを一目で確認できます。'}
                     {activeSection === 'users' && '求職者、企業、エージェントのアカウントを管理します。'}
                     {activeSection === 'jobs' && '公開中の求人情報の監視、停止、非公開求人の管理を行います。'}
                     {activeSection === 'finance' && 'エージェント手数料の請求状況と広告枠の管理を行います。'}
                     {activeSection === 'system' && 'メンテナンスモードの切替やログの確認を行います。'}
                  </p>
               </div>
               <div className="text-xs text-stone-400 font-mono flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
                  <Activity size={12} className="text-emerald-500 animate-pulse"/> 
                  Last updated: {new Date().toLocaleTimeString()}
               </div>
            </div>

            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'users' && <UserManagementSection />}
            {activeSection === 'jobs' && <JobManagementSection />}
            {activeSection === 'finance' && <FinanceSection />}
            {activeSection === 'system' && <SystemSection />}
         </div>
      </div>
    </div>
  );
};