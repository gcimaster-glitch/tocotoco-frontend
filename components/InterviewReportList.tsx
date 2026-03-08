import React from 'react';
import {
  BarChart2, ChevronRight, Calendar, Briefcase, TrendingUp,
  TrendingDown, Star, FileText, RefreshCw
} from 'lucide-react';
import { ViewState, InterviewReportRecord } from '../types';
import { PageHeader } from './PageHeader';

// ============================================================
// 型定義
// ============================================================

interface InterviewReportListProps {
  reports: InterviewReportRecord[];
  setView?: (view: ViewState) => void;
  onSelectReport?: (report: InterviewReportRecord) => void;
}

// ============================================================
// スコアバッジ（コンパクト版）
// ============================================================

const ScoreBadgeSmall: React.FC<{ score: number }> = ({ score }) => {
  const getStyle = (s: number) => {
    if (s >= 90) return { label: 'S', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (s >= 80) return { label: 'A', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (s >= 70) return { label: 'B', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (s >= 60) return { label: 'C', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'D', color: 'bg-red-100 text-red-700 border-red-200' };
  };
  const style = getStyle(score);
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-black text-sm ${style.color}`}>
      <span>{style.label}</span>
      <span className="font-normal text-xs opacity-70">{score}点</span>
    </div>
  );
};

// ============================================================
// 成長グラフ（スコア推移の簡易ビジュアライゼーション）
// ============================================================

const GrowthChart: React.FC<{ reports: InterviewReportRecord[] }> = ({ reports }) => {
  if (reports.length < 2) return null;

  const sorted = [...reports].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const maxScore = 100;
  const chartHeight = 80;
  const chartWidth = 300;
  const padding = 20;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const points = sorted.map((r, i) => {
    const x = padding + (i / (sorted.length - 1)) * innerWidth;
    const y = padding + (1 - r.score / maxScore) * innerHeight;
    return { x, y, score: r.score };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const latestScore = sorted[sorted.length - 1].score;
  const firstScore = sorted[0].score;
  const diff = latestScore - firstScore;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-stone-700 font-bold text-sm">
          <BarChart2 size={16} className="text-emerald-500" />
          <span>スコア推移</span>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {diff >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{diff >= 0 ? '+' : ''}{diff}点</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-20">
        {/* グリッドライン */}
        {[25, 50, 75].map(pct => {
          const y = padding + (1 - pct / 100) * innerHeight;
          return (
            <line key={pct} x1={padding} y1={y} x2={chartWidth - padding} y2={y}
              stroke="#e7e5e4" strokeWidth="1" strokeDasharray="4,4" />
          );
        })}
        {/* 折れ線 */}
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* データポイント */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>第1回</span>
        <span>第{sorted.length}回</span>
      </div>
    </div>
  );
};

// ============================================================
// メインコンポーネント
// ============================================================

export const InterviewReportList: React.FC<InterviewReportListProps> = ({
  reports,
  setView,
  onSelectReport,
}) => {
  const sorted = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length)
    : 0;

  const bestScore = reports.length > 0
    ? Math.max(...reports.map(r => r.score))
    : 0;

  return (
    <div className="w-full">
      <PageHeader
        title="AI面接レポート一覧"
        subtitle="これまでの練習記録と成長を確認しましょう"
        breadcrumbs={[
          { label: 'マイページ', view: ViewState.DASHBOARD },
          { label: 'レポート一覧' },
        ]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* サマリーカード */}
        {reports.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-stone-900">{reports.length}</div>
              <div className="text-xs text-stone-500 font-bold mt-1">練習回数</div>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-emerald-600">{avgScore}</div>
              <div className="text-xs text-stone-500 font-bold mt-1">平均スコア</div>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-purple-600">{bestScore}</div>
              <div className="text-xs text-stone-500 font-bold mt-1">最高スコア</div>
            </div>
          </div>
        )}

        {/* 成長グラフ */}
        {reports.length >= 2 && <GrowthChart reports={reports} />}

        {/* レポートリスト */}
        {sorted.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-12 text-center">
            <FileText size={48} className="text-stone-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-500 mb-2">まだレポートがありません</h3>
            <p className="text-sm text-stone-400 mb-6">AI面接練習を行うと、ここにレポートが保存されます。</p>
            <button
              onClick={() => setView && setView(ViewState.INTERVIEW_PRACTICE)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-md"
            >
              面接練習を始める
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-500 px-1">練習履歴（新しい順）</h3>
            {sorted.map((report, index) => {
              const date = report.createdAt
                ? new Date(report.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })
                : '日時不明';
              return (
                <button
                  key={report.id}
                  onClick={() => onSelectReport && onSelectReport(report)}
                  className="w-full bg-white rounded-2xl border border-stone-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-stone-400">第{sorted.length - index}回</span>
                        <span className="text-xs text-stone-300">|</span>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {date}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-800 text-sm truncate">{report.jobTitle}</h4>
                      {report.company && report.company !== '不明な企業' && (
                        <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                          <Briefcase size={11} />
                          <span>{report.company}</span>
                        </div>
                      )}
                      {report.strengthsTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {report.strengthsTags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <ScoreBadgeSmall score={report.score} />
                      <ChevronRight size={16} className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 面接練習へのCTA */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => setView && setView(ViewState.INTERVIEW_PRACTICE)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-lg"
          >
            <RefreshCw size={18} />
            新しく練習する
          </button>
          <button
            onClick={() => setView && setView(ViewState.DASHBOARD)}
            className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-stone-200 text-stone-600 font-bold rounded-2xl hover:bg-stone-50 transition-all"
          >
            マイページへ
          </button>
        </div>
      </div>
    </div>
  );
};
