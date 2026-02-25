import React, { useState } from 'react';
import { ViewState } from '../types';
import { Sparkles, ArrowRight, Check, X, ShieldCheck, Users, TrendingUp } from 'lucide-react';

interface OnboardingWizardProps {
  onClose: () => void;
  userRole: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onClose, userRole }) => {
  const [step, setStep] = useState(1);

  const steps = userRole === 'employer' ? [
    {
      title: "Tocotocoへようこそ",
      desc: "障がい者雇用に特化した、次世代の採用プラットフォームです。",
      icon: <Sparkles size={48} className="text-emerald-400" />
    },
    {
      title: "1. 魅力的な求人を作成",
      desc: "AIが職務内容を分析し、最適なスコアを算出。さらに「エージェント向け戦略設定」で、プロのエージェントに特別なインセンティブを提示できます。",
      icon: <TrendingUp size={48} className="text-blue-400" />
    },
    {
      title: "2. エージェントと提携",
      desc: "得意領域（身体・精神・知的など）を持つエージェントを検索し、提携リクエストを送信。強力なパートナーを見つけましょう。",
      icon: <Users size={48} className="text-purple-400" />
    },
    {
      title: "3. ブラインド審査とスカウト",
      desc: "実名伏せられた候補者情報を閲覧し、興味があれば「詳細開示」をリクエスト。AIによるマッチングスコアも参考にできます。",
      icon: <ShieldCheck size={48} className="text-amber-400" />
    }
  ] : [
    {
      title: "キャリアの新しい扉を開く",
      desc: "あなたの経験とスキル、そして必要な配慮を正当に評価する求人に出会えます。",
      icon: <Sparkles size={48} className="text-emerald-400" />
    },
    {
      title: "1. AI履歴書を作成",
      desc: "簡単な質問に答えるか、写真をアップロードするだけで、プロフェッショナルな職務経歴書が完成します。",
      icon: <TrendingUp size={48} className="text-blue-400" />
    },
    {
      title: "2. 本音条件を設定",
      desc: "「通院」「在宅」などの譲れない条件を設定。企業には匿名で公開されるため、現職にバレずに活動できます。",
      icon: <ShieldCheck size={48} className="text-amber-400" />
    },
    {
      title: "3. AI面接でアピール",
      desc: "24時間いつでも受験可能なAI面接で高スコアを獲得すると、書類選考免除などのオファーが届きます。",
      icon: <Users size={48} className="text-purple-400" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const currentStepData = steps[step - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity" />
      
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-stone-900"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center pt-10 px-8 pb-8 text-center h-full">
           
           {/* Icon Circle */}
           <div className="w-24 h-24 bg-stone-800 rounded-3xl flex items-center justify-center shadow-xl mb-6 border-4 border-white transform rotate-3 transition-transform duration-500 hover:rotate-0">
              {currentStepData.icon}
           </div>

           <h2 className="text-2xl font-black text-stone-900 mb-4 h-16 flex items-end justify-center">{currentStepData.title}</h2>
           <p className="text-stone-500 text-sm leading-relaxed mb-8 min-h-[4rem]">
              {currentStepData.desc}
           </p>

           {/* Indicators */}
           <div className="flex gap-2 mb-8">
              {steps.map((_, i) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-stone-900' : 'w-2 bg-stone-200'}`}></div>
              ))}
           </div>

           <button 
             onClick={handleNext}
             className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group"
           >
             {step === steps.length ? (
                <>はじめる <Check size={20} /></>
             ) : (
                <>次へ <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
             )}
           </button>

           <button onClick={onClose} className="mt-4 text-xs font-bold text-stone-400 hover:text-stone-600">
              スキップする
           </button>
        </div>
      </div>
    </div>
  );
};