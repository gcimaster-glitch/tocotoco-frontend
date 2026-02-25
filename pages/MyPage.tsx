import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CONFIG } from '../config';
import { ViewState } from '../types';
import {
  User, Briefcase, FileText, Settings, LogOut, ChevronRight,
  CheckCircle2, Clock, XCircle, AlertCircle, Loader2, Edit3, Save, Info
} from 'lucide-react';

interface MyPageProps {
  setView: (view: ViewState) => void;
}

interface Application {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offered' | 'rejected';
  created_at: string;
}

interface SeekerProfile {
  disability_type?: string;
  disability_grade?: string;
  support_needs?: string;
  desired_job_type?: string;
  desired_work_style?: string;
  desired_location?: string;
  self_pr?: string;
  accommodations?: string;
}

const statusConfig = {
  pending: { label: '応募済み', color: 'bg-stone-100 text-stone-600', icon: Clock },
  reviewing: { label: '書類選考中', color: 'bg-blue-100 text-blue-700', icon: FileText },
  interview: { label: '面接調整中', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  offered: { label: '内定', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-600', icon: XCircle },
};

export const MyPage: React.FC<MyPageProps> = ({ setView }) => {
  const { user, logout, getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'profile' | 'settings'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<SeekerProfile>({});
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchProfile();
  }, []);

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/applications/my`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json() as { applications: Application[] };
        setApplications(data.applications || []);
      }
    } catch {
      setError('応募履歴の取得に失敗しました');
    } finally {
      setIsLoadingApps(false);
    }
  };

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/profile`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json() as { profile: SeekerProfile };
        setProfile(data.profile || {});
      }
    } catch {
      // プロフィール未設定の場合は空のまま
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (profile.self_pr && profile.self_pr.length > 1000) {
      newErrors.self_pr = '1000文字以内で入力してください';
    }
    if (profile.accommodations && profile.accommodations.length > 500) {
      newErrors.accommodations = '500文字以内で入力してください';
    }
    if (profile.desired_job_type && profile.desired_job_type.length > 100) {
      newErrors.desired_job_type = '100文字以内で入力してください';
    }
    if (profile.desired_location && profile.desired_location.length > 100) {
      newErrors.desired_location = '100文字以内で入力してください';
    }
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfile()) return;
    setIsSavingProfile(true);
    setError('');
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } else {
        setError('プロフィールの保存に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    setView(ViewState.HOME);
  };

  const tabs = [
    { id: 'applications', label: '応募履歴', icon: Briefcase },
    { id: 'profile', label: 'プロフィール', icon: User },
    { id: 'settings', label: '設定', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-stone-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-stone-900">{user?.display_name}</p>
              <p className="text-xs text-stone-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 text-sm transition-colors">
            <LogOut size={16} /> ログアウト
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* タブ */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* 応募履歴タブ */}
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-4">応募履歴</h2>
            {isLoadingApps ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-stone-400" /></div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                <Briefcase size={40} className="text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">まだ応募した求人はありません</p>
                <button onClick={() => setView(ViewState.JOB_SEARCH)} className="mt-4 text-sm text-emerald-600 hover:underline">求人を探す</button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => {
                  const sc = statusConfig[app.status] || statusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <div key={app.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-stone-900">{app.job_title}</p>
                        <p className="text-sm text-stone-500">{app.company_name} · {app.location}</p>
                        <p className="text-xs text-stone-400 mt-1">{new Date(app.created_at).toLocaleDateString('ja-JP')} 応募</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${sc.color}`}>
                        <Icon size={12} /> {sc.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* プロフィールタブ */}
        {activeTab === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-900">プロフィール</h2>
              <button
                onClick={handleProfileSave}
                disabled={isSavingProfile}
                className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors disabled:opacity-60"
              >
                {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : profileSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {profileSaved ? '保存しました' : '保存する'}
              </button>
            </div>
            {isLoadingProfile ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-stone-400" /></div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">

                {/* 障がい情報 */}
                <div className="pb-4 border-b border-stone-100">
                  <h3 className="text-sm font-bold text-stone-700 mb-1">障がい情報</h3>
                  <p className="text-xs text-stone-400">求人マッチングに使用されます。入力することでより適切な求人が表示されます</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                      障がい種別
                      <span className="text-stone-400 text-xs font-normal">任意</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm transition-all outline-none hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 appearance-none"
                      value={profile.disability_type || ''}
                      onChange={e => setProfile({ ...profile, disability_type: e.target.value })}
                    >
                      <option value="">選択してください</option>
                      <option value="physical">身体障がい</option>
                      <option value="intellectual">知的障がい</option>
                      <option value="mental">精神障がい</option>
                      <option value="developmental">発達障がい</option>
                      <option value="other">その他</option>
                    </select>
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <Info size={12} />
                      <p className="text-xs">障がい者手帳に記載の種別を選択してください</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                      障がい等級
                      <span className="text-stone-400 text-xs font-normal">任意</span>
                    </label>
                    <input
                      type="text" placeholder="例：2級"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm transition-all outline-none hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      value={profile.disability_grade || ''}
                      onChange={e => setProfile({ ...profile, disability_grade: e.target.value })}
                    />
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <Info size={12} />
                      <p className="text-xs">障がい者手帳に記載の等級を入力してください（例：2級、A判定）</p>
                    </div>
                  </div>
                </div>

                {/* 希望勤務条件 */}
                <div className="pb-4 border-b border-stone-100 pt-2">
                  <h3 className="text-sm font-bold text-stone-700 mb-1">希望勤務条件</h3>
                  <p className="text-xs text-stone-400">希望する働き方を入力することで、より適切な求人が表示されます</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                      希望職種
                      <span className="text-stone-400 text-xs font-normal">任意</span>
                    </label>
                    <input
                      type="text" placeholder="例：事務・データ入力"
                      className={`w-full px-4 py-3 rounded-xl border text-stone-800 text-sm transition-all outline-none ${
                        profileErrors.desired_job_type ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-stone-50 hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                      }`}
                      value={profile.desired_job_type || ''}
                      onChange={e => setProfile({ ...profile, desired_job_type: e.target.value })}
                    />
                    {profileErrors.desired_job_type ? (
                      <div className="flex items-center gap-1.5 text-red-600">
                        <AlertCircle size={12} />
                        <p className="text-xs">{profileErrors.desired_job_type}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Info size={12} />
                        <p className="text-xs">希望する職種を複数入力できます（例：事務・データ入力、販売）</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                      希望勤務形態
                      <span className="text-stone-400 text-xs font-normal">任意</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm transition-all outline-none hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 appearance-none"
                      value={profile.desired_work_style || ''}
                      onChange={e => setProfile({ ...profile, desired_work_style: e.target.value })}
                    >
                      <option value="">選択してください</option>
                      <option value="fulltime">正社員</option>
                      <option value="parttime">パート・アルバイト</option>
                      <option value="contract">契約社員</option>
                      <option value="remote">在宅・リモート</option>
                      <option value="a-type">就労継続支援A型</option>
                      <option value="b-type">就労継続支援B型</option>
                    </select>
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <Info size={12} />
                      <p className="text-xs">希望する雇用形態を選択してください</p>
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                      希望勤務地
                      <span className="text-stone-400 text-xs font-normal">任意</span>
                    </label>
                    <input
                      type="text" placeholder="例：東京都、在宅可"
                      className={`w-full px-4 py-3 rounded-xl border text-stone-800 text-sm transition-all outline-none ${
                        profileErrors.desired_location ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-stone-50 hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                      }`}
                      value={profile.desired_location || ''}
                      onChange={e => setProfile({ ...profile, desired_location: e.target.value })}
                    />
                    {profileErrors.desired_location ? (
                      <div className="flex items-center gap-1.5 text-red-600">
                        <AlertCircle size={12} />
                        <p className="text-xs">{profileErrors.desired_location}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Info size={12} />
                        <p className="text-xs">希望する勤務地や都道府県を入力してください（例：東京都渋谷区、全国可）</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 配慮事項・自己PR */}
                <div className="pb-4 border-b border-stone-100 pt-2">
                  <h3 className="text-sm font-bold text-stone-700 mb-1">配慮事項・自己PR</h3>
                  <p className="text-xs text-stone-400">具体的に記載することで、マッチング精度が向上します</p>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                    必要な支援・配慮事項
                    <span className="text-stone-400 text-xs font-normal">任意</span>
                  </label>
                  <textarea
                    rows={3} placeholder="例：週３日勤務、通院のための中抜け可、静かな環境での作業"
                    className={`w-full px-4 py-3 rounded-xl border text-stone-800 text-sm transition-all outline-none resize-none ${
                      profileErrors.accommodations ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-stone-50 hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                    }`}
                    value={profile.accommodations || ''}
                    onChange={e => setProfile({ ...profile, accommodations: e.target.value })}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    {profileErrors.accommodations ? (
                      <div className="flex items-center gap-1.5 text-red-600">
                        <AlertCircle size={12} />
                        <p className="text-xs">{profileErrors.accommodations}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Info size={12} />
                        <p className="text-xs">必要な配慮を具体的に記載することで、就労定着率が向上します</p>
                      </div>
                    )}
                    <span className="text-xs text-stone-400">{(profile.accommodations || '').length}/500</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                    自己PR
                    <span className="text-stone-400 text-xs font-normal">任意</span>
                  </label>
                  <textarea
                    rows={5} placeholder="あなたの強みや経験を入力してください。例：前職での経験、得意なこと、就労に向けた目標など"
                    className={`w-full px-4 py-3 rounded-xl border text-stone-800 text-sm transition-all outline-none resize-none ${
                      profileErrors.self_pr ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-stone-50 hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                    }`}
                    value={profile.self_pr || ''}
                    onChange={e => setProfile({ ...profile, self_pr: e.target.value })}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    {profileErrors.self_pr ? (
                      <div className="flex items-center gap-1.5 text-red-600">
                        <AlertCircle size={12} />
                        <p className="text-xs">{profileErrors.self_pr}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Info size={12} />
                        <p className="text-xs">自己PRは応募書類に自動反映されます。具体的なエピソードを含めると強い印象を与えられます</p>
                      </div>
                    )}
                    <span className="text-xs text-stone-400">{(profile.self_pr || '').length}/1000</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 設定タブ */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-4">設定</h2>
            <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit3 size={18} className="text-stone-400" />
                  <div>
                    <p className="font-medium text-stone-900">表示名</p>
                    <p className="text-sm text-stone-500">{user?.display_name}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-stone-400" />
                  <div>
                    <p className="font-medium text-stone-900">メールアドレス</p>
                    <p className="text-sm text-stone-500">{user?.email}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
              </div>
              <div className="p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  <LogOut size={18} /> ログアウト
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
