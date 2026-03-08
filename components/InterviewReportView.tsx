import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  CheckCircle2, ArrowLeft, RefreshCw, TrendingUp, TrendingDown,
  Star, AlertCircle, ChevronRight, Calendar, Briefcase, BarChart2
} from 'lucide-react';
import { ViewState, InterviewReportRecord } from '../types';
import { PageHeader } from './PageHeader';

// ============================================================
// 型定義
// ============================================================

interface InterviewReportViewProps {
  report: InterviewReportRecord;
  setView?: (view: ViewState) => void;
  onRetry?: () => void;
}

// ============================================================
// スコアバッジ
// ============================================================

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getGrade = (s: number) => {
    if (s >= 90) return { label: 'S', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (s >= 80) return { label: 'A', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (s >= 70) return { label: 'B', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (s >= 60) return { label: 'C', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'D', color: 'bg-red-100 text-red-700 border-red-200' };
  };
  const grade = getGrade(score);
  return (
    <div className="flex items-center gap-3">
      <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${grade.color}`}>
        {grade.label}
      </div>
      <div>
        <div className="text-3xl font-black text-stone-900">{score}<span className="text-lg font-normal text-stone-400">/100</span></div>
        <div className="text-xs text-stone-500 font-bold">総合評価スコア</div>
      </div>
    </div>
  );
};

// ============================================================
// スコアゲージ
// ============================================================

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-blue-500';
    return 'bg-yellow-500';
  };
  return (
    <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${getColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
};

// ============================================================
// メインコンポーネント
// ============================================================

export const InterviewReportView: React.FC<InterviewReportViewProps> = ({
  report,
  setView,
  onRetry,
}) => {
  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : '日時不明';

  return (
    <div className="w-full">
      <PageHeader
        title="AI面接 分析レポート"
        subtitle="あなたの面接を詳しく分析しました"
        breadcrumbs={[
          { label: 'AI面接', view: ViewState.INTERVIEW_PRACTICE },
          { label: 'レポート' },
        ]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* ヘッダーカード：スコア・基本情報 */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center gap-2 text-emerald-100 text-sm font-bold mb-3">
              <CheckCircle2 size={16} />
              <span>面接分析完了</span>
            </div>
            <h2 className="text-2xl font-black mb-1">{report.jobTitle}</h2>
            {report.company && report.company !== '不明な企業' && (
              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                <Briefcase size={14} />
                <span>{report.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-emerald-100 text-xs mt-2">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <ScoreBadge score={report.score} />
              <div className="flex-1">
                <ScoreGauge score={report.score} />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 強み・弱みタグ */}
        {(report.strengthsTags.length > 0 || report.weaknessesTags.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.strengthsTags.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3">
                  <TrendingUp size={16} />
                  <span>強み・アピールポイント</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.strengthsTags.map((tag, i) => (
                    <span key={i} className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {report.weaknessesTags.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-3">
                  <TrendingDown size={16} />
                  <span>改善できるポイント</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.weaknessesTags.map((tag, i) => (
                    <span key={i} className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 改善点サマリー */}
        {report.improvementSummary && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
              <AlertCircle size={16} />
              <span>次回に向けたアドバイス</span>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{report.improvementSummary}</p>
          </div>
        )}

        {/* 詳細レポート（Markdown） */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
            <BarChart2 size={18} className="text-stone-500" />
            <h3 className="font-bold text-stone-800">詳細フィードバック</h3>
          </div>
          <div className="p-6 sm:p-8">
            <article className="prose prose-stone prose-sm max-w-none
              prose-headings:font-bold prose-headings:text-stone-800
              prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
              prose-p:text-stone-700 prose-p:leading-relaxed
              prose-strong:text-stone-900
              prose-li:text-stone-700
              prose-blockquote:border-emerald-400 prose-blockquote:bg-emerald-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1">
              <ReactMarkdown>{report.reportMarkdown}</ReactMarkdown>
            </article>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-stone-200 text-stone-600 font-bold rounded-2xl hover:bg-stone-50 transition-all"
            >
              <RefreshCw size={18} />
              もう一度練習する
            </button>
          )}
          <button
            onClick={() => setView && setView(ViewState.INTERVIEW_REPORT_LIST)}
            className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-emerald-200 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all"
          >
            <BarChart2 size={18} />
            レポート一覧を見る
          </button>
          <button
            onClick={() => setView && setView(ViewState.DASHBOARD)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-lg"
          >
            マイページへ戻る
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
