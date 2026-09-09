/** @type {import('tailwindcss').Config} */
export default {
  // Solo el mundo de practicantes usa Tailwind; los otros dos traen su propio
  // CSS escrito a mano y no deben generar utilidades. App.jsx también entra
  // porque ahí vive el contenedor .w-prac del que cuelgan los estilos base de
  // este sistema: si Tailwind no lo ve, descarta esas reglas.
  content: ['./index.html', './src/App.jsx', './src/practicantes/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    // El reset global vive en src/styles/base.css, compartido por los tres
    // mundos. Preflight lo pisaría con reglas pensadas solo para Tailwind.
    preflight: false,
    // .container ya existe en innovacion-social con otro significado.
    container: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#FF1837',
        'primary-light': '#FDECEF',
        sidebar: '#333333',
        background: '#FFFFFF',
        surface: '#F4F5FA',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        border: '#E9EBF4',
        disabled: '#F0F2F7',
        'disabled-text': '#9A9FB5',
      },
      fontFamily: {
        display: ["'Space Grotesk'", 'sans-serif'],
        sans: ["'IBM Plex Sans'", 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
