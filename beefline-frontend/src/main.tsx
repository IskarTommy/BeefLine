import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { registerServiceWorker } from './utils/serviceWorker'
import { reportWebVitals } from './utils/performance'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA functionality
registerServiceWorker();

// Report web vitals for performance monitoring
reportWebVitals();
