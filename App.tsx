import React, { useState, useLayoutEffect } from 'react';
import { ViewState, Job, PipelineItem } from './types';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Dashboard } from './components/Dashboard';
import { MyPage } from './pages/MyPage';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AgentDashboard } from './components/AgentDashboard';
import { AdminDashboard } from './components/AdminDashboard'; 
import { AIResumeBuilder } from './components/AIResumeBuilder';
import { InterviewPractice } from './components/InterviewPractice';
import { JobSearch } from './pages/JobSearch';
import { AIDiagnostics } from './components/AIDiagnostics';
import { AboutPro } from './pages/AboutPro';
import { AIConcierge } from './components/AIConcierge';
import { EmployerScout } from './components/EmployerScout';
import { EmployerJobCreate } from './components/EmployerJobCreate'; 
import { EmployerAgentSearch } from './components/EmployerAgentSearch';
import { AgentProfileEdit } from './components/AgentProfileEdit';
import { OnlineSalon } from './components/OnlineSalon';
import { LearningStudio } from './components/LearningStudio';
import { Register } from './components/Auth/Register';
import { Login } from './components/Auth/Login';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- MOCK DATA FOR JOB SEEKER ---
const INITIAL_APPLICATIONS = [
  { id: 1, company: '株式会社未来サポート', title: '一般事務（障がい者枠）', status: '最終面接', progress: 80, nextAction: '日程調整中', date: '2024.05.20', messages: 4 },
  { id: 2, company: 'テクノロジーパートナーズ', title: 'データ入力（在宅）', status: '書類選考', progress: 30, nextAction: '結果待ち', date: '2024.05.18', messages: 0 },
  { id: 3, company: 'グリーンファーム', title: '農園スタッフ', status: '一次面接', progress: 50, nextAction: '面接済・合否待ち', date: '2024.05.15', messages: 1 },
  { id: 4, company: 'ソーシャル・インクルージョン', title: '軽作業スタッフ', status: 'スカウト', progress: 10, nextAction: 'カジュアル面談応募', date: '2024.05.22', messages: 2 },
];

// --- MOCK DATA FOR EMPLOYER ---
const INITIAL_PIPELINE: PipelineItem[] = [
  { 
    id: '1', 
    candidateName: '佐藤 健太', 
    candidateId: 'U001', 
    targetCompany: '未来サポート', 
    jobTitle: '一般事務', 
    status: 'matching', 
    lastUpdated: '2時間前', 
    agentMemo: '精神障害者保健福祉手帳2級。事務経験あり。静かな環境を希望。',
    hasAiInterview: true,
    aiInterviewScore: 92,
    aiInterviewReport: `# AI面接評価レポート: 佐藤 健太\n\n**総合評価:** S (92/100)\n\n## サマリー\n佐藤氏は事務職として5年の経験があり、PCスキル（Excelマクロ等）が非常に高いです。障がい特性として「突発的な電話対応」への不安を挙げていますが、業務フローの調整で十分に活躍可能です。誠実な人柄で定着率も高いと予測されます。\n\n## 詳細評価\n- **スキル・経験 (95/100):** 即戦力レベルの事務処理能力があります。\n- **自己理解 (90/100):** 自身の特性と必要な配慮を言語化できており、安定就労が期待できます。\n- **意欲 (90/100):** 貴社の「多様性」を重視する理念に強く共感しています。\n\n## 推奨アクション\n**面接設定**を推奨します。配慮事項についての具体的なすり合わせを行ってください。`
  },
  { 
    id: '2', 
    candidateName: '鈴木 美咲', 
    candidateId: 'U005', 
    targetCompany: 'テクノロジーパートナーズ', 
    jobTitle: 'データ入力', 
    status: 'scout_sent', 
    lastUpdated: '1日前', 
    agentMemo: 'スカウト送信済み。返信待ち。在宅希望。',
    hasAiInterview: false
  },
  { 
    id: '3', 
    candidateName: '田中 浩二', 
    candidateId: 'U012', 
    targetCompany: 'グリーンファーム', 
    jobTitle: '農園スタッフ', 
    status: 'interview', 
    lastUpdated: '3時間前', 
    agentMemo: '一次面接通過。次回実習予定。',
    hasAiInterview: true,
    aiInterviewScore: 78,
    aiInterviewReport: `# AI面接評価レポート: 田中 浩二\n\n**総合評価:** B+ (78/100)\n\n## サマリー\n体力に自信があり、屋外作業への適性が高いです。知的障がいがありますが、単純作業の繰り返しは得意としています。コミュニケーションはゆっくりですが、指示に対する理解度は良好です。\n\n## 詳細評価\n- **適性 (90/100):** 農園作業への意欲が高く、継続力があります。\n- **コミュニケーション (70/100):** 抽象的な指示よりも、具体的なマニュアル提示が有効です。\n\n## 懸念点\n通勤ルートの確認など、サポート機関との連携が必要です。`
  },
];

