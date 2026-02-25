import React, { useState, useRef } from 'react';
import { generateResumeSelfPR, analyzeResumeImageJSON, ResumeData } from '../services/geminiService';
import { Sparkles, Upload, FileText, CheckCircle, Loader2, Send, ChevronRight, User, Briefcase, Award, PenTool, ArrowRight, Download, RefreshCw, Plus, Trash2, Calendar, SkipForward, Camera, Accessibility } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { ViewState } from '../types';

const INITIAL_RESUME: ResumeData = {
  name: '山田 太郎',
  kana: 'ヤマダ タロウ',
  birthDate: '1990-05-15',
  gender: '男性',
  address: '東京都世田谷区...',
  phone: '090-1234-5678',
  email: 'taro.yamada@example.com',
  education: [],
  workHistory: [],
  licenses: [],
  motivation: '',
  requests: '【配慮事項】\n・通院のため、月1回の平日休暇を希望します。\n・電話対応が困難なため、社内連絡はチャット等を希望します。'
};

const STEPS = [
  { id: 'basic', title: '基本情報', icon: User },
  { id: 'history', title: '学歴・職歴', icon: Briefcase },
  { id: 'disability', title: '配慮事項', icon: Accessibility },
  { id: 'pr', title: '自己PR生成', icon: Sparkles },
];

interface AIResumeBuilderProps {
  setView?: (view: ViewState) => void;
}

