import React, { useState } from 'react';
import { ViewState } from '../../types';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, TrendingUp, Mic, AlertCircle, Loader2, Building2, User, Users, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateField } from '../../utils/validation';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // パスワード強度チェック
  const getPasswordStrength = (pw: string): { level: number; label: string; color: string } => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: '弱い', color: 'bg-red-400' };
    if (score <= 2) return { level: 2, label: '普通', color: 'bg-amber-400' };
    if (score <= 3) return { level: 3, label: '強い', color: 'bg-emerald-400' };
    return { level: 4, label: 'とても強い', color: 'bg-emerald-600' };
  };
  const pwStrength = getPasswordStrength(formData.password);

  const validateSingleField = (name: string, value: string): string => {
    if (name === 'lastName' || name === 'firstName') return validateField(value, { required: true, maxLength: 20 });
    if (name === 'lastNameKana') return validateField(value, { required: true, pattern: /^[ぁ-ん\s]+$/, patternMessage: 'ひらがなで入力してください' });
    if (name === 'firstNameKana') return validateField(value, { required: true, pattern: /^[ぁ-ん\s]+$/, patternMessage: 'ひらがなで入力してください' });
    if (name === 'phone') return validateField(value, { required: true, pattern: /^0\d{9,10}$/, patternMessage: '0から始まる10〜11桁の数字で入力してください' });
    if (name === 'email') return validateField(value, { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: '正しいメールアドレスの形式で入力してください' });
    if (name === 'password') return validateField(value, { required: true, minLength: 8 });
    if (name === 'company_name' && formData.role === 'employer') return validateField(value, { required: true, maxLength: 100 });
    if (name === 'birthYear') {
      if (!value) return 'この項目は必須です';
      if (!/^\d{4}$/.test(value)) return '4桁の西暦で入力してください（例：1990）';
      const year = parseInt(value);
      if (year < 1900 || year > new Date().getFullYear() - 15) return '正しい生年を入力してください';
    }
    if (name === 'birthMonth') {
      if (!value) return 'この項目は必須です';
      const m = parseInt(value);
      if (isNaN(m) || m < 1 || m > 12) return '1〜12の数字で入力してください';
    }
    if (name === 'birthDay') {
      if (!value) return 'この項目は必須です';
      const d = parseInt(value);
      if (isNaN(d) || d < 1 || d > 31) return '1〜31の数字で入力してください';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (touched[name]) {
      const fieldError = validateSingleField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateSingleField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ['lastName', 'firstName', 'lastNameKana', 'firstNameKana', 'phone', 'email', 'password', 'birthYear', 'birthMonth', 'birthDay'];
    if (formData.role === 'employer') requiredFields.push('company_name');
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    let hasError = false;
    for (const field of requiredFields) {
      newTouched[field] = true;
      const val = formData[field as keyof typeof formData] as string;
      const err = validateSingleField(field, val);
      if (err) { newErrors[field] = err; hasError = true; }
    }
    if (formData.gender === 'unselected') { newErrors.gender = '性別を選択してください'; hasError = true; }
    setErrors(newErrors);
    setTouched(newTouched);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('入力内容に誤りがあります。各項目を確認してください');
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

  const inputClass = (name: string) =>
    `w-full px-4 py-3 rounded-xl border text-stone-800 text-sm transition-all outline-none ${
      errors[name]
        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-stone-200 bg-stone-50 hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
    }`;

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <div className="flex items-center gap-1.5 text-red-600 mt-1">
        <AlertCircle size={12} />
        <p className="text-xs">{errors[name]}</p>
      </div>
    ) : null;

  const FieldHint = ({ text }: { text: string }) => (
    <div className="flex items-center gap-1.5 text-stone-400 mt-1">
      <Info size={12} />
      <p className="text-xs">{text}</p>
    </div>
  );

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
        <div className="max-w-xl mx-auto p-8 lg:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">新規会員登録</h2>
            <p className="text-stone-500 text-sm">基本情報を入力して、あなたらしい働き方を見つけましょう。登録は<span className="font-bold text-stone-800">完全無料</span>、約1分で完了します。</p>
          </div>

          {/* ロール選択 */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-stone-700 block mb-1">アカウント種別<span className="text-red-500 ml-1 text-xs">必須</span></label>
            <p className="text-xs text-stone-400 mb-3">あなたの立場を選択してください</p>
            <div className="grid grid-cols-3 gap-3">
              {roleOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = formData.role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setFormData(prev => ({ ...prev, role: opt.value as 'seeker' | 'employer' | 'agent' })); setError(''); }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-stone-300'}`}
                  >
                    <Icon size={20} className={`mb-1 ${isSelected ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <div className={`text-xs font-bold ${isSelected ? 'text-emerald-700' : 'text-stone-600'}`}>{opt.label}</div>
                    <div className="text-xs text-stone-400 mt-0.5 leading-tight">{opt.desc}</div>
                    {isSelected && <CheckCircle2 size={14} className="text-emerald-500 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* サーバーエラー */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 企業名（企業アカウントのみ） */}
            {formData.role === 'employer' && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">企業名<span className="text-red-500 ml-1 text-xs">必須</span></label>
                <input
                  type="text" name="company_name" placeholder="株式会社トコトコ"
                  className={inputClass('company_name')}
                  value={formData.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <FieldError name="company_name" />
                {!errors.company_name && <FieldHint text="正式な法人名を入力してください（株式会社・有限会社等を含む）" />}
              </div>
            )}

            {/* 氏名 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">氏（漢字）<span className="text-red-500 ml-1 text-xs">必須</span></label>
                <input type="text" name="lastName" placeholder="山田" className={inputClass('lastName')} value={formData.lastName} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} />
                <FieldError name="lastName" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">名（漢字）<span className="text-red-500 ml-1 text-xs">必須</span></label>
                <input type="text" name="firstName" placeholder="太郎" className={inputClass('firstName')} value={formData.firstName} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} />
                <FieldError name="firstName" />
              </div>
            </div>

            {/* ふりがな */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">氏（ふりがな）<span className="text-red-500 ml-1 text-xs">必須</span></label>
                <input type="text" name="lastNameKana" placeholder="やまだ" className={inputClass('lastNameKana')} value={formData.lastNameKana} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} />
                <FieldError name="lastNameKana" />
                {!errors.lastNameKana && <FieldHint text="ひらがなで入力してください" />}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">名（ふりがな）<span className="text-red-500 ml-1 text-xs">必須</span></label>
                <input type="text" name="firstNameKana" placeholder="たろう" className={inputClass('firstNameKana')} value={formData.firstNameKana} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} />
                <FieldError name="firstNameKana" />
                {!errors.firstNameKana && <FieldHint text="ひらがなで入力してください" />}
              </div>
            </div>

            {/* 性別・生年月日 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">性別<span className="text-red-500 ml-1 text-xs">必須</span></label>
                <select
                  name="gender"
                  className={`${inputClass('gender')} appearance-none`}
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                >
                  <option value="unselected" disabled>選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他・回答しない</option>
                </select>
                <FieldError name="gender" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">生年月日<span className="text-red-500 ml-1 text-xs">必須</span></label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input type="text" name="birthYear" placeholder="1990" maxLength={4}
                      className={`w-full px-3 py-3 rounded-xl border text-stone-800 text-sm text-center transition-all outline-none ${errors.birthYear ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-stone-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'}`}
                      value={formData.birthYear} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} />
                  </div>
                  <span className="text-stone-400 text-xs flex-shrink-0">年</span>
                  <div className="w-14">
                    <input type="text" name="birthMonth" placeholder="1" maxLength={2}
                      className={`w-full px-2 py-3 rounded-xl border text-stone-800 text-sm text-center transition-all outline-none ${errors.birthMonth ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-stone-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'}`}
                      value={formData.birthMonth} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} />
                  </div>
                  <span className="text-stone-400 text-xs flex-shrink-0">月</span>
                  <div className="w-14">
                    <input type="text" name="birthDay" placeholder="1" maxLength={2}
                      className={`w-full px-2 py-3 rounded-xl border text-stone-800 text-sm text-center transition-all outline-none ${errors.birthDay ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-stone-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'}`}
                      value={formData.birthDay} onChange={handleChange} onBlur={handleBlur} disabled={isLoading} />
                  </div>
                  <span className="text-stone-400 text-xs flex-shrink-0">日</span>
                </div>
                {(errors.birthYear || errors.birthMonth || errors.birthDay) && (
                  <div className="flex items-center gap-1.5 text-red-600 mt-1">
                    <AlertCircle size={12} />
                    <p className="text-xs">{errors.birthYear || errors.birthMonth || errors.birthDay}</p>
                  </div>
                )}
                {!errors.birthYear && !errors.birthMonth && !errors.birthDay && (
                  <FieldHint text="例：1990年1月15日生まれ → 1990 / 1 / 15" />
                )}
              </div>
            </div>

            {/* 電話番号 */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">電話番号<span className="text-red-500 ml-1 text-xs">必須</span></label>
              <input
                type="tel" name="phone" placeholder="09012345678"
                className={inputClass('phone')}
                value={formData.phone} onChange={handleChange} onBlur={handleBlur} disabled={isLoading}
              />
              <FieldError name="phone" />
              {!errors.phone && <FieldHint text="ハイフンなし・半角数字で入力してください（例：09012345678）" />}
            </div>

            {/* メールアドレス */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">メールアドレス<span className="text-red-500 ml-1 text-xs">必須</span></label>
              <input
                type="text" inputMode="email" name="email" placeholder="example@tocotoco.jp"
                className={inputClass('email')}
                value={formData.email} onChange={handleChange} onBlur={handleBlur} disabled={isLoading}
              />
              <FieldError name="email" />
              {!errors.email && <FieldHint text="ログイン時に使用するメールアドレスです。確認メールが届きます" />}
            </div>

            {/* パスワード */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-stone-700">パスワード<span className="text-red-500 ml-1 text-xs">必須</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="8文字以上の半角英数字"
                  className={`${inputClass('password')} pr-12`}
                  value={formData.password} onChange={handleChange} onBlur={handleBlur} disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* パスワード強度バー */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength.level ? pwStrength.color : 'bg-stone-200'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${pwStrength.level <= 1 ? 'text-red-500' : pwStrength.level <= 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    パスワード強度：{pwStrength.label}
                  </p>
                </div>
              )}
              <FieldError name="password" />
              {!errors.password && <FieldHint text="英字・数字を組み合わせた8文字以上を推奨します。大文字や記号を含めるとより安全です" />}
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-3 mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 flex-shrink-0" />
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
