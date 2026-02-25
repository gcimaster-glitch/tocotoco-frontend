import React from 'react';
import { Job } from '../types';
import { MapPin, JapaneseYen, Building2, Lock, Sparkles, Clock, Briefcase, ArrowUpRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const isClosed = job.isClosed;
  const isAgent = job.type === 'Agent';

  return (
    <div 
      onClick={onClick}
      className={`
        relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300
        bg-white border hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-100
        ${isClosed ? 'border-amber-200 bg-amber-50/50' : 'border-stone-200'}
        flex flex-col h-full
      `}
    >
      {/* --- Card Header / Image Section --- */}
      <div className="relative h-56 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors z-10"></div>
        {isClosed ? (
           <div className="w-full h-full bg-stone-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-stone-900/5 backdrop-blur-[2px]"></div>
              <div className="text-center z-10">
                <Lock className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                <span className="text-stone-500 font-bold tracking-widest">PRIVATE OFFER</span>
              </div>
           </div>
        ) : (
           <img src={job.imageUrl} alt={job.company} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {job.startDate === 'Immediate' && (
            <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 w-fit">
              <Clock size={10} /> 急募
            </span>
          )}
          {isAgent && (
            <span className="bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 w-fit">
              <Briefcase size={10} /> エージェント経由
            </span>
          )}
        </div>

        {/* Celebration Money Badge */}
        {!isClosed && job.celebrationMoney > 0 && (
          <div className="absolute bottom-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 z-20 border border-white/20">
            <Sparkles size={12} fill="currentColor" /> 
            祝い金 {job.celebrationMoney.toLocaleString()}円
          </div>
        )}
      </div>

      {/* --- Card Body --- */}
      <div className="p-6 flex flex-col flex-grow relative">
        
        {/* Company & Type */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-bold uppercase tracking-wider">
            <Building2 size={12} />
            <span className="truncate max-w-[150px]">{job.company}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isClosed ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
            {job.type}
          </span>
        </div>

        {/* Catchphrase - Clickable & Large */}
        <div className="mb-6 group/title">
           <h2 className="text-xl md:text-2xl font-black text-stone-900 leading-snug group-hover:text-emerald-700 transition-colors flex items-start gap-2">
             {job.catchphrase || job.title}
             <ArrowUpRight className="text-stone-300 group-hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-1" size={20} />
           </h2>
           {!isClosed && <p className="text-xs text-stone-400 mt-1 line-clamp-1">{job.title}</p>}
        </div>

        {/* Prominent Metrics Area */}
        <div className="mt-auto bg-stone-50 rounded-2xl p-4 border border-stone-100 group-hover:border-emerald-200 transition-colors">
           <div className="grid grid-cols-1 gap-3">
              {/* Salary */}
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <JapaneseYen size={14} className="text-emerald-700" />
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-stone-400">想定年収/月給</div>
                    <div className="text-lg md:text-xl font-black text-stone-800 tracking-tight leading-none">
                       {job.salary}
                    </div>
                 </div>
              </div>
              
              {/* Location */}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-200/50">
                 <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-stone-600" />
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-stone-400">勤務地</div>
                    <div className="text-sm font-bold text-stone-700 leading-none">
                       {job.location}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-5">
          {job.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] font-medium text-stone-500 bg-white border border-stone-200 px-2 py-1 rounded-md">
              #{tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="text-[10px] font-medium text-stone-400 px-1 py-1">+ {job.tags.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
};