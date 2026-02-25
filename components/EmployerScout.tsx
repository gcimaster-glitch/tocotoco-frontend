import React, { useState } from 'react';
import { generateScoutMessage } from '../services/geminiService';
import { User, Sparkles, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { ViewState } from '../types';
import { PageHeader } from './PageHeader';

const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'A.S 様',
    age: '30代前半',
    role: '一般事務',
    traits: ['PCスキル高い', '正確性', '在宅希望', '精神障害者保健福祉手帳'],
    score: 88,
    status: 'new'
  },
  {
    id: 2,
    name: 'K.M 様',
    age: '20代後半',
    role: '軽作業',
    traits: ['体力あり', '単純作業得意', '療育手帳', '継続力'],
    score: 92,
    status: 'new'
  },
  {
    id: 3,
    name: 'T.Y 様',
    age: '30代後半',
    role: 'エンジニア',
    traits: ['専門スキルあり', '聴覚障がい', 'チャットコミュニケーション', '即戦力'],
    score: 85,
    status: 'scouted'
  }
];

interface EmployerScoutProps {
  setView: (view: ViewState) => void;
}

export const EmployerScout: React.FC<EmployerScoutProps> = ({ setView }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [scoutMessage, setScoutMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSelectCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setScoutMessage('');
    setIsSent(false);
  };

  const handleGenerate = async () => {
    if (!selectedCandidate) return;
    setIsGenerating(true);
    const message = await generateScoutMessage(
      selectedCandidate.name,
      selectedCandidate.traits,
      "株式会社未来サポート",
      "一般事務"
    );
    setScoutMessage(message);
    setIsGenerating(false);
  };

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      setSelectedCandidate(null);
      setIsSent(false);
      setScoutMessage('');
    }, 2000);
  };

  return (
    <div className="w-full">
      <PageHeader 
        title="AIスカウト" 
        subtitle="AI診断を受けたハイポテンシャルな人材に、パーソナライズされたスカウトを送れます"
        breadcrumbs={[{ label: 'AIスカウト' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:p-6 lg:p-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Candidate List */}
          <div className="space-y-4">
            <h2 className="font-bold text-stone-700 flex items-center gap-2">
              <User size={20} /> 推奨候補者リスト
            </h2>
            {MOCK_CANDIDATES.map(candidate => (
              <div 
                key={candidate.id}
                onClick={() => handleSelectCandidate(candidate)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${selectedCandidate?.id === candidate.id ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-stone-200 bg-white hover:border-purple-300'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-stone-800 text-lg">{candidate.name}</span>
                      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">{candidate.age}</span>
                    </div>
                    <div className="text-sm text-purple-700 font-bold mb-2">{candidate.role}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-stone-400 font-bold">AI MATCH</div>
                    <div className="text-xl font-black text-stone-800">{candidate.score}%</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {candidate.traits.map((trait: string, i: number) => (
                    <span key={i} className="text-[10px] bg-white border border-stone-200 px-2 py-1 rounded-full text-stone-600">
                      {trait}
                    </span>
                  ))}
                </div>
                {candidate.status === 'scouted' && (
                  <div className="mt-3 text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> スカウト送信済み
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Panel */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden flex flex-col h-[600px] sticky top-24">
            {!selectedCandidate ? (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                <Sparkles size={48} className="mb-4 text-purple-200" />
                <p>候補者を選択すると、<br/>AIが最適なスカウト文面を生成します。</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-stone-100 bg-stone-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-stone-800 text-lg">スカウトメッセージ作成</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                      To: {selectedCandidate.name}
                    </span>
                  </div>
                  
                  {/* Generation Controls */}
                  <div className="flex gap-2">
                     <button 
                       onClick={handleGenerate}
                       disabled={isGenerating}
                       className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                     >
                       {isGenerating ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>}
                       {scoutMessage ? '文面を再生成する' : 'AIで文面を生成する'}
                     </button>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto bg-white">
                  {scoutMessage ? (
                    <textarea 
                      className="w-full h-full resize-none outline-none text-stone-700 leading-relaxed text-sm p-2 rounded-lg focus:bg-stone-50 transition-colors"
                      value={scoutMessage}
                      onChange={(e) => setScoutMessage(e.target.value)}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-stone-300 text-sm">
                      <p>ボタンを押してメッセージを生成してください</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50">
                  {isSent ? (
                    <button disabled className="w-full bg-emerald-50 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} /> 送信しました！
                    </button>
                  ) : (
                    <button 
                      onClick={handleSend}
                      disabled={!scoutMessage}
                      className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Send size={18} /> スカウトを送る
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};