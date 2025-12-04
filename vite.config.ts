  import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< Updated upstream
  // IMPORTANT: This must match your GitHub Repository name exactly
  // Repository: https://github.com/seafrex-prog/seafrex
  base: '/seafrex/', 
=======
  // Use './' for relative paths. This fixes 404 errors on GitHub Pages 
  // regardless of what your repository name is.
  base: './', 
>>>>>>> Stashed changes
  build: {
    outDir: 'dist',
  }
});