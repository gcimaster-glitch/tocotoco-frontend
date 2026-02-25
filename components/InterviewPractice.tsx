import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, StopCircle, Loader2, FileCheck, Settings, Volume2, RefreshCw, Send, HelpCircle, Globe, CheckCircle2, ArrowRight, Headphones, MessageSquare } from 'lucide-react';
import { Job, ViewState } from '../types';
import { PageHeader } from './PageHeader';
import { generateInterviewReport as generateInterviewReportApi } from '../services/geminiService';

interface InterviewPracticeProps {
  job: Job | null;
  onComplete?: (report: string) => void;
  setView?: (view: ViewState) => void;
}

const INTERVIEWER_IMAGE_URL = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop";

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) { int16[i] = Math.max(-1, Math.min(1, data[i])) * 32768; }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
}
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}

export const InterviewPractice: React.FC<InterviewPracticeProps> = ({ job, onComplete, setView }) => {
  const isPracticeMode = !job; 
  
  const [step, setStep] = useState<'intro' | 'ready' | 'interview' | 'review' | 'generating' | 'complete'>('intro');
  const [isConnected, setIsConnected] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false); 
  const [connectionTimer, setConnectionTimer] = useState(0); 
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');
  
  // Real-time buffers
  const [currentInputTrans, setCurrentInputTrans] = useState('');
  const [currentOutputTrans, setCurrentOutputTrans] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null); 
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Refs for accessing state in callbacks/cleanup
  const transcriptsRef = useRef<any[]>([]);
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  
  const unmuteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  useEffect(() => {
    currentInputRef.current = currentInputTrans;
  }, [currentInputTrans]);

  useEffect(() => {
    currentOutputRef.current = currentOutputTrans;
  }, [currentOutputTrans]);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  const cleanupSession = () => {
      // Flush any remaining text in buffers to transcript immediately to Ref
      if (currentInputRef.current || currentOutputRef.current) {
          const newItems = [];
          if (currentInputRef.current.trim()) newItems.push({ speaker: 'user', text: currentInputRef.current });
          if (currentOutputRef.current.trim()) newItems.push({ speaker: 'ai', text: currentOutputRef.current });
          
          if (newItems.length > 0) {
             transcriptsRef.current = [...transcriptsRef.current, ...newItems];
             setTranscripts(transcriptsRef.current);
          }
          // Clear buffers
          setCurrentInputTrans('');
          setCurrentOutputTrans('');
          currentInputRef.current = '';
          currentOutputRef.current = '';
      }

      if (sourcesRef.current) {
        for (const source of sourcesRef.current) {
          try { source.stop(); } catch (e) {}
        }
        sourcesRef.current.clear();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (unmuteTimerRef.current) {
        clearTimeout(unmuteTimerRef.current);
      }
      if (connectionIntervalRef.current) {
        clearInterval(connectionIntervalRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setIsConnected(false);
      setIsPreparing(false);
      setIsAiSpeaking(false);
      setConnectionTimer(0);
  };

  const handleFinishRecording = async () => {
    cleanupSession();
    // Allow a small delay for state propagation if needed, but Ref is already updated
    setTimeout(() => {
        setStep('review');
    }, 100);
  };

  const handleRetry = () => {
    setTranscripts([]);
    setStep('intro');
    setStatusMessage('');
  };

  const handleSubmit = async () => {
    setStep('generating');
    setStatusMessage('AIが面接データを解析し、フィードバックレポートを生成中です... (約10秒)');
    const report = await generateInterviewReport(job, transcriptsRef.current);
    if (onComplete) {
      onComplete(report);
    }
    setStep('complete');
  };

  const generateInterviewReport = async (job: Job | null, transcript: any[]) => {
    const jobTitle = job?.title || '一般事務・軽作業（障がい者枠）';
    return await generateInterviewReportApi(jobTitle, transcript);
  };

  const handleStartClick = () => {
    if (countdown !== null) return;
    setStatusMessage('Initializing microphone...');
    setCountdown(3);
    
    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(timer);
        setCountdown(null);
        startSession();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const startSession = async () => {
    try {
      setStep('interview');
      setIsError(false);
      setErrorMessage('');
      setStatusMessage('Connecting...');
      setTranscripts([]);
      setCurrentInputTrans('');
      setCurrentOutputTrans('');
      
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key is missing");

      // Improved audio constraints for better quality/less echo
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // Resume AudioContext if suspended (browser policy)
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      const companyName = job?.company || (language === 'en' ? 'Global Inclusive Co.' : '株式会社トコトコ・パートナーズ');
      
      // SIGNIFICANTLY IMPROVED SYSTEM INSTRUCTION FOR ACCESSIBILITY
      const systemInstruction = language === 'ja' ? `
        あなたは、障がい者雇用に特化した企業「${companyName}」の採用担当者（佐藤、女性）です。
        相手は障がいや特性による配慮を必要としている求職者です。非常に緊張している可能性があります。

        【最重要：進行ルール】
        1. **アイスブレイク必須**: 
           - 冒頭は「こんにちは。本日はありがとうございます。緊張されていますか？」「お部屋の温度は大丈夫ですか？」など、**必ず雑談から**入ってください。いきなり志望動機を聞くのは禁止です。
        
        2. **質問は「選択肢」で**:
           - 障がい特性により、オープンクエスチョン（「自由に話してください」）は負担になります。
           - **必ず2〜3の選択肢**を提示してください。
           - 例：「お仕事の環境についてですが、 A. 静かな場所で一人で作業する、 B. 周りと相談しながら作業する、 どちらが得意ですか？」
           - 相手が選んだ後に、「ありがとうございます。詳しく教えていただけますか？」と優しく深掘りしてください。

        3. **ワンイシュー**: 
           - 一度に一つのことしか聞かないでください。

        4. **沈黙を許容する**:
           - 相手が黙っていても、思考中ですので、絶対に急かさないでください。
           - 相槌は「はい」「うんうん」と優しく。

        【確認事項】
        - 職務経歴、得意なこと
        - 必要な配慮（通院、環境、コミュニケーション）
      ` : `
        You are a supportive recruiter named Sato.
        1. Start with an ice-breaker to relax the candidate.
        2. Provide CHOICES for every question (e.g., "Do you prefer A or B?").
        3. Ask only one thing at a time.
        4. Be patient with silence.
      `;

      const voiceName = language === 'ja' ? 'Aoede' : 'Puck'; 

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsPreparing(true);
            setConnectionTimer(0);
            setStatusMessage(language === 'ja' ? '面接官を呼び出しています...' : 'Calling the recruiter...');
            
            // IMMEDIATE ICE-BREAKER TRIGGER
            // Force the AI to speak first to relieve user tension
            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                    session.send({ parts: [{ text: "（指示：面接を開始します。求職者が緊張しているかもしれないので、まずは優しく挨拶し、天気や体調などの話題でアイスブレイクを行ってください。まだ志望動機などの本題には入らないでください。）" }], role: "user" });
                });
            }

            if (connectionIntervalRef.current) clearInterval(connectionIntervalRef.current);
            connectionIntervalRef.current = setInterval(() => {
                setConnectionTimer(prev => prev + 1);
            }, 1000);

            const source = inputCtx.createMediaStreamSource(stream);
            const gainNode = inputCtx.createGain();
            micGainNodeRef.current = gainNode;
            gainNode.gain.value = 1.0;

            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                 sessionPromiseRef.current.then((session) => {
                   session.sendRealtimeInput({ media: pcmBlob });
                 });
              }
            };

            source.connect(gainNode);
            gainNode.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Text Stream
             if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setCurrentOutputTrans(prev => prev + text);
             } else if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setCurrentInputTrans(prev => prev + text);
             }

             // Commit to transcript history on turn complete
             if (message.serverContent?.turnComplete) {
                setTranscripts(prev => {
                   const newItems = [];
                   if (currentInputRef.current.trim()) newItems.push({ speaker: 'user', text: currentInputRef.current });
                   if (currentOutputRef.current.trim()) newItems.push({ speaker: 'ai', text: currentOutputRef.current });
                   
                   // Update Ref immediately for data consistency
                   if (newItems.length > 0) {
                       transcriptsRef.current = [...prev, ...newItems];
                   }
                   return [...prev, ...newItems];
                });
                setCurrentInputTrans('');
                setCurrentOutputTrans('');
             }

             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (base64Audio) {
               if (isPreparing) {
                 setIsPreparing(false);
                 if (connectionIntervalRef.current) clearInterval(connectionIntervalRef.current);
               }
               
               // AI starts speaking -> Clear silence timer immediately
               if (silenceTimerRef.current) {
                 clearTimeout(silenceTimerRef.current);
                 silenceTimerRef.current = null;
               }

               // Mute mic while AI speaks to prevent echo/interruption loop
               if (micGainNodeRef.current) micGainNodeRef.current.gain.value = 0;
               
               if (unmuteTimerRef.current) {
                 clearTimeout(unmuteTimerRef.current);
                 unmuteTimerRef.current = null;
               }

               setStatusMessage(language === 'ja' ? '面接官が話しています...' : 'Recruiter is speaking...');
               setIsAiSpeaking(true);

               try {
                 const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                 const currentTime = outputCtx.currentTime;
                 if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime + 0.05;

                 const source = outputCtx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputCtx.destination);
                 
                 source.addEventListener('ended', () => { 
                    if (sourcesRef.current) sourcesRef.current.delete(source);
                    if(sourcesRef.current && sourcesRef.current.size === 0) {
                      // Add a small delay before unmuting to ensure AI is fully done
                      unmuteTimerRef.current = setTimeout(() => {
                          setIsAiSpeaking(false);
                          if (micGainNodeRef.current) micGainNodeRef.current.gain.value = 1.0;
                          setStatusMessage(language === 'ja' ? 'あなたの番です。ゆっくりお話しください。' : 'Your turn. Please answer.');
                      }, 800); 
                    }
                 });
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 if (sourcesRef.current) sourcesRef.current.add(source);
               } catch (err) { console.error("Audio error", err); }
             }
          },
          onclose: () => {
             console.log("Session closed");
             cleanupSession();
          },
          onerror: (err: any) => {
            console.error('Session error', err);
            setIsError(true);
            setErrorMessage(language === 'ja' ? '接続が切れました。もう一度お試しください。' : 'Connection lost.');
            cleanupSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      };

      sessionPromiseRef.current = ai.live.connect(config);

    } catch (e: any) {
      console.error(e);
      setIsError(true);
      setErrorMessage(e.message || 'Error initializing microphone.');
    }
  };

  // --- RENDER (Steps) ---
  if (step === 'intro') {
    return (
      <div className="w-full">
        <PageHeader 
          title={isPracticeMode ? 'AI模擬面接 (デモ)' : 'AI一次面接 (本番)'}
          subtitle={isPracticeMode ? '配慮事項の伝え方を練習しましょう' : 'この面接結果は企業に送信されます'}
          breadcrumbs={[{ label: isPracticeMode ? '面接練習' : '一次面接' }]}
          setView={setView}
          backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
        />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
            <div className={`p-8 text-white ${isPracticeMode ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              <h2 className="text-2xl font-bold mb-2">
                {isPracticeMode ? 'トコトコ AI面接練習' : '一次面接を開始します'}
              </h2>
              <p className="opacity-90">
                {isPracticeMode 
                  ? '面接でよく聞かれる「障がいの状況」や「必要な配慮」についての説明を練習できます。' 
                  : `応募先: ${job?.company}。リラックスして、あなたの言葉でお話しください。`}
              </p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    <Settings size={32} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">1. 環境設定</h3>
                  <p className="text-sm text-stone-500">マイクと音声の確認を行います。落ち着ける静かな場所で行ってください。</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">2. AIと対話</h3>
                  <p className="text-sm text-stone-500">
                    AI面接官が質問します。「はい/いいえ」で答えられるような選択肢も提示されるので安心してください。
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    <FileCheck size={32} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">3. フィードバック</h3>
                  <p className="text-sm text-stone-500">
                    回答内容をAIが分析し、「より伝わりやすい表現」などをアドバイスします。
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => setStep('ready')}
                  className={`px-12 py-4 rounded-full font-bold text-lg text-white shadow-lg hover:scale-105 transition-transform flex items-center gap-2 ${isPracticeMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}
                >
                  {isPracticeMode ? '練習を開始する' : '準備画面へ進む'} <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reuse existing Review/Complete and Ready/Interview screens with updated colors/text implicitly via props or logic
  if (step === 'review' || step === 'generating' || step === 'complete') {
     return (
        <div className="w-full">
           <PageHeader 
             title={step === 'complete' ? '完了' : '面接終了'} 
             subtitle="お疲れ様でした"
             breadcrumbs={[{ label: 'AI面接', view: ViewState.INTERVIEW_PRACTICE }, { label: 'レポート' }]}
             setView={setView}
             backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
           />
           <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center text-center">
              {step === 'generating' || step === 'complete' ? (
                 <>
                   {step === 'generating' ? <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mb-6" /> : <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />}
                   <h2 className="text-2xl font-bold mb-2">{step === 'generating' ? 'レポート生成中...' : '完了しました！'}</h2>
                   <p className="text-stone-500">{step === 'generating' ? 'AIがあなたの回答を分析しています' : 'フィードバックを確認して、今後の活動に活かしましょう。'}</p>
                   {step === 'complete' && (
                      <button onClick={() => setView && setView(ViewState.DASHBOARD)} className="mt-8 bg-stone-900 text-white px-8 py-3 rounded-xl font-bold">マイページへ戻る</button>
                   )}
                 </>
              ) : (
                 <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200 w-full text-left">
                    <h2 className="text-2xl font-bold mb-6 text-stone-800 border-b border-stone-100 pb-4">
                      {isPracticeMode ? '練習結果の確認' : '提出前の最終確認'}
                    </h2>
                    
                    <div className="bg-stone-50 p-6 rounded-2xl mb-8 max-h-96 overflow-y-auto custom-scrollbar border border-stone-100">
                       {transcripts.length === 0 ? (
                         <p className="text-stone-400 text-center">会話履歴がありません。</p>
                       ) : (
                         transcripts.map((t, i) => (
                            <div key={i} className={`mb-4 ${t.speaker === 'ai' ? 'pl-0 pr-12' : 'pl-12 pr-0'}`}>
                               <div className={`text-xs font-bold mb-1 ${t.speaker === 'ai' ? 'text-stone-500' : 'text-emerald-600 text-right'}`}>
                                 {t.speaker === 'ai' ? '面接官' : 'あなた'}
                               </div>
                               <div className={`p-3 rounded-2xl text-sm leading-relaxed ${t.speaker === 'ai' ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-none' : 'bg-emerald-50 text-emerald-900 rounded-tr-none'}`}>
                                 {t.text}
                               </div>
                            </div>
                         ))
                       )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                       <button 
                         onClick={handleRetry} 
                         className="px-8 py-4 border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                       >
                         <RefreshCw size={18} /> やり直す
                       </button>
                       <button 
                         onClick={handleSubmit} 
                         className={`px-8 py-4 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none ${isPracticeMode ? 'bg-emerald-600' : 'bg-emerald-600'}`}
                       >
                         {isPracticeMode ? '分析レポートを見る' : 'この内容で企業に提出する'} <Send size={18} />
                       </button>
                    </div>
                 </div>
              )}
           </div>
        </div>
     );
  }

  // Ready/Interview view remains largely same but updated texts handled by state
  return (
    <div className="w-full">
      <PageHeader 
        title={isPracticeMode ? 'AI模擬面接' : 'AI一次面接'}
        subtitle={step === 'ready' ? 'マイクとカメラの準備をしてください' : '自分のペースで、焦らずお話しください'}
        breadcrumbs={[{ label: isPracticeMode ? '面接練習' : '一次面接' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
              <div className={`bg-white rounded-3xl shadow-2xl border overflow-hidden relative flex flex-col items-center p-8 transition-all w-full mx-auto ${isPracticeMode ? 'border-emerald-100' : 'border-rose-100'}`}>
                {/* ... (Existing Avatar/Visualizer code) ... */}
                {!isConnected && (
                   <div className="absolute top-6 left-6 z-20 flex bg-stone-100 rounded-full p-1 border border-stone-200">
                      <button onClick={() => setLanguage('ja')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'ja' ? 'bg-white shadow text-stone-900' : 'text-stone-400'}`}>日本語</button>
                      <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${language === 'en' ? 'bg-white shadow text-blue-600' : 'text-stone-400'}`}><Globe size={10}/> English</button>
                   </div>
                )}
                <div className={`absolute top-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all z-20 ${isConnected ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-stone-400'}`}></div>
                  {isConnected ? 'ON AIR' : 'READY'}
                </div>
                <div className="relative mb-8 w-full aspect-video rounded-2xl overflow-hidden shadow-lg border-4 ring-1 border-white ring-stone-100 bg-stone-200">
                  <img src={INTERVIEWER_IMAGE_URL} className="w-full h-full object-cover" />
                  {isAiSpeaking && (
                      <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-stone-900/60 to-transparent">
                          <div className="flex gap-1 items-end h-8">
                            {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 bg-white/90 h-4 animate-bounce" style={{animationDelay: `${i*0.1}s`}}></div>)}
                          </div>
                      </div>
                  )}
                  {isPreparing && (
                     <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="text-center text-white">
                           <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                           <h3 className="text-xl font-bold mb-1">Connecting...</h3>
                           <div className="text-4xl font-black font-mono tracking-widest">{connectionTimer}s</div>
                        </div>
                     </div>
                  )}
                  {countdown !== null && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="text-8xl font-black text-white animate-bounce">{countdown}</div>
                    </div>
                  )}
                </div>

                <p className="text-center font-bold mb-4 text-stone-600 min-h-[1.5em]">{statusMessage}</p>
                {/* 10秒無言ガイダンス */}
                {isConnected && !isAiSpeaking && transcripts.length === 0 && !isPreparing && (
                    <p className="text-center text-xs text-emerald-600 mb-2 animate-pulse font-bold bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
                        まもなくAI面接官が話しかけます...
                    </p>
                )}
                {errorMessage && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold w-full text-center">{errorMessage}</div>}

                <div className="flex gap-4">
                  {!isConnected ? (
                    <button 
                      onClick={handleStartClick}
                      disabled={countdown !== null}
                      className={`flex items-center gap-2 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:scale-105 ${isPracticeMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-stone-900 hover:bg-stone-800'} ${countdown !== null ? 'opacity-50' : ''}`}
                    >
                      {countdown !== null ? <Loader2 className="animate-spin" /> : <Mic size={24} />}
                      {countdown !== null ? 'Ready...' : '面接を開始する'}
                    </button>
                  ) : (
                    <button onClick={handleFinishRecording} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105">
                      <StopCircle size={24} /> 終了する
                    </button>
                  )}
                </div>
              </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-white rounded-3xl border border-stone-200 p-6 h-full flex flex-col shadow-sm">
                <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-lg border-b border-stone-100 pb-3">
                  <HelpCircle size={20} className="text-emerald-500" /> 安心ガイド
                </h3>
                <div className="space-y-6 text-sm text-stone-600">
                   <div>
                      <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-2"><Volume2 size={16} className="text-stone-400"/> ゆっくりで大丈夫です</h4>
                      <p className="leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                         言葉に詰まっても焦る必要はありません。AIはあなたのペースに合わせて話を聞きます。
                      </p>
                   </div>
                   <div>
                      <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-2"><Mic size={16} className="text-stone-400"/> 配慮事項について</h4>
                      <p className="leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                         通院の頻度や、苦手な業務、必要な環境調整などがあれば、遠慮なく伝えてください。
                      </p>
                   </div>
                </div>
                <div className="mt-auto pt-6 text-center">
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