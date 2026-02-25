
import React from 'react';
import { X, Check, Star, Zap, Building2 } from 'lucide-react';
import { PLANS } from '../config';
import { createCheckoutSession } from '../services/paymentService';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'pro' | 'enterprise';
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, currentPlan }) => {
  if (!isOpen) return null;

  const handleUpgrade = async (priceId: string) => {
    await createCheckoutSession(priceId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 text-stone-400 hover:text-stone-600"><X size={24}/></button>

        {/* Free Plan */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-stone-100 flex flex-col">
           <div className="mb-4">
              <h3 className="text-xl font-bold text-stone-800">Free Plan</h3>
              <p className="text-stone-500 text-sm">まずは無料でスタート</p>
           </div>
           <div className="text-3xl font-black text-stone-900 mb-6">¥0<span className="text-sm font-medium text-stone-400">/月</span></div>
           <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-stone-600"><Check size={16} className="text-emerald-500"/> 求人掲載数 無制限</li>
              <li className="flex items-center gap-3 text-sm text-stone-600"><Check size={16} className="text-emerald-500"/> 完全成果報酬型</li>
              <li className="flex items-center gap-3 text-sm text-stone-400"><X size={16} /> AI面接レポート閲覧</li>
              <li className="flex items-center gap-3 text-sm text-stone-400"><X size={16} /> スカウト送信</li>
           </ul>
           <button disabled className="w-full py-3 rounded-xl font-bold text-stone-400 bg-stone-100 cursor-default">
              現在のプラン
           </button>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className="flex-1 p-8 bg-stone-900 text-white relative overflow-hidden flex flex-col transform md:scale-105 shadow-2xl z-10">
           <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-transparent w-32 h-32 opacity-20 rounded-bl-full pointer-events-none"></div>
           <div className="mb-4 relative z-10">
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">RECOMMENDED</span>
              <h3 className="text-xl font-bold">Pro Plan</h3>
              <p className="text-stone-400 text-sm">採用DXを加速させる</p>
           </div>
           <div className="text-4xl font-black text-white mb-6 relative z-10">¥30,000<span className="text-sm font-medium text-stone-400">/月</span></div>
           <ul className="space-y-4 mb-8 flex-1 relative z-10">
              <li className="flex items-center gap-3 text-sm font-bold"><Zap size={16} className="text-emerald-400"/> AI面接レポート見放題</li>
              <li className="flex items-center gap-3 text-sm font-bold"><Zap size={16} className="text-emerald-400"/> スカウト送信可能</li>
              <li className="flex items-center gap-3 text-sm font-bold"><Zap size={16} className="text-emerald-400"/> 市場分析データアクセス</li>
              <li className="flex items-center gap-3 text-sm text-stone-400"><Check size={16} className="text-emerald-500"/> Freeプランの全機能</li>
           </ul>
           <button 
             onClick={() => handleUpgrade(PLANS.EMPLOYER_PRO.id)}
             className="w-full py-4 rounded-xl font-bold text-stone-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg relative z-10"
           >
              Proにアップグレード
           </button>
        </div>

        {/* Enterprise */}
        <div className="flex-1 p-8 flex flex-col">
           <div className="mb-4">
              <h3 className="text-xl font-bold text-stone-800">Enterprise</h3>
              <p className="text-stone-500 text-sm">大規模採用向け</p>
           </div>
           <div className="text-2xl font-black text-stone-800 mb-6">Custom</div>
           <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-stone-600"><Check size={16} className="text-emerald-500"/> 専任CS担当</li>
              <li className="flex items-center gap-3 text-sm text-stone-600"><Check size={16} className="text-emerald-500"/> API連携</li>
              <li className="flex items-center gap-3 text-sm text-stone-600"><Check size={16} className="text-emerald-500"/> 請求書払い対応</li>
           </ul>
           <button className="w-full py-3 rounded-xl font-bold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">
              お問い合わせ
           </button>
        </div>

      </div>
    </div>
  );
};
