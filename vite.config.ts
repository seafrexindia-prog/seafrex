import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This must match your GitHub Repository name exactly
  // Repository: https://github.com/seafrex-prog/seafrex
  base: '/seafrex/', 
  build: {
    outDir: 'dist',
  }
});