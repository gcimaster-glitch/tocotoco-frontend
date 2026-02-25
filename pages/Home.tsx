import React, { useEffect, useState } from 'react';
import { Job, ViewState } from '../types';
import { JobCard } from '../components/JobCard';
import { HonneFilter } from '../components/HonneFilter';
import { ChevronRight, Sparkles, Building, UserCheck, Briefcase, Mic, FileText, ShieldCheck, EyeOff, Loader2, HeartHandshake, Smile, Accessibility, Search } from 'lucide-react';

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    catchphrase: '【完全在宅】データ入力業務。通院のための柔軟なシフト調整が可能です。',
    title: '一般事務・データ入力（リモート）',
    company: '株式会社テクノロジーパートナーズ',
    location: '全国（フルリモート）',
    salary: '月給 200,000円〜',
    type: 'Full-time',
    tags: ['在宅ワーク', '精神障がい者活躍中', '通院配慮'],
    celebrationMoney: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Immediate'
  },
  {
    id: '2',
    catchphrase: '【バリアフリー完備】大手メーカーでの軽作業。定着率95%の安心環境。',
    title: '工場内軽作業・梱包',
    company: '旭日製造株式会社',
    location: '大阪府門真市',
    salary: '時給 1,200円〜',
    type: 'Part-time',
    tags: ['身体障がい者活躍中', '車椅子OK', '送迎バスあり'],
    celebrationMoney: 10000,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Future'
  },
  {
    id: '3',
    catchphrase: '【非公開求人】特例子会社での管理部門スタッフ。経験者優遇。',
    title: '人事・総務アシスタント',
    company: '非公開（大手金融グループ）',
    location: '東京都千代田区',
    salary: '年収 350万〜450万円',
    type: 'Agent',
    tags: ['正社員登用あり', '年間休日125日', '産業医常駐'],
    isClosed: true,
    celebrationMoney: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isAgent: true
  },
  {
    id: '4',
    catchphrase: '【週20h未満OK】ゆっくり働きたい方向け。農園での軽作業。',
    title: '農園スタッフ（障がい者雇用）',
    company: 'グリーンファーム',
    location: '埼玉県さいたま市',
    salary: '時給 1,050円〜',
    type: 'Part-time',
    tags: ['知的障がい者活躍中', '週3日〜', '短時間勤務'],
    celebrationMoney: 0,
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    startDate: 'Immediate'
  }
];

