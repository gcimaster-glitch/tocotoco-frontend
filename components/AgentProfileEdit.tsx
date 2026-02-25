import React, { useState, useRef } from 'react';
import { ViewState, AgentProfile, KYCStatus } from '../types';
import { PageHeader } from './PageHeader';
import { Building2, Save, Upload, Tag, Star, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { startVerificationSession } from '../services/kycService';
import { CONFIG } from '../config';

interface AgentProfileEditProps {
  setView: (view: ViewState) => void;
}

export const AgentProfileEdit: React.FC<AgentProfileEditProps> = ({ setView }) => {
  const [profile, setProfile] = useState<AgentProfile>({
    id: 'a1',
    agencyName: 'Global Career Partners',
    representative: '鈴木 一郎',
    specialtyTags: ['障がい者雇用', 'エンジニア', '定着率98%'],
    feeRate: '35%',
    description: 'IT業界を中心とした障がい者雇用支援に特化しています。エンジニアやデザイナーなど専門職の紹介に強みがあり、入社後の定着支援までワンストップでサポートします。',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    trackRecord: 120,
    kycStatus: 'unverified'
  });

  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const addTag = () => {
    if (tagInput && !profile.specialtyTags.includes(tagInput)) {
      setProfile({ ...profile, specialtyTags: [...profile.specialtyTags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setProfile({ ...profile, specialtyTags: profile.specialtyTags.filter(t => t !== tag) });
  };

  const handleSave = () => {
    alert('プロフィールを保存しました。\nこの内容は採用企業向けのエージェント一覧に表示されます。');
    setView(ViewState.AGENT_DASHBOARD);
  };

  const handleStartKYC = async () => {
    if (!CONFIG.ENABLE_KYC) return;
    const result = await startVerificationSession(profile.id);
    if (result === 'verified') {
        setProfile(prev => ({ ...prev, kycStatus: 'verified' }));
        alert("本人確認が完了しました！\n信頼性が向上し、スカウトの返信率が高まります。");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-[#FAFAF9] min-h-screen pb-20">
      <PageHeader 
        title="公開プロフィール編集" 
        subtitle="採用企業向けに公開される情報を編集します"
        breadcrumbs={[{ label: 'エージェント管理', view: ViewState.AGENT_DASHBOARD }, { label: 'プロフィール編集' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Edit Form */}
          <div className="lg:w-2/3 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            
            {/* KYC Section */}
            <div className="mb-8 p-4 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2 mb-1">
                        <ShieldCheck className={profile.kycStatus === 'verified' ? "text-emerald-500" : "text-stone-400"} size={18} /> 
                        本人確認・事業者確認
                    </h3>
                    <p className="text-xs text-stone-500">
                        {profile.kycStatus === 'verified' ? "確認済みです。認証バッジが表示されます。" : "未確認です。信頼性向上のため確認をお願いします。"}
                    </p>
                </div>
                {profile.kycStatus === 'verified' ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">Verified</span>
                ) : (
                    <button 
                        onClick={handleStartKYC}
                        disabled={!CONFIG.ENABLE_KYC}
                        className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-800 disabled:opacity-50"
                    >
                        確認を開始する
                    </button>
                )}
            </div>

            <h3 className="font-bold text-lg mb-6 border-b border-stone-100 pb-2">企業情報・PR</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                 <div 
                   className="w-24 h-24 bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-200 shrink-0 relative group cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}
                 >
                    <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Upload className="text-white" size={24} />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                    />
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-stone-500 mb-1">エージェント会社名 / 屋号</label>
                    <input 
                      name="agencyName"
                      value={profile.agencyName}
                      onChange={handleChange}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800"
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-stone-500 mb-1">担当者名（公開用）</label>
                 <input 
                   name="representative"
                   value={profile.representative}
                   onChange={handleChange}
                   className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl"
                 />
              </div>

              <div>
                 <label className="block text-xs font-bold text-stone-500 mb-1">標準手数料率（想定）</label>
                 <input 
                   name="feeRate"
                   value={profile.feeRate}
                   onChange={handleChange}
                   placeholder="例: 理論年収の35%"
                   className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl"
                 />
                 <p className="text-[10px] text-stone-400 mt-1">※実際の契約時に個別調整可能です。</p>
              </div>

              <div>
                 <label className="block text-xs font-bold text-stone-500 mb-1">強み・特徴タグ</label>
                 <div className="flex gap-2 mb-2">
                    <input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      placeholder="タグを入力してEnter"
                      className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    />
                    <button onClick={addTag} className="bg-stone-100 p-3 rounded-xl hover:bg-stone-200"><Tag size={20}/></button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {profile.specialtyTags.map(tag => (
                       <span key={tag} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                          #{tag} <button onClick={() => removeTag(tag)} className="hover:text-emerald-900">×</button>
                       </span>
                    ))}
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-stone-500 mb-1">紹介文・アピール</label>
                 <textarea 
                   name="description"
                   value={profile.description}
                   onChange={handleChange}
                   className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl h-32 text-sm leading-relaxed"
                 />
              </div>

              <div className="pt-4 flex gap-4">
                 <button onClick={() => setView(ViewState.AGENT_DASHBOARD)} className="flex-1 py-4 border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50">キャンセル</button>
                 <button onClick={handleSave} className="flex-1 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 shadow-lg flex items-center justify-center gap-2">
                    <Save size={18} /> 保存して公開
                 </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:w-1/3">
             <h3 className="font-bold text-stone-500 text-xs mb-3 uppercase tracking-wider">プレビュー（企業側の見え方）</h3>
             <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden border border-stone-100">
                         <img src={profile.logoUrl} className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <h4 className="font-bold text-stone-800 text-lg leading-tight flex items-center gap-1">
                             {profile.agencyName}
                             {profile.kycStatus === 'verified' && <CheckCircle2 size={14} className="text-blue-500" fill="currentColor" color="white"/>}
                         </h4>
                         <div className="flex items-center gap-1 text-xs text-stone-500">
                            <Star size={12} className="text-yellow-400 fill-yellow-400"/> {profile.rating}
                            <span className="text-stone-300">|</span>
                            <span>成約実績 {profile.trackRecord}件</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                   {profile.specialtyTags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded border border-stone-200">
                         {tag}
                      </span>
                   ))}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-4 line-clamp-4">
                   {profile.description}
                </p>

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 mb-4">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-500">手数料率（目安）</span>
                      <span className="text-emerald-600 font-black">{profile.feeRate}</span>
                   </div>
                </div>

                <button disabled className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                   <Building2 size={16} /> 提携を申し込む
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};