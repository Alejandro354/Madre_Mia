import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// El orden importa: primero el reset compartido, después los estilos de cada
// sistema y de último Tailwind (entra por practicantes/index.css), para que sus
// utilidades puedan pisar a las clases de componente.
import './styles/base.css'
import './inno/index.css'
import './practicaya/index.css'
import './practicantes/index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
