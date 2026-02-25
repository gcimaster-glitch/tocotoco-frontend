import React, { useState } from 'react';
import { ViewState } from '../../types';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, TrendingUp, Mic } from 'lucide-react';

interface RegisterProps {
  setView: (view: ViewState) => void;
  onRegister: () => void;
}

export const Register: React.FC<RegisterProps> = ({ setView, onRegister }) => {
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
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validation and API call would happen here.
    onRegister();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white animate-in fade-in duration-500">
      
      {/* Left Column: Advertisement / Visuals */}
      <div className="md:w-5/12 bg-stone-900 text-white relative overflow-hidden flex flex-col justify-between p-8 lg:p-12">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

        <div className="relative z-10 mt-10">
          <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold mb-6">
            <Sparkles size={14} /> Disability Employment Platform
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
            そのキャリアに、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              安心と評価を。
            </span>
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed">
            トコトコ (Tocotoco) は、あなたの「働きたい」を応援する<br/>
            障がい者雇用特化型プラットフォームです。
          </p>
        </div>

        <div className="relative z-10 space-y-6 my-12">
          <div className="flex items-start gap-4">
            <div className="bg-stone-800 p-3 rounded-xl text-emerald-400 border border-stone-700">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">配慮条件でマッチング</h3>
              <p className="text-stone-400 text-sm">通院、在宅、時短など、あなたに必要な配慮事項を理解してくれる企業と出会えます。</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-stone-800 p-3 rounded-xl text-blue-400 border border-stone-700">
              <Mic size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI面接で選考パス</h3>
              <p className="text-stone-400 text-sm">24時間受験可能なAI一次面接で、緊張せずにあなたの良さを伝えられます。</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-stone-800 p-3 rounded-xl text-amber-400 border border-stone-700">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">匿名スカウト</h3>
              <p className="text-stone-400 text-sm">個人情報を守りながら、企業からのスカウトを受け取れます。</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-stone-500">
          &copy; 2024 General Incorporated Association National Employment Co-creation Center.
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="md:w-7/12 overflow-y-auto">
        <div className="max-w-xl mx-auto p-8 lg:p-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">新規会員登録</h2>
            <p className="text-stone-500 text-sm">
              基本情報を入力して、あなたらしい働き方を見つけましょう。<br/>
              登録は<span className="font-bold text-stone-800">完全無料</span>、約1分で完了します。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">氏（漢字）<span className="text-red-500 ml-1">*</span></label>
                <input 
                  type="text" name="lastName" placeholder="山田" required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  value={formData.lastName} onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">名（漢字）<span className="text-red-500 ml-1">*</span></label>
                <input 
                  type="text" name="firstName" placeholder="太郎" required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  value={formData.firstName} onChange={handleChange}
                />
              </div>
            </div>

            {/* Kana */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">氏（ふりがな）<span className="text-red-500 ml-1">*</span></label>
                <input 
                  type="text" name="lastNameKana" placeholder="やまだ" required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  value={formData.lastNameKana} onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600">名（ふりがな）<span className="text-red-500 ml-1">*</span></label>
                <input 
                  type="text" name="firstNameKana" placeholder="たろう" required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  value={formData.firstNameKana} onChange={handleChange}
                />
              </div>
            </div>

            {/* Gender & Birthdate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600">性別<span className="text-red-500 ml-1">*</span></label>
                  <select 
                    name="gender" required
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all appearance-none"
                    value={formData.gender} onChange={handleChange}
                  >
                    <option value="unselected" disabled>選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600">生年月日<span className="text-red-500 ml-1">*</span></label>
                  <div className="flex gap-2">
                    <input type="text" name="birthYear" placeholder="1990" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-stone-900" onChange={handleChange} />
                    <input type="text" name="birthMonth" placeholder="1" className="w-16 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-stone-900" onChange={handleChange} />
                    <input type="text" name="birthDay" placeholder="1" className="w-16 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-stone-900" onChange={handleChange} />
                  </div>
               </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600">電話番号（ハイフンなし）<span className="text-red-500 ml-1">*</span></label>
              <input 
                type="tel" name="phone" placeholder="09012345678" required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                value={formData.phone} onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600">メールアドレス<span className="text-red-500 ml-1">*</span></label>
              <input 
                type="email" name="email" placeholder="example@tocotoco.jp" required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                value={formData.email} onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600">パスワード<span className="text-red-500 ml-1">*</span></label>
              <input 
                type="password" name="password" placeholder="8文字以上の半角英数字" required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                value={formData.password} onChange={handleChange}
              />
            </div>

            <div className="pt-4">
              <div className="flex items-start gap-3 mb-6">
                 <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                 <label htmlFor="terms" className="text-xs text-stone-500 leading-relaxed">
                    <button type="button" onClick={() => setView(ViewState.TERMS)} className="text-stone-900 underline hover:no-underline font-bold">利用規約</button> および <button type="button" onClick={() => setView(ViewState.PRIVACY)} className="text-stone-900 underline hover:no-underline font-bold">プライバシーポリシー</button> に同意します。<br/>
                    また、就労支援サービスへの登録に同意します。
                 </label>
              </div>

              <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center gap-2 group">
                同意して登録する <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="text-center pt-6 border-t border-stone-100">
              <p className="text-sm text-stone-500 mb-2">すでにアカウントをお持ちの方</p>
              <button 
                type="button"
                onClick={() => setView(ViewState.LOGIN)}
                className="text-stone-900 font-bold border border-stone-300 px-6 py-2 rounded-lg hover:bg-stone-50 text-sm"
              >
                ログインはこちら
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};