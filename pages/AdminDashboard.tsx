import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Building2, Briefcase, TrendingUp, AlertCircle, Settings,
  CheckCircle2, XCircle, Search, LayoutDashboard, Shield,
  Activity, RefreshCw, Loader2, MessageSquare
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';

interface Stats {
  users: number;
  seekers: number;
  employers: number;
  jobs: number;
  applications: number;
  posts: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  display_name: string;
  is_active: number;
  created_at: string;
}

interface AdminJob {
  id: string;
  title: string;
  company_name: string;
  job_type: string;
  status: string;
  created_at: string;
}

type AdminSection = 'overview' | 'users' | 'jobs';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch { /* ignore */ }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userRoleFilter) params.set('role', userRoleFilter);
      const res = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [token, userRoleFilter]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/jobs`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeSection === 'users') fetchUsers(); }, [activeSection, fetchUsers]);
  useEffect(() => { if (activeSection === 'jobs') fetchJobs(); }, [activeSection, fetchJobs]);

  const toggleUserStatus = async (userId: string, currentStatus: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ is_active: currentStatus === 0 }),
      });
      fetchUsers();
    } catch { /* ignore */ }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      fetchJobs();
    } catch { /* ignore */ }
  };

  const filteredUsers = users.filter(u =>
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'ダッシュボード', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'ユーザー管理', icon: <Users size={18} /> },
    { id: 'jobs', label: '求人管理', icon: <Briefcase size={18} /> },
  ];

  const ROLE_LABELS: Record<string, string> = {
    seeker: '求職者', employer: '企業', agent: '支援員', admin: '管理者'
  };
  const STATUS_COLORS: Record<string, string> = {
    published: 'text-emerald-600 bg-emerald-50', draft: 'text-stone-500 bg-stone-50',
    closed: 'text-stone-400 bg-stone-50', suspended: 'text-red-500 bg-red-50'
  };
  const STATUS_LABELS: Record<string, string> = {
    published: '公開中', draft: '下書き', closed: '終了', suspended: '停止中'
  };

  return (
    <div className="w-full">
      <PageHeader
        title="管理者ダッシュボード"
        subtitle="プラットフォーム全体の管理・監視"
        breadcrumbs={[{ label: '管理者ダッシュボード' }]}
      />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* サイドバー */}
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          {/* 概要 */}
          {activeSection === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">プラットフォーム概要</h2>
                <button onClick={fetchStats} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
                  <RefreshCw size={14} /> 更新
                </button>
              </div>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: '総ユーザー数', value: stats.users, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
                    { label: '求職者', value: stats.seekers, icon: <Shield size={20} />, color: 'bg-emerald-50 text-emerald-600' },
                    { label: '企業', value: stats.employers, icon: <Building2 size={20} />, color: 'bg-amber-50 text-amber-600' },
                    { label: '求人数', value: stats.jobs, icon: <Briefcase size={20} />, color: 'bg-purple-50 text-purple-600' },
                    { label: '応募数', value: stats.applications, icon: <TrendingUp size={20} />, color: 'bg-rose-50 text-rose-600' },
                    { label: '投稿数', value: stats.posts, icon: <MessageSquare size={20} />, color: 'bg-teal-50 text-teal-600' },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-2xl border border-stone-100 p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="text-2xl font-bold text-stone-800">{item.value.toLocaleString()}</div>
                      <div className="text-sm text-stone-500 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-emerald-500" />
                </div>
              )}

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={18} className="text-amber-600" />
                  <span className="font-bold text-amber-700">セキュリティ情報</span>
                </div>
                <p className="text-sm text-amber-600">
                  管理者ページへのアクセスはすべてサーバー側で検証されています。
                  ロール（admin）を持つユーザーのみがこのページにアクセスできます。
                </p>
              </div>
            </div>
          )}

          {/* ユーザー管理 */}
          {activeSection === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">ユーザー管理</h2>
                <button onClick={fetchUsers} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
                  <RefreshCw size={14} /> 更新
                </button>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="名前・メールで検索..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">全ロール</option>
                  <option value="seeker">求職者</option>
                  <option value="employer">企業</option>
                  <option value="agent">支援員</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-stone-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">名前</th>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">メール</th>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">ロール</th>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">ステータス</th>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-stone-800">{user.display_name || '—'}</td>
                          <td className="px-4 py-3 text-stone-500">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                              {ROLE_LABELS[user.role] || user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.is_active ? (
                              <span className="flex items-center gap-1 text-emerald-600 text-xs"><CheckCircle2 size={12} /> 有効</span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle size={12} /> 停止</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                                user.is_active
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {user.is_active ? '停止' : '有効化'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-stone-400">ユーザーが見つかりません</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 求人管理 */}
          {activeSection === 'jobs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">求人管理</h2>
                <button onClick={fetchJobs} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
                  <RefreshCw size={14} /> 更新
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-stone-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">求人タイトル</th>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">企業名</th>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">ステータス</th>
                        <th className="text-left px-4 py-3 font-medium text-stone-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {jobs.map(job => (
                        <tr key={job.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-stone-800">{job.title}</td>
                          <td className="px-4 py-3 text-stone-500">{job.company_name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status] || 'bg-stone-50 text-stone-500'}`}>
                              {STATUS_LABELS[job.status] || job.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {job.status !== 'published' && (
                                <button
                                  onClick={() => updateJobStatus(job.id, 'published')}
                                  className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium"
                                >
                                  公開
                                </button>
                              )}
                              {job.status !== 'suspended' && (
                                <button
                                  onClick={() => updateJobStatus(job.id, 'suspended')}
                                  className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                                >
                                  停止
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {jobs.length === 0 && (
                    <div className="text-center py-8 text-stone-400">
                      <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                      <p>求人がありません</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
