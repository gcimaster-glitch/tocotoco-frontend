
import { CONFIG } from '../config';

// This service interacts with Cloudflare Worker -> Stripe Identity API

export const startVerificationSession = async (userId: string) => {
  if (!CONFIG.ENABLE_KYC) {
    console.warn("KYC is disabled in config.");
    return;
  }

  try {
    // In production:
    // const response = await fetch(`${CONFIG.API_BASE_URL}/api/kyc/start`, { ... });
    // const { clientSecret } = await response.json();
    // Use Stripe.js to mount the verification element or redirect

    // --- SIMULATION ---
    console.log(`Starting KYC session for user: ${userId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = "https://verify.stripe.com/test_simulation";
        const confirmed = window.confirm("【Stripe Identity】\n本人確認プロセスを開始しますか？\n(外部サイトへ遷移します)");
        if (confirmed) {
            // In reality, you'd redirect here
            alert("本人確認書類の提出が完了したと仮定します。");
            resolve('verified'); 
        } else {
            resolve('pending');
        }
      }, 500);
    });

  } catch (error) {
    console.error("KYC Error:", error);
    throw error;
  }
};
