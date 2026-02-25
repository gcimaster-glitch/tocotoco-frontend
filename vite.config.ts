import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// APIキーはフロントエンドに直接埋め込まず、バックエンド（Cloudflare Workers）経由で利用する
// VITE_API_BASE_URL のみフロントエンドに渡す
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'https://tocotoco-backend.gcimaster-glitch.workers.dev'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
