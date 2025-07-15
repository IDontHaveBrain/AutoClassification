import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths() // TypeScript 경로 매핑 활성화
  ],
  
  // 개발 서버 설정
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // 빌드 설정
  build: {
    outDir: 'build', // CRA와 동일한 출력 디렉터리 유지
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  },
  
  // 경로 해석 설정
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src')
    }
  },
  
  // 환경 변수 설정
  envPrefix: 'VITE_',
  
  // 최적화 설정
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@reduxjs/toolkit',
      'react-redux'
    ]
  },
  
  // 호환성을 위한 전역 변수 정의
  define: {
    global: 'globalThis'
  }
})