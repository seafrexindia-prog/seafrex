import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: The base path must match your GitHub repository name.
  // If your repo is https://github.com/seafrex-prog/seafrex, the base is '/seafrex/'
  base: '/seafrex/', 
  build: {
    outDir: 'dist',
  }
});