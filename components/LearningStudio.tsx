import React, { useState } from 'react';
import { PlayCircle, Lock, Clock, Target, ShoppingCart, X, Play, Pause, Volume2, Maximize } from 'lucide-react';
import { ViewState } from '../types';
import { PageHeader } from './PageHeader';
import { createCheckoutSession } from '../services/paymentService';
import { CONFIG } from '../config';

const MOCK_COURSES = [
  {
    id: 1,
    title: '障がい特性と合理的配慮の基礎',
    category: '基礎知識',
    duration: '15:00',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 0,
    isLocked: false,
    price: 0
  },
  {
    id: 2,
    title: 'ストレスマネジメントとセルフケア',
    category: 'メンタルヘルス',
    duration: '22:30',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 45,
    isLocked: false,
    price: 0
  },
  {
    id: 3,
    title: 'テレワークでの円滑なコミュニケーション術',
    category: 'スキルアップ',
    duration: '18:00',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 100,
    isLocked: false,
    price: 0
  },
  {
    id: 4,
    title: 'ジョブコーチが教える「長く働くための秘訣」',
    category: 'キャリア',
    duration: '30:00',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 0,
    isLocked: true,
    price: 2980
  }
];

interface LearningStudioProps {
  setView: (view: ViewState) => void;
}

export const LearningStudio: React.FC<LearningStudioProps> = ({ setView }) => {
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCourseClick = async (course: any) => {
    if (course.isLocked) {
        if (!CONFIG.ENABLE_BILLING) {
            alert("現在、課金システムはメンテナンス中です。");
            return;
        }
        const confirmPurchase = window.confirm(`この講座は有料です (¥${course.price.toLocaleString()})。\n購入手続きに進みますか？`);
        if (confirmPurchase) {
            await createCheckoutSession(`course_${course.id}`);
        }
    } else {
        setActiveCourse(course);
        setIsPlaying(true);
    }
  };

  const closePlayer = () => {
    setActiveCourse(null);
    setIsPlaying(false);
  };

  return (
    <div className="w-full">
      <PageHeader 
        title="Learning Studio" 
        subtitle="働くためのスキルや知識を、動画で効率よく学びましょう"
        breadcrumbs={[{ label: '学習' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-12">
        {/* Recommended Hero */}
        <div className="bg-stone-900 rounded-3xl p-8 mb-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="md:w-1/2 relative z-10">
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">New Arrival</span>
              <h2 className="text-3xl font-bold mb-4 leading-tight">自分らしく働くための<br/>セルフケア入門</h2>
              <p className="text-stone-300 mb-6 leading-relaxed">
                 体調管理やストレスコントロールなど、長く安定して働き続けるために必要な「自分自身との付き合い方」を学びます。
              </p>
              <button 
                onClick={() => handleCourseClick(MOCK_COURSES[0])} // Just playing the first one as a demo for hero
                className="bg-white text-stone-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-stone-200 transition-colors"
              >
                 <PlayCircle size={20} /> 今すぐ視聴する
              </button>
           </div>
           <div className="md:w-1/2 relative z-10 w-full">
              <div 
                onClick={() => handleCourseClick(MOCK_COURSES[0])}
                className="aspect-video bg-stone-800 rounded-xl overflow-hidden shadow-2xl relative group cursor-pointer border border-stone-700"
              >
                 <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="KPI Course" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                       <PlayCircle size={32} className="text-white" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Course Grid */}
        <div>
           <h3 className="font-bold text-stone-800 text-xl mb-6 flex items-center gap-2">
              <Target size={20} className="text-emerald-500"/> おすすめの講座
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_COURSES.map(course => (
                 <div key={course.id} className="group cursor-pointer" onClick={() => handleCourseClick(course)}>
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-md bg-stone-100">
                       <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                       <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                          <Clock size={10} /> {course.duration}
                       </div>
                       {course.isLocked && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                             <ShoppingCart className="w-8 h-8 mb-2" />
                             <span className="font-bold text-sm">¥{course.price.toLocaleString()}</span>
                             <span className="text-[10px]">クリックして購入</span>
                          </div>
                       )}
                       {course.isLocked && (
                          <div className="absolute top-2 right-2 bg-stone-900 text-white p-1 rounded-full">
                             <Lock size={12} />
                          </div>
                       )}
                       {!course.isLocked && course.progress > 0 && (
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-stone-700">
                             <div className="bg-emerald-500 h-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                       )}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold mb-1">{course.category}</div>
                    <h4 className="font-bold text-stone-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                       {course.title}
                    </h4>
                    <div className="text-[10px] text-stone-400">
                       {course.isLocked ? `¥${course.price.toLocaleString()}` : (course.progress === 100 ? '視聴完了' : course.progress > 0 ? `${course.progress}% 完了` : '未視聴')}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* --- VIDEO PLAYER MODAL --- */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <button onClick={closePlayer} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
              <X size={32} />
           </button>

           <div className="w-full max-w-5xl bg-stone-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Video Player Area */}
              <div className="relative aspect-video bg-black flex items-center justify-center group">
                 {isPlaying ? (
                    <div className="text-white text-center">
                       <img src={activeCourse.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                       <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="font-bold tracking-widest text-sm">VIDEO LOADING (DEMO)</p>
                       </div>
                       
                       {/* Fake Controls */}
                       <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer">
                             <div className="w-1/3 h-full bg-emerald-500 rounded-full relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                             </div>
                          </div>
                          <div className="flex justify-between items-center text-white">
                             <div className="flex items-center gap-4">
                                <button className="hover:text-emerald-400"><Pause size={20} fill="currentColor" /></button>
                                <span className="text-xs font-mono">05:23 / {activeCourse.duration}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                <Volume2 size={20} />
                                <Maximize size={20} />
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <button onClick={() => setIsPlaying(true)} className="relative z-10">
                       <PlayCircle size={64} className="text-white/80 hover:text-white transition-colors hover:scale-110 duration-300" />
                    </button>
                 )}
              </div>

              {/* Course Info */}
              <div className="p-6 bg-stone-800 text-white flex-1 overflow-y-auto">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <span className="text-emerald-400 text-xs font-bold mb-1 block">{activeCourse.category}</span>
                       <h2 className="text-xl font-bold leading-tight">{activeCourse.title}</h2>
                    </div>
                    <button className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                       メモを取る
                    </button>
                 </div>
                 <p className="text-sm text-stone-400 leading-relaxed mb-6">
                    この講座では、働く上で直面する具体的なケーススタディを通して、明日から使える実践的なスキルを習得します。
                 </p>
                 
                 <div className="border-t border-stone-700 pt-4">
                    <h4 className="font-bold text-sm mb-3">チャプター</h4>
                    <ul className="space-y-2 text-sm text-stone-400">
                       <li className="flex items-center gap-3 p-2 bg-stone-700/50 rounded-lg border-l-2 border-emerald-500 text-white">
                          <Play size={12} /> 00:00 はじめに
                       </li>
                       <li className="flex items-center gap-3 p-2 hover:bg-stone-700/50 rounded-lg cursor-pointer transition-colors">
                          <Lock size={12} /> 03:45 基本的な考え方
                       </li>
                       <li className="flex items-center gap-3 p-2 hover:bg-stone-700/50 rounded-lg cursor-pointer transition-colors">
                          <Lock size={12} /> 10:20 実践演習
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};