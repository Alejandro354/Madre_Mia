import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    watch: {
      // OneDrive locks newly-synced files briefly, which crashes the
      // native fs watcher with EBUSY. Polling avoids relying on that.
      usePolling: true,
      interval: 300
    }
  }
})
