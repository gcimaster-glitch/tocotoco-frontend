import React, { useState } from 'react';
import { generateDiagnosticReport } from '../services/geminiService';
import { BrainCircuit, HeartHandshake, ChevronRight, Loader2, CheckCircle2, RotateCcw, ArrowRight, BarChart3, Target, Users, Zap, ClipboardList, Briefcase } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { ViewState } from '../types';

interface AIDiagnosticsProps {
  initialType?: 'personality' | 'aptitude';
  existingResult?: any;
  onBack: () => void;
  onComplete?: (type: 'personality' | 'aptitude', result: any) => void;
  setView?: (view: ViewState) => void;
}

// Based on "ADHD・ASD・LD 混在型 適職診断アンケート" document
// 1: 全く当てはまらない ... 5: 非常に当てはまる
const QUESTIONS = {
  // 適職診断（混合型特性分析）
  aptitude: [
    // 【A】ADHD特性タイプ判定（中核）
    { id: 1, text: "話を聞いていても、途中で内容が抜け落ちることが多い", category: "ADHD" },
    { id: 2, text: "指示を聞いたつもりでも、後で違っていることが多い", category: "ADHD" },
    { id: 3, text: "複数の作業を同時に指示されると混乱する", category: "ADHD" },
    { id: 4, text: "書類・メール・数字の確認ミスが頻発する", category: "ADHD" },
    { id: 5, text: "期限や予定を忘れることが多い", category: "ADHD" },
    { id: 6, text: "長時間じっとしている作業が苦痛に感じる", category: "ADHD" },
    { id: 7, text: "落ち着かない感覚が常にある", category: "ADHD" },
    { id: 8, text: "体を動かしていないと集中しにくい", category: "ADHD" },
    { id: 9, text: "単調な作業が強いストレスになる", category: "ADHD" },
    
    // 【B】ASD特性タイプ判定（推測・補完）
    { id: 10, text: "急な予定変更があると強いストレスを感じる", category: "ASD" },
    { id: 11, text: "曖昧な指示（「適当にやっておいて」など）が理解しにくい", category: "ASD" },
    { id: 12, text: "雑談や世間話をするのが苦手だ", category: "ASD" },
    { id: 13, text: "自分の興味のあることには時間を忘れて没頭できる", category: "ASD" },
    { id: 14, text: "音・光・匂いなどに敏感で、集中できないことがある", category: "ASD" },
    { id: 15, text: "独自のルールや手順にこだわりたい", category: "ASD" },

    // 【C】LD特性タイプ判定（推測・補完）
    { id: 16, text: "文章を読んでも意味が頭に入りにくいことがある", category: "LD" },
    { id: 17, text: "漢字が思い出せなかったり、書き間違えることが多い", category: "LD" },
    { id: 18, text: "簡単な計算でも時間がかかったり、間違えることがある", category: "LD" }
  ],
  // 簡易性格診断（補助）
  personality: [
    { id: 1, text: "新しい環境や変化に対して、ワクワクする方だ", category: "Openness" },
    { id: 2, text: "チームで協力するより、一人で集中する方が好きだ", category: "Introversion" },
    { id: 3, text: "細部まで完璧に仕上げないと気が済まない", category: "Conscientiousness" },
    { id: 4, text: "他人の感情や顔色を敏感に察知してしまう", category: "Neuroticism" },
    { id: 5, text: "リーダーとして人を引っ張ることに興味がある", category: "Leadership" }
  ]
};

const SCALE_LABELS = [
  "全く当てはまらない",
  "あまり当てはまらない",
  "どちらとも言えない",
  "やや当てはまる",
  "非常に当てはまる"
];