const MOCK_EMPLOYER_JOBS: Job[] = [
  { id: 'j1', title: '一般事務（オープンポジション）', catchphrase: '安定企業で長く働く', company: '自社', location: '東京', salary: '月給20万', type: 'Full-time', tags: [], celebrationMoney: 0, imageUrl: '', analysisScore: 85 },
  { id: 'j2', title: '軽作業スタッフ', catchphrase: '未経験歓迎', company: '自社', location: '埼玉', salary: '時給1100円', type: 'Part-time', tags: [], celebrationMoney: 0, imageUrl: '', analysisScore: 92 },
];

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setView] = useState<ViewState>(ViewState.HOME);
  const [userRole, setUserRole] = useState<'job_seeker' | 'employer' | 'admin' | 'agent'>('job_seeker');
  const [selectedJobForInterview, setSelectedJobForInterview] = useState<Job | null>(null);
  
  // Data States
  const [pipeline, setPipeline] = useState<PipelineItem[]>(INITIAL_PIPELINE); // For Employer
  const [employerJobs, setEmployerJobs] = useState<Job[]>(MOCK_EMPLOYER_JOBS); // For Employer
  const [userApplications, setUserApplications] = useState(INITIAL_APPLICATIONS); // For Job Seeker

  // State for diagnostics navigation and results
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<'personality' | 'aptitude'>('personality');
  const [diagnosticResults, setDiagnosticResults] = useState<{personality?: any, aptitude?: any}>({});

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);

  // --- Scroll to top on view change ---
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleInterviewComplete = (report: string) => {
    const scoreMatch = report.match(/評価スコア.*?[：:]\s*(\d{1,3})/);
    const extractedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 80;

    const newApplicant: PipelineItem = {
      id: `new_${Date.now()}`,
      candidateName: '山田 太郎 (あなた)', 
      candidateId: `U${Math.floor(Math.random() * 1000)}`,
      targetCompany: selectedJobForInterview?.company || '不明な企業',
      jobTitle: selectedJobForInterview?.title || '応募職種',
      status: 'matching',
      lastUpdated: 'たった今',
      agentMemo: 'AI一次面接完了。レポートを確認してください。',
      hasAiInterview: true,
      aiInterviewReport: report,
      aiInterviewScore: extractedScore
    };
    setPipeline(prev => [newApplicant, ...prev]);

    const newApplication = {
      id: Date.now(),
      company: selectedJobForInterview?.company || '不明な企業',
      title: selectedJobForInterview?.title || '応募職種',
      status: '書類選考',
      progress: 20,
      nextAction: 'AI選考結果待ち',
      date: new Date().toLocaleDateString('ja-JP'),
      messages: 0
    };
    setUserApplications(prev => [newApplication, ...prev]);

    alert('AI面接が完了しました！\nマイページで応募履歴とレポートを確認できます。');
    
    setSelectedJobForInterview(null);
    
    if (userRole !== 'job_seeker') {
       setUserRole('job_seeker'); 
    }
    setView(ViewState.DASHBOARD);
  };

  const handleStartDiagnostic = (type: 'personality' | 'aptitude') => {
    setSelectedDiagnostic(type);
    setView(ViewState.AI_DIAGNOSTICS);
  };

  const handleDiagnosticComplete = (type: 'personality' | 'aptitude', result: any) => {
    setDiagnosticResults(prev => ({ ...prev, [type]: result }));
    setView(ViewState.DASHBOARD);
  };

  const handleAuthComplete = () => {
    setShowOnboarding(true);
    // ロールに応じてリダイレクト先を変更
    if (user?.role === 'employer') {
      setView(ViewState.EMPLOYER_DASHBOARD);
    } else {
      setView(ViewState.MY_PAGE);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <Home setView={setView} />;
      case ViewState.ABOUT_PRO:
        return <AboutPro setView={setView} />;
      case ViewState.JOB_SEARCH:
        return <JobSearch setView={setView} onJobSelect={(job) => setSelectedJobForInterview(job)} />;
      case ViewState.DASHBOARD:
        return (
          <Dashboard 
            userRole={userRole as any} 
            setView={setView} 
            pipelineData={pipeline} 
            jobs={employerJobs}
            onPipelineUpdate={setPipeline} 
            seekerApplications={userApplications} 
            onStartDiagnostic={handleStartDiagnostic}
            diagnosticResults={diagnosticResults} 
          />
        );
      case ViewState.MY_PAGE:
        return <MyPage setView={setView} />;
      case ViewState.EMPLOYER_DASHBOARD:
        return <EmployerDashboard setView={setView} />;
      case ViewState.AGENT_DASHBOARD:
        return <AgentDashboard setView={setView} />;
      case ViewState.AGENT_PROFILE_EDIT:
        return <AgentProfileEdit setView={setView} />;
      case ViewState.ADMIN_DASHBOARD:
        return <AdminDashboard setView={setView} />;
      case ViewState.AI_RESUME:
        return <AIResumeBuilder setView={setView} />;
      case ViewState.INTERVIEW_PRACTICE:
        return (
          <InterviewPractice 
            job={selectedJobForInterview} 
            onComplete={handleInterviewComplete}
            setView={setView}
          />
        );
      case ViewState.AI_DIAGNOSTICS:
        return (
          <AIDiagnostics 
            initialType={selectedDiagnostic} 
            existingResult={diagnosticResults[selectedDiagnostic]}
            onBack={() => setView(ViewState.DASHBOARD)}
            onComplete={handleDiagnosticComplete}
            setView={setView}
          />
        );
      case ViewState.EMPLOYER_SCOUT:
        return <EmployerScout setView={setView} />;
      case ViewState.EMPLOYER_JOB_CREATE:
        return <EmployerJobCreate setView={setView} onJobCreate={(job) => setEmployerJobs(prev => [...prev, job])} />;
      case ViewState.EMPLOYER_FIND_AGENT:
        return <EmployerAgentSearch setView={setView} />;
      case ViewState.ONLINE_SALON:
        return <OnlineSalon setView={setView} />;
      case ViewState.LEARNING:
        return <LearningStudio setView={setView} />;
      case ViewState.REGISTER:
        return <Register setView={setView} onRegister={handleAuthComplete} />;
      case ViewState.LOGIN:
        return <Login setView={setView} onLogin={handleAuthComplete} />;
      case ViewState.TERMS:
        return <TermsOfService setView={setView} />;
      case ViewState.PRIVACY:
        return <PrivacyPolicy setView={setView} />;
      default:
        return <Home setView={setView} />;
    }
  };

  const showNav = currentView !== ViewState.REGISTER && currentView !== ViewState.LOGIN;

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {showNav && (
        <Navigation 
          currentView={currentView} 
          setView={setView} 
          userRole={userRole}
          setUserRole={setUserRole}
        />
      )}
      
      {showOnboarding && (
        <OnboardingWizard 
          onClose={() => setShowOnboarding(false)} 
          userRole={userRole} 
        />
      )}
      
      <main className={`${showNav ? 'pt-16' : ''} max-w-[1920px] mx-auto`}>
        {renderView()}
      </main>
      
      {showNav && (
        <>
          <AIConcierge 
            currentView={currentView}
            onNavigate={setView}
            contextData={{
              pipeline, 
              userApplications, 
              userRole
            }}
          />
          
          <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="mb-4 text-2xl font-black text-white">トコトコ <span className="text-emerald-500 font-light text-lg">Tocotoco</span></div>
              <p className="text-sm mb-6">Disability Employment Platform - 自分の足で、自分のペースで歩く。</p>
              <div className="flex justify-center gap-6 text-xs font-bold mb-8">
                <button onClick={() => setView(ViewState.TERMS)} className="hover:text-white transition-colors">利用規約</button>
                <button onClick={() => setView(ViewState.PRIVACY)} className="hover:text-white transition-colors">プライバシーポリシー</button>
                <a href="#" className="hover:text-white transition-colors">運営会社</a>
              </div>
              <p className="text-xs opacity-50">&copy; 2024 General Incorporated Association National Employment Co-creation Center.</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;