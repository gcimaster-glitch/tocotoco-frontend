import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic, MicOff, Send, StopCircle, Loader2, FileCheck,
  RefreshCw, HelpCircle, Volume2, CheckCircle2, ArrowRight,
  MessageSquare, User, Bot, Globe, ChevronDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Job, ViewState } from '../types';
import { PageHeader } from './PageHeader';
import { generateInterviewReport as generateInterviewReportApi, StructuredReportResult } from '../services/geminiService';

// ============================================================
// 型定義
// ============================================================

interface InterviewPracticeProps {
  job: Job | null;
  onComplete?: (result: StructuredReportResult) => void;
  setView?: (view: ViewState) => void;
}

interface Message {
  speaker: 'ai' | 'user';
  text: string;
}

type Step = 'intro' | 'interview' | 'review' | 'generating' | 'complete';

// ============================================================
// Web Speech API の型定義（ブラウザ標準API）
// ============================================================

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// ============================================================
// バックエンドAPI呼び出し
// ============================================================

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'https://tocotoco-backend.gcimaster.workers.dev';

async function fetchAIInterviewMessage(
  jobTitle: string,
  userAnswer: string,
  history: Message[]
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/ai/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobTitle,
      userAnswer,
      history: history.map(m => ({ role: m.speaker, text: m.text })),
    }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json() as { message: string };
  return data.message || 'ありがとうございます。次の質問に移りましょう。';
}

// ============================================================
// 音声読み上げ（Web Speech Synthesis API）
// ============================================================

function speakText(text: string, lang: 'ja' | 'en'): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ja' ? 'ja-JP' : 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// ============================================================
// AI面接練習コンポーネント本体
// ============================================================

