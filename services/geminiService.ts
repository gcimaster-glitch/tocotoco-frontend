// geminiService.ts
// AIの呼び出しはすべてバックエンド（Cloudflare Workers）経由で行う
// APIキーはフロントエンドには一切保持しない

const API_BASE_URL = (process.env.VITE_API_BASE_URL as string) || 'https://tocotoco-backend.gcimaster-glitch.workers.dev';

// Interface for structured resume data
export interface ResumeData {
  name: string;
  kana: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  education: { year: string; month: string; content: string }[];
  workHistory: { year: string; month: string; content: string }[];
  licenses: { year: string; month: string; content: string }[];
  motivation: string;
  requests: string;
}

// 共通のAPIコール関数
const callBackendApi = async (endpoint: string, body: object): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const generateResumeSelfPR = async (
  inputData: Partial<ResumeData> & { skills?: string[], role?: string, strengths?: string[] }
): Promise<Partial<ResumeData>> => {
  try {
    return await callBackendApi('resume-selfpr', { inputData });
  } catch (error) {
    console.error("Resume SelfPR Error:", error);
    return { motivation: "生成に失敗しました。", requests: "生成に失敗しました。" };
  }
};

export const analyzeResumeImageJSON = async (base64Image: string): Promise<Partial<ResumeData>> => {
  try {
    return await callBackendApi('resume-image', { base64Image });
  } catch (error) {
    console.error("Resume Image Analysis Error:", error);
    return {};
  }
};

// --- AI DIAGNOSTICS ---
export const generateDiagnosticReport = async (
  type: 'personality' | 'aptitude',
  answers: { question: string, answer: string | number }[]
): Promise<any> => {
  try {
    return await callBackendApi('diagnostics', { type, answers });
  } catch (error) {
    console.error("Gemini Diagnostic Error:", error);
    return null;
  }
};

// --- AI SCOUT GENERATION ---
export const generateScoutMessage = async (
  candidateName: string,
  candidateTraits: string[],
  companyName: string,
  jobTitle: string
): Promise<string> => {
  try {
    const result = await callBackendApi('scout', { candidateName, candidateTraits, companyName, jobTitle });
    return result.message || "スカウト文面の生成に失敗しました。";
  } catch (error) {
    console.error("Scout Generation Error:", error);
    return "エラーが発生しました。";
  }
};
