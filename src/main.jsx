import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/tokens.css'
import App from './App.jsx'

// Periodic update check: poll for a new build every 30 min while the app is open.
// With registerType:'autoUpdate' a new deploy then activates + reloads itself, instead
// of the installed PWA serving a stale bundle indefinitely (iOS service-worker stickiness).
registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      setInterval(() => { registration.update() }, 30 * 60 * 1000)
    }
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
