import React, { useState } from 'react';
import { ViewState } from '../../types';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, TrendingUp, Mic, AlertCircle, Loader2, Building2, User, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterProps {
  setView: (view: ViewState) => void;
  onRegister: () => void;
}

export const Register: React.FC<RegisterProps> = ({ setView, onRegister }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    gender: 'unselected',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    phone: '',
    email: '',
    password: '',
    role: 'seeker' as 'seeker' | 'employer' | 'agent',
    company_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }
    if (formData.role === 'employer' && !formData.company_name.trim()) {
      setError('企業名を入力してください');
      return;
    }
    setIsLoading(true);
    setError('');
    const displayName = `${formData.lastName} ${formData.firstName}`.trim() || formData.email.split('@')[0];
    const result = await register({
      email: formData.email,
      password: formData.password,
      role: formData.role,
      display_name: displayName,
      company_name: formData.role === 'employer' ? formData.company_name : undefined,
    });
    if (result.success) {
      onRegister();
    } else {
      setError(result.error || '登録に失敗しました');
    }
    setIsLoading(false);
  };

  const roleOptions = [
    { value: 'seeker', label: '求職者', desc: '仕事を探している方', icon: User, color: 'emerald' },
    { value: 'employer', label: '企業', desc: '採用担当・人事の方', icon: Building2, color: 'blue' },
    { value: 'agent', label: '就労支援員', desc: '支援機関・エージェントの方', icon: Users, color: 'amber' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white animate-in fade-in duration-500">
      {/* 左カラム：ビジュアル */}
      <div className="md:w-5/12 bg-stone-900 text-white relative overflow-hidden flex flex-col justify-between p-8 lg:p-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 mt-10">
          <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold mb-6">
            <Sparkles size={14} /> Disability Employment Platform
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
            そのキャリアに、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">安心と評価を。</span>
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed">
            トコトコ (Tocotoco) は、あなたの「働きたい」を応援する<br/>障がい者雇用特化型プラットフォームです。
          </p>
        </div>
        <div className="relative z-10 space-y-6 my-12">
          <div className="flex items-start gap-4">
            <div className="bg-stone-800 p-3 rounded-xl text-emerald-400 border border-stone-700"><TrendingUp size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">配慮条件でマッチング</h3>
              <p className="text-stone-400 text-sm">通院、在宅、時短など、必要な配慮事項を理解してくれる企業と出会えます。</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-stone-800 p-3 rounded-xl text-blue-400 border border-stone-700"><Mic size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">AI面接で選考パス</h3>
              <p className="text-stone-400 text-sm">24時間受験可能なAI一次面接で、緊張せずにあなたの良さを伝えられます。</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-stone-800 p-3 rounded-xl text-amber-400 border border-stone-700"><ShieldCheck size={24} /></div>
            <div>
              <h3 className="font-bold text-lg">匿名スカウト</h3>
              <p className="text-stone-400 text-sm">個人情報を守りながら、企業からのスカウトを受け取れます。</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-xs text-stone-500">&copy; 2024 General Incorporated Association National Employment Co-creation Center.</div>
      </div>

      {/* 右カラム：登録フォーム */}
      <div className="md:w-7/12 overflow-y-auto">
        <div className="max-w-xl mx-auto p-8 lg:p-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">新規会員登録</h2>
            <p className="text-stone-500 text-sm">基本情報を入力して、あなたらしい働き方を見つけましょう。登録は<span className="font-bold text-stone-800">完全無料</span>、約1分で完了します。</p>
          </div>

          {/* ロール選択 */}
          <div className="mb-8">
            <label className="text-xs font-bold text-stone-600 block mb-3">アカウント種別<span className="text-red-500 ml-1">*</span></label>
            <div className="grid grid-cols-3 gap-3">
              {roleOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = formData.role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setFormData({ ...formData, role: opt.value as 'seeker' | 'employer' | 'agent' }); setError(''); }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}
                  >
                    <Icon size={20} className={`mb-1 ${isSelected ? 'text-stone-900' : 'text-stone-400'}`} />
                    <div className={`text-xs font-bold ${isSelected ? 'text-stone-900' : 'text-stone-600'}`}>{opt.label}</div>
                    <div className="text-xs text-stone-400 mt-0.5 leading-tight">{opt.desc}</div>
                    {isSelected && <CheckCircle2 size={14} className="text-emerald-500 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 企業名（企業アカウントのみ） */}
            {formData.role === 'employer' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">企業名<span className="text-red-500 ml-1">*</span></label>
                <input
                  type="text" name="company_name" placeholder="株式会社トコトコ" required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  value={formData.company_name} onChange={handleChange} disabled={isLoading}
                />
              </div>
            )}

            {/* 氏名 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">氏（漢字）<span className="text-red-500 ml-1">*</span></label>
                <input type="text" name="lastName" placeholder="山田" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.lastName} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">名（漢字）<span className="text-red-500 ml-1">*</span></label>
                <input type="text" name="firstName" placeholder="太郎" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.firstName} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            {/* ふりがな */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">氏（ふりがな）<span className="text-red-500 ml-1">*</span></label>
                <input type="text" name="lastNameKana" placeholder="やまだ" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.lastNameKana} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">名（ふりがな）<span className="text-red-500 ml-1">*</span></label>
                <input type="text" name="firstNameKana" placeholder="たろう" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.firstNameKana} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            {/* 性別・生年月日 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">性別<span className="text-red-500 ml-1">*</span></label>
                <select name="gender" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all appearance-none" value={formData.gender} onChange={handleChange} disabled={isLoading}>
                  <option value="unselected" disabled>選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">生年月日<span className="text-red-500 ml-1">*</span></label>
                <div className="flex gap-2">
                  <input type="text" name="birthYear" placeholder="1990" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-stone-900" onChange={handleChange} disabled={isLoading} />
                  <input type="text" name="birthMonth" placeholder="1" className="w-16 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-stone-900" onChange={handleChange} disabled={isLoading} />
                  <input type="text" name="birthDay" placeholder="1" className="w-16 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-stone-900" onChange={handleChange} disabled={isLoading} />
                </div>
              </div>
            </div>

            {/* 電話番号 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600">電話番号（ハイフンなし）<span className="text-red-500 ml-1">*</span></label>
              <input type="tel" name="phone" placeholder="09012345678" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.phone} onChange={handleChange} disabled={isLoading} />
            </div>

            {/* メールアドレス */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600">メールアドレス<span className="text-red-500 ml-1">*</span></label>
              <input type="email" name="email" placeholder="example@tocotoco.jp" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.email} onChange={handleChange} disabled={isLoading} />
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600">パスワード<span className="text-red-500 ml-1">*</span></label>
              <input type="password" name="password" placeholder="8文字以上の半角英数字" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={formData.password} onChange={handleChange} disabled={isLoading} />
              <p className="text-xs text-stone-400">英字・数字を組み合わせた8文字以上のパスワードを設定してください</p>
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-3 mb-6">
                <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                <label htmlFor="terms" className="text-xs text-stone-500 leading-relaxed">
                  <button type="button" onClick={() => setView(ViewState.TERMS)} className="text-stone-900 underline hover:no-underline font-bold">利用規約</button> および <button type="button" onClick={() => setView(ViewState.PRIVACY)} className="text-stone-900 underline hover:no-underline font-bold">プライバシーポリシー</button> に同意します。<br/>
                  また、就労支援サービスへの登録に同意します。
                </label>
              </div>
              <button
                type="submit" disabled={isLoading}
                className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> 登録中...</>
                ) : (
                  <>同意して登録する <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>

            <div className="text-center pt-6 border-t border-stone-100">
              <p className="text-sm text-stone-500 mb-2">すでにアカウントをお持ちの方</p>
              <button type="button" onClick={() => setView(ViewState.LOGIN)} className="text-stone-900 font-bold border border-stone-300 px-6 py-2 rounded-lg hover:bg-stone-50 text-sm">
                ログインはこちら
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
