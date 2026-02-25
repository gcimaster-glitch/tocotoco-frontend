import React from 'react';
import { ViewState } from '../types';
import { ChevronRight, Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: { label: string; view?: ViewState }[];
  setView?: (view: ViewState) => void;
  backgroundImage?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, setView, backgroundImage }) => {
  return (
    <div className="relative w-full h-[160px] overflow-hidden group border-b border-stone-200 mb-6 shadow-sm">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
        style={{ 
          backgroundImage: `url(${backgroundImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'})` 
        }}
      >
        <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[1px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 text-white">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-stone-400 mb-3" aria-label="Breadcrumb">
          <button 
            onClick={() => setView && setView(ViewState.HOME)} 
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <Home size={12} /> Home
          </button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={10} className="text-stone-600" />
              {crumb.view && setView ? (
                <button onClick={() => setView(crumb.view!)} className="hover:text-white transition-colors">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-stone-200">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Titles */}
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-stone-400 text-xs md:text-sm font-medium border-l-2 border-emerald-500 pl-3">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};