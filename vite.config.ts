import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // In Vercel, environment variables are available as process.env during build
    // Fallback to empty string if not set (will be caught by runtime check)
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'ui-vendor': ['recharts', 'react-markdown'],
              'ai-vendor': ['@google/genai'],
            }
          }
        }
      }
    };
});
