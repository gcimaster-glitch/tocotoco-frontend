import React, { useState } from 'react';
import { HonneFilterState } from '../types';
import { ShieldCheck, ChevronDown, ChevronUp, Tag, CircleDollarSign, PenLine, HeartHandshake } from 'lucide-react';

const HONNE_TAGS = [
  "週20時間未満", "完全在宅", "在宅勤務あり", "通院配慮あり", "フレックスタイム", "時差出勤",
  "電話対応なし", "対人業務なし", "マニュアル完備", "単純作業中心", "自分のペースで",
  "車椅子移動可能", "段差なし", "多目的トイレあり", "休憩室あり", "静かな環境",
  "筆談対応可", "音声読み上げソフト対応", "聴覚過敏配慮", "視覚支援あり",
  "産業医・カウンセラー", "定着支援あり", "ジョブコーチ支援", "手帳なしOK",
  "精神障がい者活躍中", "発達障がい者活躍中", "身体障がい者活躍中", "知的障がい者活躍中",
  "未経験歓迎", "資格取得支援", "正社員登用あり", "副業OK", "服装自由"
];

interface HonneFilterProps {
  onSearch?: () => void;
}

export const HonneFilter: React.FC<HonneFilterProps> = ({ onSearch }) => {
  const [filter, setFilter] = useState<HonneFilterState>({
    weeklyHolidays: 2,
    selectedTags: [],
    currentSalary: 200000,
    desiredIncreasePercent: 0,
    privateNotes: '',
    disabilityDisclosure: 'Open'
  });

  const [isOpen, setIsOpen] = useState(true);

  const toggleTag = (tag: string) => {
    if (filter.selectedTags.includes(tag)) {
      setFilter({ ...filter, selectedTags: filter.selectedTags.filter(t => t !== tag) });
    } else {
      setFilter({ ...filter, selectedTags: [...filter.selectedTags, tag] });
    }
  };

  const calculatedTarget = Math.round(filter.currentSalary * (1 + filter.desiredIncreasePercent / 100));

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
      <div className="bg-emerald-900 p-6 sm:p-8 text-white relative overflow-hidden cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <ShieldCheck className="text-emerald-400 w-8 h-8" />
               <h2 className="text-2xl font-bold tracking-tight">本音フィルター</h2>
            </div>
            <p className="text-emerald-100 text-sm">企業には匿名。あなたの「配慮事項」と「希望」でマッチング。</p>
          </div>
          <button className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-6 sm:p-8 bg-stone-50 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Section 1: Disclosure & Salary */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <h3 className="flex items-center gap-2 font-bold text-stone-800 mb-4 text-sm">
                  <HeartHandshake className="text-emerald-600" /> 障がいの開示について
                </h3>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex gap-2">
                   {['Open', 'Closed', 'Undecided'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setFilter({...filter, disabilityDisclosure: type as any})}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${filter.disabilityDisclosure === type ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500' : 'bg-stone-50 text-stone-500 border border-stone-200'}`}
                      >
                         {type === 'Open' ? '開示（オープン）' : type === 'Closed' ? '非開示（クローズ）' : '未定'}
                      </button>
                   ))}
                </div>
             </div>

             <div>
                <h3 className="flex items-center gap-2 font-bold text-stone-800 mb-4 text-sm">
                  <CircleDollarSign className="text-emerald-600" /> 希望月給（目安）
                </h3>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold">¥</span>
                   <input 
                     type="number"
                     value={filter.currentSalary}
                     onChange={(e) => setFilter({...filter, currentSalary: parseInt(e.target.value) || 0})}
                     className="w-full pl-8 pr-4 py-2 bg-transparent text-stone-900 font-bold text-lg outline-none"
                   />
                </div>
             </div>
          </div>

          {/* Section 2: Tags */}
          <div className="mb-10">
             <h3 className="flex items-center gap-2 font-bold text-stone-800 mb-4 text-sm">
              <Tag className="text-emerald-600" /> 必要な配慮・こだわり条件 (複数選択可)
            </h3>
            <div className="h-64 overflow-y-auto p-4 bg-white border border-stone-200 rounded-2xl shadow-inner scrollbar-thin">
              <div className="flex flex-wrap gap-2">
                {HONNE_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border
                      ${filter.selectedTags.includes(tag)
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-600'}
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right mt-2 text-xs text-stone-400">
              {filter.selectedTags.length}個 選択中
            </div>
          </div>

          {/* Section 3: Free Text */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 font-bold text-stone-800 mb-4 text-sm">
              <PenLine className="text-emerald-600" /> エージェントへの特記事項 (任意)
            </h3>
            <textarea 
              value={filter.privateNotes}
              onChange={(e) => setFilter({...filter, privateNotes: e.target.value})}
              placeholder="「通院のため水曜日は休みたい」「聴覚過敏があるためイヤーマフを使用したい」など、具体的な配慮事項があればご記入ください。"
              className="w-full p-4 bg-white text-stone-900 border border-stone-200 rounded-xl h-32 focus:ring-2 focus:ring-emerald-500 outline-none resize-none placeholder-stone-400 shadow-sm text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={onSearch}
              className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-500 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <ShieldCheck size={20} />
              条件を保存してマッチングを見る
            </button>
          </div>

        </div>
      )}
    </div>
  );
};