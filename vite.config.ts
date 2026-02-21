import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],

  server: {
    host: '0.0.0.0',          // ← better than true in WSL
    port: 5173,
    strictPort: true,         // prevents auto-port change
    hmr: {
      clientPort: 5173,       // helps with WSL → Windows browser HMR
    },

    proxy: {
      '^/api(/|$).*': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // only if needed
      },
    },
  },
})