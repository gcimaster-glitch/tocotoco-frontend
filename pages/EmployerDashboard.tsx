import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CONFIG } from '../config';
import { ViewState } from '../types';
import {
  Building2, Briefcase, Users, LogOut, Plus, Eye, Edit3,
  CheckCircle2, Clock, XCircle, AlertCircle, Loader2, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';

interface EmployerDashboardProps {
  setView: (view: ViewState) => void;
}

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  work_style: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  application_count?: number;
}

interface JobApplication {
  id: string;
  job_title: string;
  applicant_name: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offered' | 'rejected';
  created_at: string;
}

const statusConfig = {
  active: { label: '公開中', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: '募集終了', color: 'bg-stone-100 text-stone-600' },
  draft: { label: '下書き', color: 'bg-amber-100 text-amber-700' },
};

const appStatusConfig = {
  pending: { label: '応募済み', color: 'bg-stone-100 text-stone-600', icon: Clock },
  reviewing: { label: '書類選考中', color: 'bg-blue-100 text-blue-700', icon: Eye },
  interview: { label: '面接調整中', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  offered: { label: '内定', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-600', icon: XCircle },
};

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ setView }) => {
  const { user, logout, getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'post'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [error, setError] = useState('');

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    job_type: '',
    work_style: 'fulltime',
    salary_min: '',
    salary_max: '',
    accommodations: '',
    disability_types: [] as string[],
    requirements: '',
  });

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/employer/jobs`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json() as { jobs: Job[] };
        setJobs(data.jobs || []);
      }
    } catch {
      setError('求人情報の取得に失敗しました');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/employer/applications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json() as { applications: JobApplication[] };
        setApplications(data.applications || []);
      }
    } catch {
      // エラーは無視
    } finally {
      setIsLoadingApps(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description || !jobForm.location || !jobForm.job_type) {
      setError('必須項目を入力してください');
      return;
    }
    setIsPosting(true);
    setError('');
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      });
      if (res.ok) {
        setPostSuccess(true);
        setJobForm({ title: '', description: '', location: '', job_type: '', work_style: 'fulltime', salary_min: '', salary_max: '', accommodations: '', disability_types: [], requirements: '' });
        fetchJobs();
        setTimeout(() => { setPostSuccess(false); setActiveTab('jobs'); }, 2000);
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error || '求人の投稿に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      await fetch(`${CONFIG.API_BASE_URL}/api/employer/applications/${appId}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchApplications();
    } catch {
      setError('ステータスの更新に失敗しました');
    }
  };

  const handleLogout = () => {
    logout();
    setView(ViewState.HOME);
  };

  const disabilityOptions = [
    { value: 'physical', label: '身体障がい' },
    { value: 'intellectual', label: '知的障がい' },
    { value: 'mental', label: '精神障がい' },
    { value: 'developmental', label: '発達障がい' },
    { value: 'other', label: 'その他' },
  ];

  const tabs = [
    { id: 'jobs', label: '求人一覧', icon: Briefcase },
    { id: 'applications', label: '応募者管理', icon: Users },
    { id: 'post', label: '求人を投稿', icon: Plus },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-stone-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-stone-900">{user?.company_name || user?.display_name}</p>
              <p className="text-xs text-stone-500">企業アカウント · {user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 text-sm transition-colors">
            <LogOut size={16} /> ログアウト
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500 mb-1">公開中の求人</p>
            <p className="text-2xl font-black text-stone-900">{jobs.filter(j => j.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500 mb-1">総応募数</p>
            <p className="text-2xl font-black text-stone-900">{applications.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500 mb-1">選考中</p>
            <p className="text-2xl font-black text-stone-900">{applications.filter(a => a.status === 'reviewing' || a.status === 'interview').length}</p>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* 求人一覧タブ */}
        {activeTab === 'jobs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-900">求人一覧</h2>
              <button onClick={() => setActiveTab('post')} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">
                <Plus size={14} /> 新規投稿
              </button>
            </div>
            {isLoadingJobs ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-stone-400" /></div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                <Briefcase size={40} className="text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">まだ求人がありません</p>
                <button onClick={() => setActiveTab('post')} className="mt-4 text-sm text-blue-600 hover:underline">求人を投稿する</button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => {
                  const sc = statusConfig[job.status] || statusConfig.draft;
                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-stone-900">{job.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>{sc.label}</span>
                        </div>
                        <p className="text-sm text-stone-500">{job.location} · {job.job_type}</p>
                        <p className="text-xs text-stone-400 mt-1">{new Date(job.created_at).toLocaleDateString('ja-JP')} 投稿</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {job.application_count !== undefined && (
                          <div className="text-center">
                            <p className="text-lg font-black text-stone-900">{job.application_count}</p>
                            <p className="text-xs text-stone-400">応募</p>
                          </div>
                        )}
                        <ChevronRight size={18} className="text-stone-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 応募者管理タブ */}
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-4">応募者管理</h2>
            {isLoadingApps ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-stone-400" /></div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                <Users size={40} className="text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">まだ応募者はいません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => {
                  const sc = appStatusConfig[app.status] || appStatusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <div key={app.id} className="bg-white rounded-2xl border border-stone-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-stone-900">{app.applicant_name}</p>
                          <p className="text-sm text-stone-500">{app.job_title}</p>
                          <p className="text-xs text-stone-400">{new Date(app.created_at).toLocaleDateString('ja-JP')} 応募</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${sc.color}`}>
                          <Icon size={12} /> {sc.label}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(['reviewing', 'interview', 'offered', 'rejected'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => handleUpdateAppStatus(app.id, s)}
                            disabled={app.status === s}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${app.status === s ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                          >
                            {appStatusConfig[s].label}に変更
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 求人投稿タブ */}
        {activeTab === 'post' && (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-4">求人を投稿する</h2>
            {postSuccess ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-emerald-200">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
                <p className="text-lg font-bold text-stone-900">求人を投稿しました！</p>
                <p className="text-sm text-stone-500 mt-1">求人一覧に反映されます</p>
              </div>
            ) : (
              <form onSubmit={handlePostJob} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600">求人タイトル<span className="text-red-500 ml-1">*</span></label>
                  <input
                    type="text" placeholder="例：事務スタッフ（障がい者雇用・週3日〜）" required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600">勤務地<span className="text-red-500 ml-1">*</span></label>
                    <input
                      type="text" placeholder="例：東京都渋谷区（在宅可）" required
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                      value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600">職種<span className="text-red-500 ml-1">*</span></label>
                    <input
                      type="text" placeholder="例：データ入力・事務" required
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                      value={jobForm.job_type} onChange={e => setJobForm({ ...jobForm, job_type: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600">雇用形態</label>
                    <select
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all appearance-none"
                      value={jobForm.work_style} onChange={e => setJobForm({ ...jobForm, work_style: e.target.value })}
                    >
                      <option value="fulltime">正社員</option>
                      <option value="parttime">パート・アルバイト</option>
                      <option value="contract">契約社員</option>
                      <option value="remote">在宅・リモート</option>
                      <option value="a-type">就労継続支援A型</option>
                      <option value="b-type">就労継続支援B型</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600">給与（月額・円）</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number" placeholder="180000"
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        value={jobForm.salary_min} onChange={e => setJobForm({ ...jobForm, salary_min: e.target.value })}
                      />
                      <span className="text-stone-400">〜</span>
                      <input
                        type="number" placeholder="250000"
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        value={jobForm.salary_max} onChange={e => setJobForm({ ...jobForm, salary_max: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600">対象障がい種別</label>
                  <div className="flex flex-wrap gap-2">
                    {disabilityOptions.map(opt => {
                      const isSelected = jobForm.disability_types.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const updated = isSelected
                              ? jobForm.disability_types.filter(d => d !== opt.value)
                              : [...jobForm.disability_types, opt.value];
                            setJobForm({ ...jobForm, disability_types: updated });
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600">仕事内容<span className="text-red-500 ml-1">*</span></label>
                  <textarea
                    rows={4} placeholder="具体的な業務内容を記載してください" required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
                    value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600">応募要件</label>
                  <textarea
                    rows={3} placeholder="必要なスキル・経験・資格など"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
                    value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600">提供できる配慮事項</label>
                  <textarea
                    rows={3} placeholder="例：週3日勤務可、在宅勤務可、通院のための中抜け可、バリアフリー対応"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none"
                    value={jobForm.accommodations} onChange={e => setJobForm({ ...jobForm, accommodations: e.target.value })}
                  />
                </div>
                <button
                  type="submit" disabled={isPosting}
                  className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPosting ? <><Loader2 size={20} className="animate-spin" /> 投稿中...</> : <><Plus size={20} /> 求人を投稿する</>}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
