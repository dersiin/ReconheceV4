import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    // Proxy comentado para uso local
    // Para usar com Azure Functions, descomente:
    /*
    proxy: {
      '/api': {
        target: 'http://localhost:7188', // Para desenvolvimento local
        // target: 'https://your-azure-function-app.azurewebsites.net', // Para produção
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
    */
  }
})