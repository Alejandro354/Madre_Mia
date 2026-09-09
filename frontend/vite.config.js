import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Un solo backend (el gateway) sirve los tres sistemas en el puerto 5000 bajo
// prefijos distintos. Aquí solo se enrutan las llamadas de API: se prefijan con
// /practicaya/api y /practicantes/api en vez de /practicaya y /practicantes a
// secas, porque "/practicantes" también es una ruta de página de esta app y el
// proxy la mandaría al backend en vez de servir el index.html.
const gateway = 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Sin esto, si el 5173 está ocupado Vite se cambia de puerto sin avisar y
    // terminás mirando una app vieja creyendo que es la nueva. Mejor que falle.
    strictPort: true,
    open: true,
    proxy: {
      '/api': gateway,
      '/uploads': gateway,
      '/practicaya/api': gateway,
      '/practicaya/uploads': gateway,
      '/practicaya/socket.io': { target: gateway, ws: true },
      '/practicantes/api': gateway,
    },
    watch: {
      // OneDrive bloquea brevemente los archivos recién sincronizados, lo que
      // hace fallar al watcher nativo con EBUSY. Con polling no dependemos de él.
      usePolling: true,
      interval: 300,
    },
  },
})