export const InterviewPractice: React.FC<InterviewPracticeProps> = ({
  job,
  onComplete,
  setView,
}) => {
  const isPracticeMode = !job;

  // ステップ管理
  const [step, setStep] = useState<Step>('intro');

  // 会話管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // 音声認識
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // 言語設定
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');

  // スクロール用
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // 初期化
  // ============================================================

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // ============================================================
  // 面接開始：AIからの最初のメッセージを取得
  // ============================================================

  const startInterview = useCallback(async () => {
    setStep('interview');
    setMessages([]);
    setIsAiThinking(true);

    const jobTitle = job?.title || '一般事務・軽作業（障がい者枠）';

    try {
      // 最初のメッセージ：AIからアイスブレイクを開始
      const firstMessage = await fetchAIInterviewMessage(
        jobTitle,
        '（面接開始。求職者が入室しました。）',
        []
      );
      const aiMsg: Message = { speaker: 'ai', text: firstMessage };
      setMessages([aiMsg]);
      speakText(firstMessage, language);
    } catch (err) {
      console.error(err);
      const fallback = language === 'ja'
        ? 'こんにちは。本日はお越しいただきありがとうございます。緊張されていますか？まずは深呼吸して、リラックスしてください。'
        : 'Hello! Thank you for joining us today. Please take a deep breath and relax.';
      setMessages([{ speaker: 'ai', text: fallback }]);
      speakText(fallback, language);
    } finally {
      setIsAiThinking(false);
    }
  }, [job, language]);

  // ============================================================
  // ユーザーの回答を送信
  // ============================================================

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isAiThinking) return;

    const userMsg: Message = { speaker: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsAiThinking(true);

    const jobTitle = job?.title || '一般事務・軽作業（障がい者枠）';

    try {
      const aiResponse = await fetchAIInterviewMessage(jobTitle, text, newMessages);
      const aiMsg: Message = { speaker: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMsg]);
      speakText(aiResponse, language);
    } catch (err) {
      console.error(err);
      const errorMsg = language === 'ja'
        ? 'ありがとうございます。少し接続が不安定なようです。もう一度お話しいただけますか？'
        : 'Thank you. There seems to be a connection issue. Could you please repeat that?';
      setMessages(prev => [...prev, { speaker: 'ai', text: errorMsg }]);
    } finally {
      setIsAiThinking(false);
    }
  }, [inputText, messages, isAiThinking, job, language]);

  // ============================================================
  // 音声認識
  // ============================================================

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognition();
    recognition.lang = language === 'ja' ? 'ja-JP' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText(prev => prev + finalTranscript);
      } else if (interimTranscript) {
        setInputText(interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // ============================================================
  // 面接終了 → レビュー画面へ
  // ============================================================

  const handleFinish = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) recognitionRef.current.abort();
    setIsListening(false);
    setStep('review');
  }, []);

  // ============================================================
  // レポート生成・提出
  // ============================================================

  const handleSubmit = useCallback(async () => {
    setStep('generating');
    const jobTitle = job?.title || '一般事務・軽作業（障がい者枠）';
    const structured = await generateInterviewReportApi(jobTitle, messages);
    if (onComplete) {
      // onCompleteが設定されている場合は外部（App.tsx）が画面遷移を管理するため
      // setStep('complete')は呼ばない
      onComplete(structured);
    } else {
      setStep('complete');
    }
  }, [job, messages, onComplete]);

  const handleRetry = useCallback(() => {
    setMessages([]);
    setInputText('');
    setStep('intro');
  }, []);

  // ============================================================
  // Enterキーで送信
  // ============================================================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============================================================
  // レンダリング：イントロ画面
  // ============================================================

  if (step === 'intro') {
    return (
      <div className="w-full">
        <PageHeader
          title={isPracticeMode ? 'AI模擬面接 (練習)' : 'AI一次面接 (本番)'}
          subtitle={
            isPracticeMode
              ? '配慮事項の伝え方を練習しましょう'
              : 'この面接結果は企業に送信されます'
          }
          breadcrumbs={[{ label: isPracticeMode ? '面接練習' : '一次面接' }]}
          setView={setView}
          backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
        />

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
            {/* ヘッダー */}
            <div
              className={`p-8 text-white ${
                isPracticeMode ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">
                {isPracticeMode
                  ? 'トコトコ AI面接練習'
                  : '一次面接を開始します'}
              </h2>
              <p className="opacity-90 text-sm leading-relaxed">
                {isPracticeMode
                  ? '面接でよく聞かれる「障がいの状況」や「必要な配慮」についての説明を練習できます。AIが優しく質問しますので、自分のペースで答えてください。'
                  : `応募先: ${job?.company}。リラックスして、あなたの言葉でお話しください。`}
              </p>
            </div>

            <div className="p-8">
              {/* 言語選択 */}
              <div className="flex items-center gap-3 mb-8 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <Globe size={18} className="text-stone-400" />
                <span className="text-sm font-bold text-stone-600">面接言語：</span>
                <div className="flex bg-white rounded-full p-1 border border-stone-200">
                  <button
                    onClick={() => setLanguage('ja')}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                      language === 'ja'
                        ? 'bg-stone-900 text-white shadow'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    日本語
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                      language === 'en'
                        ? 'bg-stone-900 text-white shadow'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* 3ステップ説明 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="flex flex-col items-center text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-emerald-600">
                    <MessageSquare size={28} />
                  </div>
                  <h3 className="font-bold mb-1">1. AIと対話</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    AI面接官が選択肢を提示しながら質問します。テキストまたは音声で回答できます。
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-emerald-600">
                    <Volume2 size={28} />
                  </div>
                  <h3 className="font-bold mb-1">2. 音声対応</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    マイクボタンで話すと文字に変換されます。AIの回答は音声でも読み上げます。
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-emerald-600">
                    <FileCheck size={28} />
                  </div>
                  <h3 className="font-bold mb-1">3. フィードバック</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    回答内容をAIが分析し、改善点やアドバイスをレポートで提供します。
                  </p>
                </div>
              </div>

              {/* 安心ガイド */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8">
                <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                  <HelpCircle size={16} /> 安心してご利用ください
                </h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• 言葉に詰まっても大丈夫です。AIはあなたのペースに合わせます</li>
                  <li>• 通院・服薬・環境調整など、必要な配慮は遠慮なく伝えてください</li>
                  <li>• 体調が悪くなったら、いつでも「終了」ボタンで中断できます</li>
                </ul>
              </div>

              {/* 開始ボタン */}
              <div className="flex justify-center">
                <button
                  onClick={startInterview}
                  className={`px-12 py-4 rounded-full font-bold text-lg text-white shadow-lg hover:scale-105 transition-transform flex items-center gap-2 ${
                    isPracticeMode
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isPracticeMode ? '練習を開始する' : '面接を開始する'}{' '}
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // レンダリング：レビュー・生成中・完了画面
  // ============================================================

  if (step === 'review' || step === 'generating' || step === 'complete') {
    return (
      <div className="w-full">
        <PageHeader
          title={step === 'complete' ? '完了' : '面接終了'}
          subtitle="お疲れ様でした"
          breadcrumbs={[
            { label: 'AI面接', view: ViewState.INTERVIEW_PRACTICE },
            { label: 'レポート' },
          ]}
          setView={setView}
          backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
        />

        <div className="max-w-3xl mx-auto p-6">
          {step === 'generating' || step === 'complete' ? (
            <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-12 flex flex-col items-center text-center">
              {step === 'generating' ? (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mb-6" />
                  <h2 className="text-2xl font-bold mb-2">レポート生成中...</h2>
                  <p className="text-stone-500">AIがあなたの回答を分析しています（約10秒）</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
                  <h2 className="text-2xl font-bold mb-2">完了しました！</h2>
                  <p className="text-stone-500 mb-8">
                    フィードバックを確認して、今後の活動に活かしましょう。
                  </p>
                  <button
                    onClick={() => setView && setView(ViewState.DASHBOARD)}
                    className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors"
                  >
                    マイページへ戻る
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-8">
              <h2 className="text-2xl font-bold mb-6 text-stone-800 border-b border-stone-100 pb-4">
                {isPracticeMode ? '練習結果の確認' : '提出前の最終確認'}
              </h2>

              {/* 会話履歴 */}
              <div className="bg-stone-50 rounded-2xl p-4 mb-8 max-h-96 overflow-y-auto border border-stone-100 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-stone-400 text-center py-4">会話履歴がありません。</p>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${m.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          m.speaker === 'ai'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {m.speaker === 'ai' ? <Bot size={16} /> : <User size={16} />}
                      </div>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                          m.speaker === 'ai'
                            ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                            : 'bg-emerald-50 text-emerald-900 rounded-tr-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-8 py-4 border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> やり直す
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  {isPracticeMode ? '分析レポートを見る' : 'この内容で企業に提出する'}{' '}
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // レンダリング：面接中（メインチャット画面）
  // ============================================================

  return (
    <div className="w-full">
      <PageHeader
        title={isPracticeMode ? 'AI模擬面接' : 'AI一次面接'}
        subtitle="自分のペースで、焦らずお話しください"
        breadcrumbs={[{ label: isPracticeMode ? '面接練習' : '一次面接' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインチャットエリア */}
          <div className="lg:col-span-2 flex flex-col">
            {/* 面接官プロフィール */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 flex items-center gap-4 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
                alt="面接官"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100"
              />
              <div>
                <div className="font-bold text-stone-800">佐藤 由美子</div>
                <div className="text-xs text-stone-500">
                  {job?.company || 'トコトコ'} 採用担当 ／ 障がい者雇用専門
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-600">ON AIR</span>
              </div>
            </div>

            {/* チャット履歴 */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex-1 min-h-[400px] max-h-[500px] overflow-y-auto p-4 space-y-4 mb-4">
              {messages.length === 0 && isAiThinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-none p-3">
                    <div className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      m.speaker === 'ai'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {m.speaker === 'ai' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      m.speaker === 'ai'
                        ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                        : 'bg-emerald-50 text-emerald-900 rounded-tr-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* AI思考中インジケーター（メッセージがある場合） */}
              {messages.length > 0 && isAiThinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-none p-3">
                    <div className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-3">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? '🎤 聞き取り中...'
                    : isAiThinking
                    ? 'AIが回答を考えています...'
                    : '回答を入力してください（Enterで送信、Shift+Enterで改行）'
                }
                disabled={isAiThinking}
                rows={3}
                className="w-full resize-none text-sm text-stone-800 placeholder-stone-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                <div className="flex gap-2">
                  {/* 音声入力ボタン */}
                  {speechSupported && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={isAiThinking}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={14} /> 停止
                        </>
                      ) : (
                        <>
                          <Mic size={14} /> 音声入力
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* 終了ボタン */}
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-1.5 px-4 py-2 border-2 border-stone-200 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all"
                  >
                    <StopCircle size={14} /> 面接を終了する
                  </button>

                  {/* 送信ボタン */}
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isAiThinking}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAiThinking ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* サイドパネル：安心ガイド */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm sticky top-20">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 text-base border-b border-stone-100 pb-3">
                <HelpCircle size={18} className="text-emerald-500" /> 安心ガイド
              </h3>

              <div className="space-y-4 text-sm">
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <h4 className="font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Volume2 size={14} className="text-emerald-500" /> ゆっくりで大丈夫
                  </h4>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    言葉に詰まっても焦る必要はありません。AIはあなたのペースに合わせて話を聞きます。
                  </p>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <h4 className="font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Mic size={14} className="text-emerald-500" /> 配慮事項について
                  </h4>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    通院の頻度、苦手な業務、必要な環境調整などがあれば、遠慮なく伝えてください。
                  </p>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <h4 className="font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-500" /> 回答のヒント
                  </h4>
                  <ul className="text-stone-500 text-xs leading-relaxed space-y-1">
                    <li>• 「A か B で言えば A です」と選択肢で答えてもOK</li>
                    <li>• 「少し考えさせてください」と言っても大丈夫</li>
                    <li>• 短い回答でも問題ありません</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-400">
                  体調が悪くなった場合は、無理せず「終了」ボタンを押してください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
