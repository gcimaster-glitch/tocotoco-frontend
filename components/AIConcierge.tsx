import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { MessageCircle, X, Mic, Send, Minimize2, Maximize2, Loader2, Sparkles, Volume2, HelpCircle, Navigation, ExternalLink } from 'lucide-react';
import { ViewState } from '../types';

const SUGGESTED_QUESTIONS = [
  "現在の選考状況を教えて",
  "AI履歴書の使い方",
  "最新の業界動向は？",
  "非公開求人とは？"
];

// Define Navigation Tool
const changePageTool: FunctionDeclaration = {
  name: 'changePage',
  description: 'Navigate the user to a specific page or section of the application.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      page: {
        type: Type.STRING,
        description: 'The destination page ID. Options: JOB_SEARCH, DASHBOARD, AI_RESUME, INTERVIEW_PRACTICE, AI_DIAGNOSTICS, ABOUT_PRO, ONLINE_SALON, LEARNING.',
      },
    },
    required: ['page'],
  },
};

interface AIConciergeProps {
  currentView?: ViewState;
  onNavigate?: (view: ViewState) => void;
  contextData?: any; // Data to provide context to the AI (e.g., pipeline status)
}

export const AIConcierge: React.FC<AIConciergeProps> = ({ currentView, onNavigate, contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string, sources?: any[]}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionBubble, setSuggestionBubble] = useState<string | null>(null);
  
  // Voice State
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0); // For visualizer
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // --- SMART SUGGESTIONS (BUBBLE) ---
  useEffect(() => {
    // Determine suggestion based on view
    let text = null;
    switch (currentView) {
      case ViewState.JOB_SEARCH:
        text = "希望の配慮条件で求人を探しますか？";
        break;
      case ViewState.AI_RESUME:
        text = "職務経歴書の作成でお困りですか？";
        break;
      case ViewState.DASHBOARD:
        if (contextData?.userRole === 'job_seeker') {
             text = "最新の選考状況を確認しましょうか？";
        } else if (contextData?.userRole === 'employer') {
             text = "今日の面接予定を確認しますか？";
        }
        break;
      case ViewState.INTERVIEW_PRACTICE:
        text = "面接練習のアドバイスが必要ですか？";
        break;
      default:
        text = null;
    }
    
    if (text && !isOpen) {
      setSuggestionBubble(text);
      // Auto hide after 8 seconds
      const timer = setTimeout(() => setSuggestionBubble(null), 8000);
      return () => clearTimeout(timer);
    } else {
      setSuggestionBubble(null);
    }
  }, [currentView, isOpen, contextData?.userRole]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Clean up voice on close or unmount
  useEffect(() => {
    return () => {
        cleanupVoiceSession();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const cleanupVoiceSession = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    }
    setIsVoiceConnected(false);
    setIsAiSpeaking(false);
    sessionPromiseRef.current = null;
    setVoiceVolume(0);
  };

  // --- NAVIGATION ACTION ---
  const performNavigation = (page: string) => {
    if (onNavigate && Object.values(ViewState).includes(page as ViewState)) {
      onNavigate(page as ViewState);
      return `Successfully navigated to ${page}.`;
    }
    return `Failed to navigate. Unknown page: ${page}`;
  };

  // --- CONTEXT GENERATION ---
  const getSystemContext = () => {
    let contextStr = `現在ユーザーは「${currentView || '不明'}」ページを見ています。\n`;
    
    if (contextData) {
       // Employer Context
       if (contextData.pipeline && Array.isArray(contextData.pipeline)) {
         const activeJobs = contextData.pipeline.map((p: any) => 
           `- ${p.candidateName} (${p.jobTitle}): ステータス[${p.status}]`
         ).join('\n');
         contextStr += `\n【採用担当者用データ: 候補者パイプライン】:\n${activeJobs || 'なし'}\n`;
       }
       
       // Job Seeker Context
       if (contextData.userApplications && Array.isArray(contextData.userApplications)) {
         const apps = contextData.userApplications.map((app: any) => 
            `- ${app.company} (${app.title}): 進捗[${app.status}] 次のアクション[${app.nextAction}]`
         ).join('\n');
         contextStr += `\n【求職者用データ: 自身の選考状況】:\n${apps || '現在進行中の選考はありません。'}\n`;
       }

       if (contextData.userRole) {
         contextStr += `\n【ユーザー属性】: ${contextData.userRole}\n`;
       }
    }
    return contextStr;
  };

  // --- CHAT LOGIC ---
  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setInputText('');
    setIsLoading(true);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key missing");
        
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `
          あなたは「トコトコ (Tocotoco)」のAIコンシェルジュです。
          ${getSystemContext()}
          
          サイトの機能:
          1. **AI履歴書 (AI_RESUME)**: 職務経歴書を自動作成。障がい特性の言語化サポート。
          2. **AI一次面接 (INTERVIEW_PRACTICE)**: 24時間いつでも受験可能。
          3. **求人検索 (JOB_SEARCH)**: 「本音フィルター」で配慮事項から求人を検索。
          4. **AI診断 (AI_DIAGNOSTICS)**: 性格・適性診断。
          5. **マイページ (DASHBOARD)**: 選考状況の確認。

          ユーザーが「～したい」「～へ行きたい」と言った場合は、\`changePage\`ツールを使用してページを移動させてください。
          ユーザー自身の選考状況について聞かれた場合は、提供されたコンテキスト情報を基に回答してください。
          業界動向やニュースについて聞かれた場合は、Google検索ツールを使用して最新情報を回答してください。
          回答は親しみやすく、短く簡潔に（200文字以内推奨）。
        `;

        // Note: Function calling combined with Google Search is supported in newer models.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt + "\n\nユーザーの質問: " + text }] }
            ],
            config: {
              tools: [{ functionDeclarations: [changePageTool] }, { googleSearch: {} }]
            }
        });

        // Handle Function Calls
        const functionCalls = response.functionCalls;
        let aiMsg = response.text || "";
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (functionCalls && functionCalls.length > 0) {
           for (const call of functionCalls) {
              if (call.name === 'changePage') {
                 const page = (call.args as any).page;
                 const result = performNavigation(page);
                 aiMsg = `${page}へ移動しました。\n` + aiMsg;
              }
           }
        } else if (!aiMsg) {
           aiMsg = "申し訳ありません。うまく聞き取れませんでした。";
        }

        setMessages(prev => [...prev, { role: 'model', text: aiMsg, sources: groundingMetadata }]);
    } catch (e) {
        console.error(e);
        setMessages(prev => [...prev, { role: 'model', text: "エラーが発生しました。もう一度お試しください。" }]);
    } finally {
        setIsLoading(false);
    }
  };

  // --- VOICE LOGIC (LIVE API) ---
  const handleStartVoice = async () => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return;
        
        setIsVoiceConnected(true);
        
        const ai = new GoogleGenAI({ apiKey });
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        inputAudioContextRef.current = inputCtx;
        audioContextRef.current = outputCtx;
        nextStartTimeRef.current = outputCtx.currentTime;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Visualizer Setup
        const analyser = outputCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const visualize = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setVoiceVolume(avg);
            animationFrameRef.current = requestAnimationFrame(visualize);
        };
        visualize();

        const config = {
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            callbacks: {
                onopen: () => {
                    console.log("Concierge Voice Connected");
                    // Audio Pipeline
                    const source = inputCtx.createMediaStreamSource(stream);
                    const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                         const inputData = e.inputBuffer.getChannelData(0);
                         const pcmBlob = createBlob(inputData);
                         sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputCtx.destination);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    // Handle Tool Calls
                    if (msg.toolCall) {
                        for (const fc of msg.toolCall.functionCalls) {
                            if (fc.name === 'changePage') {
                                const page = (fc.args as any).page;
                                performNavigation(page);
                                // Send response back to model
                                sessionPromiseRef.current?.then(session => {
                                    session.sendToolResponse({
                                        functionResponses: [{
                                            id: fc.id,
                                            name: fc.name,
                                            response: { result: 'Navigated successfully' }
                                        }]
                                    });
                                });
                            }
                        }
                    }

                    const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        setIsAiSpeaking(true);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        // Connect to analyser for visualization
                        source.connect(analyser); 
                        analyser.connect(outputCtx.destination);
                        
                        source.addEventListener('ended', () => setIsAiSpeaking(false));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime) + audioBuffer.duration;
                    }
                },
                onclose: () => cleanupVoiceSession(),
                onerror: (e: any) => { console.error(e); cleanupVoiceSession(); }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
                systemInstruction: `
                  あなたは「トコトコ (Tocotoco)」の音声AIコンシェルジュです。
                  ${getSystemContext()}
                  ユーザーがページ移動を希望した場合は、遠慮なく\`changePage\`ツールを使用してください。
                  回答は短く、親しみやすくしてください。
                `,
                tools: [{ functionDeclarations: [changePageTool] }]
            }
        };
        sessionPromiseRef.current = ai.live.connect(config);

    } catch (e) {
        console.error(e);
        cleanupVoiceSession();
    }
  };

  // --- AUDIO HELPERS ---
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

  // --- RENDER ---
  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      
      {/* Suggestion Bubble */}
      {!isOpen && suggestionBubble && (
        <div className="absolute bottom-20 right-0 w-64 bg-white p-4 rounded-2xl rounded-br-none shadow-xl border border-stone-100 animate-in slide-in-from-right-5 fade-in duration-500 origin-bottom-right">
           <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
                 <Sparkles size={14} className="text-emerald-400" />
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-bold">
                 {suggestionBubble}
              </p>
              <button 
                 onClick={() => setSuggestionBubble(null)} 
                 className="absolute -top-2 -right-2 bg-stone-200 rounded-full p-1 text-stone-500 hover:bg-stone-300"
              >
                 <X size={10} />
              </button>
           </div>
        </div>
      )}

      {/* Closed State (FAB) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-stone-900 text-white p-4 rounded-full shadow-2xl hover:bg-stone-800 transition-all hover:scale-110 flex items-center justify-center relative group border-2 border-stone-800"
        >
          <Sparkles size={24} className="text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
          <MessageCircle size={28} />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
             AIコンシェルジュに聞く
          </span>
        </button>
      )}

      {/* Open State (Window) */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[550px] rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200">
           
           {/* Header */}
           <div className="bg-stone-900 p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                 <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-stone-800">
                    <Sparkles size={18} fill="currentColor" className="text-white"/>
                 </div>
                 <div>
                    <h3 className="font-bold text-sm tracking-wide">トコトコ <span className="font-light text-emerald-400">Concierge</span></h3>
                    <div className="flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                       <p className="text-[10px] text-stone-300">Powered by Gemini 1.5</p>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><Minimize2 size={14}/></button>
                 <button onClick={() => setIsOpen(false)} className="hover:bg-red-500/80 p-1.5 rounded-full transition-colors"><X size={14}/></button>
              </div>
           </div>

           {/* Mode Switcher */}
           <div className="flex border-b border-stone-100 shrink-0 bg-stone-50 p-1">
             <button 
               onClick={() => { setMode('chat'); cleanupVoiceSession(); }}
               className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 rounded-lg transition-all ${mode === 'chat' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >
               <MessageCircle size={14} /> チャット
             </button>
             <button 
               onClick={() => { setMode('voice'); handleStartVoice(); }}
               className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 rounded-lg transition-all ${mode === 'voice' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >
               <Mic size={14} /> 音声通話
             </button>
           </div>

           {/* Content Area */}
           <div className="flex-1 overflow-y-auto bg-stone-50 p-4 relative custom-scrollbar">
              
              {mode === 'chat' ? (
                 <div className="space-y-4 pb-20">
                    <div className="flex justify-start">
                       <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0 mr-2 mt-2">
                          <Sparkles size={14} className="text-emerald-400" />
                       </div>
                       <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-tl-none text-xs text-stone-700 shadow-sm max-w-[85%] leading-relaxed">
                          こんにちは！トコトコへようこそ。<br/>
                          サイトの使い方や機能について、なんでも聞いてくださいね。
                       </div>
                    </div>
                    
                    {messages.map((msg, i) => (
                       <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0 mr-2 mt-2">
                                    <Sparkles size={14} className="text-emerald-400" />
                                </div>
                            )}
                            <div className={`p-3 rounded-2xl text-xs max-w-[85%] shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-stone-800 text-white rounded-tr-none' : 'bg-white border border-stone-200 text-stone-700 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                          </div>
                          
                          {/* Search Sources */}
                          {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                             <div className="mt-2 ml-10 flex flex-col gap-1 w-[80%]">
                                <span className="text-[10px] text-stone-400 font-bold">参考リンク:</span>
                                {msg.sources.slice(0, 3).map((source, idx) => (
                                   <a 
                                     key={idx} 
                                     href={source.web?.uri} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="bg-white border border-stone-200 p-2 rounded-lg text-[10px] text-emerald-600 hover:underline flex items-center gap-1 truncate shadow-sm hover:shadow-md transition-shadow"
                                   >
                                      <ExternalLink size={10} />
                                      {source.web?.title || 'Web Source'}
                                   </a>
                                ))}
                             </div>
                          )}
                       </div>
                    ))}
                    
                    {isLoading && (
                       <div className="flex justify-start">
                          <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0 mr-2 mt-2">
                             <Sparkles size={14} className="text-emerald-400" />
                          </div>
                          <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-tl-none text-stone-400 shadow-sm">
                             <Loader2 size={16} className="animate-spin" />
                          </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    {isVoiceConnected ? (
                       <>
                          <div className="relative mb-8">
                             {/* Visualizer Rings */}
                             {isAiSpeaking && (
                                <>
                                   <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping"></div>
                                   <div className="absolute inset-[-10px] rounded-full bg-blue-400/10 animate-pulse" style={{ transform: `scale(${1 + voiceVolume / 50})` }}></div>
                                </>
                             )}
                             <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${isAiSpeaking ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/50 shadow-xl scale-110' : 'bg-white border-4 border-stone-100 shadow-inner'}`}>
                                <Volume2 size={40} className={isAiSpeaking ? 'text-white' : 'text-stone-300'} />
                             </div>
                          </div>
                          <p className="font-bold text-stone-800 mb-2 text-lg">
                             {isAiSpeaking ? 'お話し中...' : '聞いています...'}
                          </p>
                          <p className="text-xs text-stone-500 bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
                             {isAiSpeaking ? 'AIが回答しています' : '話しかけてください'}
                          </p>
                       </>
                    ) : (
                       <div className="flex flex-col items-center">
                          <Loader2 size={32} className="text-stone-300 animate-spin mb-4" />
                          <p className="text-xs text-stone-400 font-bold">接続しています...</p>
                       </div>
                    )}
                 </div>
              )}
           </div>

           {/* Input Area (Only for Chat) */}
           {mode === 'chat' && (
             <div className="bg-white border-t border-stone-100 shrink-0">
               {/* Suggested Questions */}
               {messages.length < 2 && (
                  <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto custom-scrollbar">
                     {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button 
                           key={i} 
                           onClick={() => handleSendMessage(q)}
                           className="whitespace-nowrap px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-full text-[10px] font-bold text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                        >
                           {q}
                        </button>
                     ))}
                  </div>
               )}
               
               <div className="p-3 flex gap-2">
                 <input 
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder="質問を入力..."
                   className="flex-1 bg-stone-100 text-stone-900 border-transparent rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-stone-800 outline-none placeholder-stone-400 transition-all focus:bg-white"
                 />
                 <button 
                   onClick={() => handleSendMessage()}
                   disabled={!inputText.trim() || isLoading}
                   className="bg-stone-900 text-white p-3 rounded-xl hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                 >
                   <Send size={16} />
                 </button>
               </div>
             </div>
           )}
           
           {/* Voice Footer */}
           {mode === 'voice' && (
              <div className="p-4 bg-white border-t border-stone-100 shrink-0 text-center">
                  <button 
                     onClick={cleanupVoiceSession} 
                     className="w-full py-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                      <Mic size={14} className="opacity-50" /> 通話を終了する
                  </button>
              </div>
           )}

        </div>
      )}
    </div>
  );
};