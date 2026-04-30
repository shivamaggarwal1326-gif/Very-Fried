import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' 
import App from './App.jsx'

// 1. THE PWA UPLINK
import { registerSW } from 'virtual:pwa-register';

// 2. FIRE THE REGISTRATION
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("VeryFryd OS: New content available, refreshing...");
  },
  onOfflineReady() {
    console.log("VeryFryd OS: Ready for offline kitchen combat.");
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)