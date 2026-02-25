import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpPopoverProps {
  title?: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpPopover: React.FC<HelpPopoverProps> = ({ title, content, position = 'top' }) => {
  return (
    <div className="relative group inline-flex items-center ml-1 z-20">
      <HelpCircle 
        size={14} 
        className="text-stone-400 hover:text-emerald-600 cursor-help transition-colors" 
      />
      
      <div className={`
        absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200
        w-64 bg-stone-900 text-white text-xs rounded-xl p-3 shadow-xl border border-stone-700
        ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
        ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
        ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
        ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
      `}>
        {/* Arrow */}
        <div className={`
          absolute w-2 h-2 bg-stone-900 transform rotate-45
          ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
          ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
          ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
          ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
        `}></div>

        {title && <div className="font-bold text-emerald-400 mb-1">{title}</div>}
        <div className="leading-relaxed text-stone-300">{content}</div>
      </div>
    </div>
  );
};