
// Feature Flags & System Configuration
// These can be controlled via Environment Variables in the build process
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'https://tocotoco-backend.gcimaster-glitch.workers.dev';

export const CONFIG = {
  // Master Switches
  ENABLE_BILLING: true, // Set to false to disable all payment features
  ENABLE_KYC: true,     // Set to false to disable Identity Verification
  
  // API Endpoints (Cloudflare Workers Backend)
  API_BASE_URL: (process.env.VITE_API_BASE_URL as string) || 'https://tocotoco-backend.gcimaster-glitch.workers.dev',
  
  // Integration Keys (Public keys only)
  STRIPE_PUBLIC_KEY: 'pk_test_placeholder',
  
  // Feature Specifics
  MAX_FREE_SCOUTS: 5,
  MAX_FREE_REPORTS: 0,
};

export const PLANS = {
  EMPLOYER_PRO: {
    id: 'price_employer_pro_monthly',
    name: 'Pro Plan',
    price: 30000,
    features: ['AI面接レポート見放題', 'スカウト通数無制限', '市場分析データ閲覧']
  },
  AGENT_BASIC: {
    id: 'price_agent_basic_monthly',
    name: 'Agent Basic',
    price: 10000,
    features: ['求職者データベース検索', 'スカウト送信権限']
  }
};
