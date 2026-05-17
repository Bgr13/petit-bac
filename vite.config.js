import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise warning threshold — monolithic App.jsx is expected until code-splitting is done
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split Firebase into its own chunk to separate vendor code from app
        manualChunks(id) {
          if (id.includes('firebase')) return 'firebase';
        },
      },
    },
  },
})
