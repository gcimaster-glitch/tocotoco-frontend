import React, { useState } from 'react';
import { ViewState } from '../../types';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';

interface LoginProps {
  setView: (view: ViewState) => void;
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ setView, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, authentication API call would happen here.
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white animate-in fade-in duration-500">
      
      {/* Left Column: Visuals (Reusing similar style for consistency but simpler for login) */}
      <div className="md:w-5/12 bg-stone-900 text-white relative overflow-hidden flex flex-col justify-center p-8 lg:p-12">
        {/* Background Effects */}
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
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="md:w-7/12 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md p-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">ログイン</h2>
            <p className="text-stone-500 text-sm">
              登録時のメールアドレスとパスワードを入力してください。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600">メールアドレス</label>
              <input 
                type="email" name="email" placeholder="example@tocotoco.jp" required
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                value={formData.email} onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-stone-600">パスワード</label>
                <a href="#" className="text-xs text-emerald-600 hover:underline">パスワードをお忘れですか？</a>
              </div>
              <div className="relative">
                <input 
                  type="password" name="password" placeholder="********" required
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all pr-10"
                  value={formData.password} onChange={handleChange}
                />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center gap-2 group mt-4">
              ログイン <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-8 border-t border-stone-100">
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