interface HomeProps {
  setView: (view: ViewState) => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isContentLoad, setIsContentLoad] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    setIsContentLoad(true);
  }, []);

  return (
    <div className="bg-[#FAFAF9] min-h-screen text-stone-800 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[90vh] bg-stone-50 flex flex-col items-center justify-center overflow-hidden">
        {/* Soft Branding BG */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-100/50 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-100/50 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <div className={`relative z-10 text-center px-4 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-stone-500 text-xs font-bold tracking-wider uppercase">Disability Employment Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-stone-800">
            トコトコ
            <span className="block text-2xl md:text-3xl font-medium text-stone-500 mt-2 tracking-normal">
              自分の足で、自分のペースで歩く。
            </span>
          </h1>
          
          <p className="text-stone-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            焦らなくていい、という安心感。<br/>
            障がい者雇用の新しい形を提案する、<br className="md:hidden"/>やさしい求人プラットフォーム。
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
             <button 
               onClick={() => setView(ViewState.JOB_SEARCH)}
               className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-emerald-200 flex items-center gap-2"
             >
               求人を探す <Search size={20} />
             </button>
             <button 
               onClick={() => setView(ViewState.ABOUT_PRO)}
               className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-bold px-8 py-4 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-all shadow-sm"
             >
               トコトコについて <ChevronRight size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* --- SERVICE PATHS --- */}
      <section className="relative z-30 -mt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Path 1 */}
           <div 
             onClick={() => setView(ViewState.JOB_SEARCH)}
             className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-stone-200 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
           >
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">一般企業（障がい者枠）</h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-4">
                合理的配慮のある一般企業で働きたい方へ。テレワークや時短勤務など。
              </p>
              <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:gap-2 transition-all">
                求人を見る <ChevronRight size={16} />
              </div>
           </div>

           {/* Path 2 */}
           <div 
             onClick={() => setView(ViewState.DASHBOARD)}
             className="bg-emerald-900 text-white p-8 rounded-3xl border border-emerald-800 shadow-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:scale-110 transition-transform relative z-10">
                <HeartHandshake className="w-7 h-7 text-emerald-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">就労支援機関と相談</h3>
              <p className="text-sm text-emerald-100 leading-relaxed mb-4 relative z-10">
                一人での就職活動が不安な方。専任の支援員がサポートします。
              </p>
              <div className="flex items-center text-emerald-300 font-bold text-sm group-hover:gap-2 transition-all relative z-10">
                支援員を探す <ChevronRight size={16} />
              </div>
           </div>

           {/* Path 3 */}
           <div 
             onClick={() => setView(ViewState.JOB_SEARCH)}
             className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-stone-200 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
           >
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Accessibility className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">A型・B型事業所</h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-4">
                体調に合わせて無理なく働きたい方。福祉就労の求人も掲載。
              </p>
              <div className="flex items-center text-orange-600 font-bold text-sm group-hover:gap-2 transition-all">
                事業所を探す <ChevronRight size={16} />
              </div>
           </div>
        </div>
      </section>

      {/* --- HONNE FILTER SECTION --- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
           <h2 className="text-3xl font-bold text-stone-800 mb-4">あなたの「本音」でマッチング</h2>
           <p className="text-stone-500">「通院で休みたい」「電話が苦手」など、<br/>なかなか言い出せない条件を、匿名で企業に伝えられます。</p>
        </div>
        {isContentLoad ? (
           <HonneFilter onSearch={() => setView(ViewState.JOB_SEARCH)} />
        ) : (
           <div className="h-48 bg-stone-100 rounded-3xl animate-pulse flex items-center justify-center">
              <Loader2 className="animate-spin text-stone-300" />
           </div>
        )}
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-100 relative overflow-hidden">
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
               <span className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-2 block">Our Support</span>
               <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-stone-800">
                  トコトコだけの<br/>安心サポート機能
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {/* Feature 1 */}
               <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                     <FileText size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-3">AI配慮事項アシスト</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                     「自分の障がいについてどう伝えたらいいかわからない」を解決。AIがあなたの特性に合わせた「配慮事項」の文章を作成します。
                  </p>
               </div>

               {/* Feature 2 */}
               <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                     <ShieldCheck size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-3">匿名・本音スカウト</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                     障がいの詳細や必要な配慮を登録しても、個人情報はブロック。企業はあなたの「スキル」と「配慮」を見てスカウトを送ります。
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                     <Smile size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-3">AI面接練習</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                     対人面接が不安な方のために、AI面接官が練習相手になります。「障がいについてどう説明するか」の練習も可能です。
                  </p>
               </div>

               {/* Feature 4 */}
               <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                     <EyeOff size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-3">クローズ就労対応</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                     障がいを開示せずに働きたい（クローズ就労）方にも対応。一般求人と障がい者枠求人をシームレスに検索できます。
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* --- MOCK JOBS SECTION --- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-4">
                新着求人
              </h2>
              <p className="text-stone-500">
                あなたらしく働ける場所が、きっと見つかります。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isContentLoad ? (
              MOCK_JOBS.map(job => (
                <JobCard key={job.id} job={job} onClick={() => setView(ViewState.JOB_SEARCH)} />
              ))
            ) : (
              [1, 2].map(i => (
                 <div key={i} className="h-80 bg-stone-100 rounded-3xl animate-pulse"></div>
              ))
            )}
          </div>
          
          <div className="mt-16 text-center">
             <button 
               onClick={() => setView(ViewState.JOB_SEARCH)}
               className="px-10 py-4 bg-white border-2 border-stone-900 text-stone-900 rounded-full font-bold hover:bg-stone-900 hover:text-white transition-all shadow-md"
             >
               すべての求人を見る
             </button>
          </div>
        </div>
      </section>

    </div>
  );
};