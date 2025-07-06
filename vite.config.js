import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
    host: true, // Listen on all network interfaces
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'edinotepad.onrender.com',
      '.onrender.com' // Allow all Render subdomains
    ]
  }
})
