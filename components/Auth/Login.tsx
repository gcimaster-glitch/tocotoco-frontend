import React, { useState } from 'react';
import { ViewState } from '../../types';
import { Sparkles, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateField } from '../../utils/validation';

interface LoginProps {
  setView: (view: ViewState) => void;
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ setView, onLogin }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateSingleField = (name: string, value: string): string => {
    if (name === 'email') {
      return validateField(value, {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: '正しいメールアドレスの形式で入力してください',
      });
    }
    if (name === 'password') {
      return validateField(value, { required: true, minLength: 8 });
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (touched[name as keyof typeof touched]) {
      const fieldError = validateSingleField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateSingleField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = (): boolean => {
    const emailError = validateSingleField('email', formData.email);
    const passwordError = validateSingleField('password', formData.password);
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      onLogin();
    } else {
      setError(result.error || 'ログインに失敗しました');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white animate-in fade-in duration-500">
      
      {/* 左カラム：ビジュアル */}
      <div className="md:w-5/12 bg-stone-900 text-white relative overflow-hidden flex flex-col justify-center p-8 lg:p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-stone-800 via-stone-900 to-black"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/30 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 border border-stone-700 bg-stone-800/50 backdrop-blur px-3 py-1 rounded-full text-stone-300 text-xs font-bold mb-6">
            <Sparkles size={14} className="text-emerald-400" /> Welcome Back
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
            Tocotoco
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed max-w-md">
            障がい者のための就労支援プラットフォーム。<br/>
            自分の足で、自分のペースで歩く。
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-stone-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-xs font-bold">1</span>
              </div>
              <span>メールアドレスとパスワードを入力</span>
            </div>
            <div className="flex items-center gap-3 text-stone-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-xs font-bold">2</span>
              </div>
              <span>「ログイン」ボタンをクリック</span>
            </div>
            <div className="flex items-center gap-3 text-stone-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-xs font-bold">3</span>
              </div>
              <span>マイページで求人検索・応募を開始</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右カラム：ログインフォーム */}
      <div className="md:w-7/12 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">ログイン</h2>
            <p className="text-stone-500 text-sm">
              登録時のメールアドレスとパスワードを入力してください。
            </p>
          </div>

          {/* サーバーエラー */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  メールアドレスまたはパスワードをご確認ください。
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* メールアドレス */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                メールアドレス
                <span className="text-red-500 text-xs">必須</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="example@tocotoco.jp"
                className={`w-full px-4 py-3 rounded-xl border text-stone-800 text-sm transition-all outline-none ${
                  errors.email
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-stone-200 bg-stone-50 hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                }`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email ? (
                <div className="flex items-center gap-1.5 text-red-600">
                  <AlertCircle size={13} />
                  <p className="text-xs">{errors.email}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Info size={13} />
                  <p className="text-xs">登録時に使用したメールアドレスを入力してください</p>
                </div>
              )}
            </div>

            {/* パスワード */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                パスワード
                <span className="text-red-500 text-xs">必須</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="8文字以上"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-stone-800 text-sm transition-all outline-none ${
                    errors.password
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  autoComplete="current-password"
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
              {errors.password ? (
                <div className="flex items-center gap-1.5 text-red-600">
                  <AlertCircle size={13} />
                  <p className="text-xs">{errors.password}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Info size={13} />
                  <p className="text-xs">登録時に設定したパスワード（8文字以上）を入力してください</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center gap-2 group mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 size={20} className="animate-spin" /> ログイン中...</>
              ) : (
                <>ログイン <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="text-center pt-6 border-t border-stone-100">
              <p className="text-sm text-stone-500 mb-4">アカウントをお持ちでない方</p>
              <button 
                type="button"
                onClick={() => setView(ViewState.REGISTER)}
                className="w-full bg-white border-2 border-stone-200 text-stone-700 py-3 rounded-xl font-bold hover:bg-stone-50 transition-colors"
              >
                新規会員登録（無料）
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
