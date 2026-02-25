import React from 'react';
import { ShieldCheck, Mic, FileText, TrendingUp, ChevronRight, CheckCircle2, Lock, ArrowLeft, BrainCircuit, Users, Zap, MessageCircle, Sparkles, HeartHandshake } from 'lucide-react';
import { ViewState } from '../types';

interface AboutProProps {
  setView: (view: ViewState) => void;
}

export const AboutPro: React.FC<AboutProProps> = ({ setView }) => {
  return (
    <div className="bg-stone-900 min-h-screen text-white pt-16">
      
      {/* Navigation Back */}
      <div className="fixed top-20 left-4 z-50">
        <button 
           onClick={() => setView(ViewState.HOME)}
           className="bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-all border border-white/10"
        >
           <ArrowLeft size={20} />
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-6">
              Empowerment Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
               自分の足で、<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">自分のペースで歩く。</span>
            </h1>
            <p className="text-stone-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
               トコトコ (Tocotoco) は、障がいのある方が「自分らしく」働ける職場と出会うための、AI搭載型・就労支援プラットフォームです。
            </p>
            <button 
               onClick={() => setView(ViewState.JOB_SEARCH)}
               className="bg-white text-stone-900 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
               今すぐ求人を見る
            </button>
         </div>
      </section>

      {/* AI x Human Agent System Explanation */}
      <section className="py-20 px-4 bg-stone-800 border-y border-stone-700 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
              <div className="text-center mb-16">
                  <span className="text-purple-400 font-bold tracking-widest text-xs uppercase mb-2 block">Our Mechanism</span>
                  <h2 className="text-3xl md:text-5xl font-black mb-6">「AI × 支援員」のハイブリッドサポート</h2>
                  <p className="text-stone-400 max-w-2xl mx-auto text-lg">
                      AIによる客観的な特性分析と、経験豊富な支援員による温かいサポート。<br/>
                      それぞれの強みを活かして、あなたの「働きやすさ」を実現します。
                  </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                  {/* Step 1: AI */}
                  <div className="bg-stone-900/50 p-8 rounded-3xl border border-stone-700 flex flex-col relative group">
                      <div className="absolute -top-6 left-8 bg-stone-900 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-full font-black text-sm">STEP 01</div>
                      <div className="w-16 h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-500">
                          <BrainCircuit size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-4">AIによる「特性分析」</h3>
                      <p className="text-stone-400 text-sm leading-relaxed mb-4">
                          あなたの得意なことや、ストレスを感じやすいポイントをAIが分析。ご自身でも気づかなかった強みや、必要な配慮事項を言語化します。
                      </p>
                      <ul className="space-y-2 mt-auto text-sm font-bold text-stone-300">
                          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500"/> 履歴書・自己PR作成支援</li>
                          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500"/> 適職・マッチ度診断</li>
                      </ul>
                  </div>

                  {/* Connector */}
                  <div className="hidden lg:flex items-center justify-center">
                      <Zap size={32} className="text-stone-600 animate-pulse" />
                  </div>

                  {/* Step 2: Human */}
                  <div className="bg-stone-900/50 p-8 rounded-3xl border border-stone-700 flex flex-col relative group">
                      <div className="absolute -top-6 left-8 bg-stone-900 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-full font-black text-sm">STEP 02</div>
                      <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                          <HeartHandshake size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-4">支援員による「定着支援」</h3>
                      <p className="text-stone-400 text-sm leading-relaxed mb-4">
                          AIの分析データを元に、就労移行支援事業所やエージェントが企業と連携。入社後も安心して働き続けられるようサポートします。
                      </p>
                      <ul className="space-y-2 mt-auto text-sm font-bold text-stone-300">
                          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> 合理的配慮の調整</li>
                          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> 職場定着のフォロー</li>
                      </ul>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-stone-950">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black mb-6">トコトコの特徴</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Feature 1 */}
               <div className="bg-stone-900 border border-stone-800 p-10 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <TrendingUp size={120} />
                  </div>
                  <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                     <Lock size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">本音フィルター</h3>
                  <p className="text-stone-400 leading-relaxed mb-6">
                     「通院で休みたい」「電話対応が難しい」など、言い出しにくい条件を匿名で登録。企業はあなたの「スキル」と「必要な配慮」を見てスカウトを送ります。
                  </p>
               </div>

               {/* Feature 2 */}
               <div className="bg-stone-900 border border-stone-800 p-10 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Mic size={120} />
                  </div>
                  <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                     <Mic size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">AI面接練習</h3>
                  <p className="text-stone-400 leading-relaxed mb-6">
                     対人面接が苦手な方でも安心。24時間いつでも練習可能なAI面接官が、配慮事項の説明の仕方などを優しくアドバイスします。
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="bg-stone-900 border border-stone-800 p-10 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <ShieldCheck size={120} />
                  </div>
                  <div className="w-16 h-16 bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
                     <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">多様な働き方に対応</h3>
                  <p className="text-stone-400 leading-relaxed mb-6">
                     一般企業の障がい者枠、特例子会社、就労継続支援A型・B型、在宅ワークなど、あなたの体調や希望に合わせた働き方を探せます。
                  </p>
               </div>

               {/* Feature 4 */}
               <div className="bg-stone-900 border border-stone-800 p-10 rounded-3xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <FileText size={120} />
                  </div>
                  <div className="w-16 h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-500">
                     <FileText size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">AIレジュメ作成</h3>
                  <p className="text-stone-400 leading-relaxed mb-6">
                     障がい特性や配慮事項の伝え方に悩む必要はありません。AIがあなたの言葉を汲み取り、企業に伝わりやすい文章を作成します。
                  </p>
               </div>

            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
         <h2 className="text-3xl font-bold mb-6">焦らなくていい。あなたのペースで。</h2>
         <button 
            onClick={() => setView(ViewState.JOB_SEARCH)}
            className="bg-emerald-600 text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-emerald-500 transition-all shadow-lg"
         >
            無料で求人を探す
         </button>
         <p className="mt-6 text-stone-500 text-sm">※ 登録・利用はすべて無料です。</p>
      </section>

    </div>
  );
};