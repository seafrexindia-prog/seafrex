import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use './' for relative paths. This fixes 404 errors on GitHub Pages 
  // regardless of what your repository name is.
  base: './', 
  build: {
    outDir: 'dist',
  }
});