export const AIDiagnostics: React.FC<AIDiagnosticsProps> = ({ initialType = 'aptitude', existingResult, onBack, onComplete, setView }) => {
  const [type, setType] = useState<'personality' | 'aptitude'>(initialType);
  const [step, setStep] = useState<'intro' | 'questions' | 'loading' | 'result'>(existingResult ? 'result' : 'intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: number}[]>([]);
  const [result, setResult] = useState<any>(existingResult || null);

  const currentQuestions = QUESTIONS[type];

  const handleStart = (selectedType: 'personality' | 'aptitude') => {
    setType(selectedType);
    setStep('questions');
    setCurrentQIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, { question: currentQuestions[currentQIndex].text, answer: score }];
    setAnswers(newAnswers);

    if (currentQIndex < currentQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers: {question: string, answer: number}[]) => {
    setStep('loading');
    const report = await generateDiagnosticReport(type, finalAnswers);
    setResult(report);
    setStep('result');
  };

  const handleComplete = () => {
    if (onComplete && result) {
      onComplete(type, result);
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full">
      <PageHeader 
        title="AI適職診断" 
        subtitle="ADHD・ASD・LD特性の傾向から、あなたに合った働き方を分析します"
        breadcrumbs={[{ label: 'AI診断' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1504868584819-f8e8b716656f?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {step === 'intro' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aptitude Card */}
              <div 
                onClick={() => handleStart('aptitude')}
                className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-emerald-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:rotate-12 transition-transform">
                  <ClipboardList size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2 relative z-10">混合型 適職診断</h2>
                <p className="text-stone-500 text-sm mb-6 relative z-10">
                  ADHD・ASD・LDの特性バランスを分析し、あなたの強みが活きる職種や環境、必要な配慮を具体的に提案します。
                </p>
                <span className="inline-flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-3 transition-all">
                  診断を始める <ChevronRight size={16} />
                </span>
              </div>

              {/* Personality Card */}
              <div 
                onClick={() => handleStart('personality')}
                className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:rotate-12 transition-transform">
                  <BrainCircuit size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2 relative z-10">簡易性格診断</h2>
                <p className="text-stone-500 text-sm mb-6 relative z-10">
                  仕事における価値観やストレス耐性を分析。補助的な自己分析ツールとしてご利用ください。
                </p>
                <span className="inline-flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                  診断を始める <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- QUESTIONS SCREEN --- */}
        {step === 'questions' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-8 min-h-[60vh] flex flex-col justify-center animate-in fade-in bg-white rounded-3xl shadow-lg border border-stone-100">
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-stone-400 mb-2">
                <span>Question {currentQIndex + 1} / {currentQuestions.length}</span>
                <span>{Math.round(((currentQIndex + 1) / currentQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${type === 'personality' ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${((currentQIndex + 1) / currentQuestions.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="mb-8 text-center">
               <span className="inline-block bg-stone-100 text-stone-500 text-xs px-3 py-1 rounded-full font-bold mb-4">
                  {currentQuestions[currentQIndex].category || 'General'}
               </span>
               <h2 className="text-xl md:text-2xl font-bold text-stone-800 leading-relaxed">
                 {currentQuestions[currentQIndex].text}
               </h2>
            </div>

            <div className="space-y-3">
              {SCALE_LABELS.map((label, i) => {
                const score = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(score)}
                    className="w-full p-4 flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${score === 5 ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-stone-300 text-stone-400 bg-white group-hover:border-emerald-400'}`}>
                       {score}
                    </div>
                    <span className="font-bold text-stone-700 group-hover:text-emerald-800">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- LOADING SCREEN --- */}
        {step === 'loading' && (
          <div className="max-w-2xl mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse ${type === 'personality' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {type === 'personality' ? <BrainCircuit size={40} /> : <ClipboardList size={40} />}
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">AIが特性を分析中...</h2>
            <p className="text-stone-500 mb-8">
              回答パターンから、あなたの強みと適した環境を導き出しています。<br/>少々お待ちください。
            </p>
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          </div>
        )}

        {/* --- RESULT SCREEN --- */}
        {step === 'result' && result && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-stone-200 overflow-hidden">
              
              {/* Header */}
              <div className={`bg-gradient-to-r ${type === 'personality' ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'} p-8 text-white relative overflow-hidden`}>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-10 -mt-20 blur-3xl"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <div className="flex items-center gap-2 text-white/80 font-bold text-sm mb-2 uppercase tracking-wider">
                        {type === 'personality' ? <BrainCircuit size={16} /> : <ClipboardList size={16} />} 
                        {type === 'personality' ? 'Personality Analysis' : 'Aptitude Assessment'}
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">{result.title}</h1>
                      <p className="text-white/90 text-sm md:text-base max-w-xl">{result.summary}</p>
                   </div>
                   <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]">
                      <div className="text-xs font-bold text-white/80 mb-1">Score</div>
                      <div className="text-5xl font-black">{result.score}</div>
                   </div>
                 </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                 {/* Left Col: Radar Chart (Simulated) & Overview */}
                 <div className="lg:col-span-1 space-y-6">
                    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                       <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                         <BarChart3 size={18} className={type === 'personality' ? 'text-blue-500' : 'text-emerald-500'} /> 特性バランス
                       </h3>
                       <div className="space-y-4">
                          {result.radarChart && Object.keys(result.radarChart).map((key, i) => {
                             if (key.startsWith('label')) {
                               const valueKey = key.replace('label', 'value');
                               const label = result.radarChart[key];
                               const value = result.radarChart[valueKey];
                               return (
                                 <div key={i}>
                                   <div className="flex justify-between text-xs font-bold text-stone-500 mb-1">
                                     <span>{label}</span>
                                     <span>{value}</span>
                                   </div>
                                   <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                     <div 
                                       className={`h-full rounded-full transition-all duration-1000 ${type === 'personality' ? 'bg-blue-500' : 'bg-emerald-500'}`} 
                                       style={{ width: `${value}%`, transitionDelay: `${i * 100}ms` }}
                                     ></div>
                                   </div>
                                 </div>
                               )
                             }
                             return null;
                          })}
                       </div>
                    </div>
                 </div>

                 {/* Right Col: Detailed Analysis */}
                 <div className="lg:col-span-2 space-y-6">
                    {result.details && result.details.map((detail: any, i: number) => (
                       <div key={i} className="border-b border-stone-100 last:border-0 pb-6 last:pb-0">
                          <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                             {i === 0 && <Target size={18} className="text-orange-500"/>}
                             {i === 1 && <Zap size={18} className="text-yellow-500"/>}
                             {i === 2 && <HeartHandshake size={18} className="text-pink-500"/>}
                             {i === 3 && <Briefcase size={18} className="text-blue-500"/>}
                             {detail.heading}
                          </h4>
                          <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                             {detail.text}
                          </p>
                       </div>
                    ))}
                    
                    <div className="mt-8 pt-4 flex flex-col sm:flex-row gap-4">
                       <button onClick={onBack} className="flex-1 py-3 border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 flex items-center justify-center gap-2">
                          <RotateCcw size={18}/> もう一度診断する
                       </button>
                       <button onClick={handleComplete} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${type === 'personality' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                          結果をマイページに保存 <ArrowRight size={18}/>
                       </button>
                    </div>
                 </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};