export const AIResumeBuilder: React.FC<AIResumeBuilderProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'scan'>('create');
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Wizard Inputs for PR generation
  const [role, setRole] = useState('');
  const [disabilityType, setDisabilityType] = useState('');
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const resumeUploadInputRef = useRef<HTMLInputElement>(null); // New ref for resume upload

  const progress = Math.min(((currentStep + 1) / STEPS.length) * 100, 100);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleGeneratePR = async () => {
    setIsLoading(true);
    const result = await generateResumeSelfPR({
      role,
      skills: accommodations, // Reusing skills field for accommodations context
      strengths: [disabilityType, freeText],
      name: resumeData.name
    });
    
    setResumeData(prev => ({
      ...prev,
      motivation: result.motivation || '',
      requests: result.requests || prev.requests,
    }));
    setIsLoading(false);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- NEW: Handle Resume Document Upload ---
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const analyzedData = await analyzeResumeImageJSON(base64);
          setResumeData(prev => ({
            ...prev,
            ...analyzedData
          }));
          alert("履歴書の読み込みが完了しました。内容は各ステップで確認・修正できます。");
        } catch (error) {
          console.error(error);
          alert("読み込みに失敗しました。");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ... (Keep addItem, updateItem, removeItem same as before) ...
  const addItem = (field: 'education' | 'workHistory' | 'licenses') => {
    setResumeData(prev => ({
      ...prev,
      [field]: [...prev[field], { year: '', month: '', content: '' }]
    }));
  };

  const updateItem = (field: 'education' | 'workHistory' | 'licenses', index: number, key: 'year' | 'month' | 'content', value: string) => {
    setResumeData(prev => {
      const newList = [...prev[field]];
      newList[index] = { ...newList[index], [key]: value };
      return { ...prev, [field]: newList };
    });
  };

  const removeItem = (field: 'education' | 'workHistory' | 'licenses', index: number) => {
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Helper
  const SelectionChips = ({ options, selected, onSelect, multi = false }: any) => (
    <div className="flex flex-wrap gap-2 mt-4">
      {options.map((opt: string) => {
        const isSelected = multi ? selected.includes(opt) : selected === opt;
        return (
          <button
            key={opt}
            onClick={() => {
              if (multi) {
                onSelect(isSelected ? selected.filter((s: string) => s !== opt) : [...selected, opt]);
              } else {
                onSelect(opt);
              }
            }}
            className={`px-4 py-2 rounded-full border transition-all text-sm font-bold ${isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400'}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const YearMonthInputs = ({ item, onChange }: { item: {year: string, month: string}, onChange: (key: 'year'|'month', val: string) => void }) => (
    <div className="flex gap-2 shrink-0">
      <input 
        type="text" placeholder="年" className="w-16 p-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-sm text-center placeholder-stone-400"
        value={item.year} onChange={(e) => onChange('year', e.target.value)}
      />
      <input 
        type="text" placeholder="月" className="w-12 p-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-sm text-center placeholder-stone-400"
        value={item.month} onChange={(e) => onChange('month', e.target.value)}
      />
    </div>
  );

  // Steps
  const StepBasicInfo = () => (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><User size={20} className="text-emerald-500"/> 基本情報を入力</h3>
      {/* (Same Basic Info Form Structure as before, just updated class names if needed) */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-32 flex flex-col items-center gap-2">
           <div 
             className="w-32 h-40 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center bg-stone-50 cursor-pointer hover:bg-stone-100 overflow-hidden relative"
             onClick={() => profileImageInputRef.current?.click()}
           >
              {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <div className="text-stone-400 text-center text-xs"><Upload className="mx-auto mb-1" size={20} />写真</div>}
              <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
           </div>
        </div>
        <div className="flex-1 space-y-3">
           <input className="w-full p-3 border rounded-xl" value={resumeData.name} onChange={(e) => setResumeData({...resumeData, name: e.target.value})} placeholder="氏名" />
           <input className="w-full p-3 border rounded-xl" value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} placeholder="Email" />
           {/* ... other fields ... */}
        </div>
      </div>
    </div>
  );

  const StepHistory = () => (
    <div className="space-y-6 animate-in fade-in">
       <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><Briefcase size={20} className="text-emerald-500"/> 学歴・職歴</h3>
       {/* Education */}
       <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
         <h4 className="text-xs font-bold text-stone-500 mb-2 uppercase">学歴</h4>
         {resumeData.education.map((item, i) => (
           <div key={i} className="flex gap-2 mb-2 items-center">
             <YearMonthInputs item={item} onChange={(k, v) => updateItem('education', i, k, v)} />
             <input className="flex-1 p-2 border rounded-lg" value={item.content} onChange={(e) => updateItem('education', i, 'content', e.target.value)} />
             <button onClick={() => removeItem('education', i)}><Trash2 size={16}/></button>
           </div>
         ))}
         <button onClick={() => addItem('education')} className="text-emerald-600 text-xs font-bold flex items-center gap-1"><Plus size={14}/> 追加</button>
       </div>
       {/* Work */}
       <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
         <h4 className="text-xs font-bold text-stone-500 mb-2 uppercase">職歴</h4>
         {resumeData.workHistory.map((item, i) => (
           <div key={i} className="flex gap-2 mb-2 items-center">
             <YearMonthInputs item={item} onChange={(k, v) => updateItem('workHistory', i, k, v)} />
             <input className="flex-1 p-2 border rounded-lg" value={item.content} onChange={(e) => updateItem('workHistory', i, 'content', e.target.value)} />
             <button onClick={() => removeItem('workHistory', i)}><Trash2 size={16}/></button>
           </div>
         ))}
         <button onClick={() => addItem('workHistory')} className="text-emerald-600 text-xs font-bold flex items-center gap-1"><Plus size={14}/> 追加</button>
       </div>
    </div>
  );

  const StepDisability = () => (
    <div className="space-y-6 animate-in fade-in">
       <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><Accessibility size={20} className="text-emerald-500"/> 障がい・配慮事項</h3>
       <div className="space-y-4">
         <div>
           <label className="text-xs font-bold text-stone-500">障がい種別</label>
           <SelectionChips 
              options={['身体障がい', '精神障がい', '知的障がい', '発達障がい', 'その他']} 
              selected={disabilityType} 
              onSelect={setDisabilityType} 
           />
         </div>
         <div>
           <label className="text-xs font-bold text-stone-500">必要な配慮 (キーワード)</label>
           <SelectionChips 
              options={['通院休暇', '電話対応不可', 'マニュアル希望', '静かな環境', '休憩スペース', '筆談対応', '在宅勤務', '時短勤務', '車椅子動線']} 
              selected={accommodations} 
              onSelect={setAccommodations} 
              multi 
           />
         </div>
       </div>
    </div>
  );

  const StepPR = () => (
    <div className="space-y-6 animate-in fade-in">
       <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><Sparkles size={20} className="text-emerald-500"/> AI自己PR・配慮事項生成</h3>
       <p className="text-sm text-stone-500">これまでの入力と以下のキーワードから、自己PRと「合理的配慮のお願い」を自動生成します。</p>
       
       <div className="space-y-4">
         <div>
           <label className="text-xs font-bold text-stone-500">希望職種</label>
           <SelectionChips 
              options={['一般事務', 'データ入力', '軽作業', '清掃', 'Web制作', 'システムエンジニア', 'その他']} 
              selected={role} 
              onSelect={setRole} 
           />
         </div>
         <div>
           <label className="text-xs font-bold text-stone-500">自分の強み・得意なこと</label>
           <textarea
             className="w-full mt-2 p-3 bg-white text-stone-900 border border-stone-300 rounded-xl text-sm h-24"
             placeholder="例：集中力がある、PC操作が得意、コツコツした作業が好き、前職では無遅刻無欠勤だった"
             value={freeText}
             onChange={(e) => setFreeText(e.target.value)}
           />
         </div>
         <button 
           onClick={handleGeneratePR}
           disabled={isLoading}
           className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all disabled:opacity-50"
         >
           {isLoading ? <Loader2 className="animate-spin"/> : <Sparkles size={16}/>}
           自己PRと配慮事項を生成
         </button>
       </div>
    </div>
  );

  return (
    <div className="w-full">
      <PageHeader 
        title="AI履歴書ビルダー" 
        subtitle="配慮事項もAIが言語化。あなたの強みを正しく伝える履歴書作成"
        breadcrumbs={[{ label: 'AI履歴書' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* --- Resume Upload Banner --- */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
           <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                 <Camera size={24} />
              </div>
              <div>
                 <h3 className="font-bold text-lg">お持ちの履歴書をアップロード</h3>
                 <p className="text-sm text-blue-100">画像やPDFを読み込んで、内容を自動入力できます。</p>
              </div>
           </div>
           <button 
             onClick={() => resumeUploadInputRef.current?.click()}
             className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-md disabled:opacity-70"
             disabled={isLoading}
           >
             {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
             ファイルをアップロード
           </button>
           <input 
             type="file" 
             ref={resumeUploadInputRef} 
             className="hidden" 
             accept="image/*,application/pdf" 
             onChange={handleResumeUpload} 
           />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Controls */}
          <div className="lg:w-1/3 flex flex-col gap-6">
             <div className="bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden">
                <div className="p-6">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold text-stone-400 mb-2">
                      <span>Step {currentStep + 1} / {STEPS.length}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-h-[300px] flex flex-col">
                      {currentStep === 0 && <StepBasicInfo />}
                      {currentStep === 1 && <StepHistory />}
                      {currentStep === 2 && <StepDisability />}
                      {currentStep === 3 && <StepPR />}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-4 border-t border-stone-50 mt-4">
                    {currentStep < STEPS.length - 1 ? (
                      <>
                         <button onClick={handleNext} className="text-stone-400 text-sm font-bold">スキップ</button>
                         <button onClick={handleNext} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm">次へ <ArrowRight size={14} className="inline"/></button>
                      </>
                    ) : (
                      <button onClick={() => setCurrentStep(0)} className="w-full text-center text-emerald-600 font-bold text-sm">はじめからやり直す</button>
                    )}
                  </div>
                </div>
             </div>
          </div>

          {/* Preview */}
          <div className="lg:w-2/3">
             <div className="bg-white shadow-2xl rounded-sm border border-stone-300 min-h-[800px] p-8 md:p-12 relative print-area">
                {/* Simplified Resume View for Brevity in Code Block */}
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4 text-center">履 歴 書</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                   <div className="col-span-2">
                      <p>氏名: {resumeData.name}</p>
                      <p>住所: {resumeData.address}</p>
                   </div>
                   <div className="border bg-stone-50 h-32 w-24 ml-auto flex items-center justify-center text-stone-300">
                      {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : "写真"}
                   </div>
                </div>
                
                <div className="space-y-6">
                   <div className="border border-stone-300 p-2 min-h-[100px]">
                      <h3 className="font-bold border-b mb-2">学歴・職歴</h3>
                      {resumeData.workHistory.map((w, i) => <p key={i}>{w.year}年{w.month}月 {w.content}</p>)}
                   </div>
                   
                   <div className="border border-stone-300 p-2 min-h-[150px]">
                      <h3 className="font-bold border-b mb-2">志望動機・自己PR</h3>
                      <p className="whitespace-pre-wrap text-sm">{resumeData.motivation}</p>
                   </div>

                   <div className="border border-stone-300 p-2 min-h-[150px]">
                      <h3 className="font-bold border-b mb-2">本人希望記入欄（配慮事項など）</h3>
                      <p className="whitespace-pre-wrap text-sm">{resumeData.requests}</p>
                   </div>
                </div>
             </div>
             <div className="mt-4 flex justify-end">
               <button onClick={() => window.print()} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Download size={18}/> PDF保存</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};