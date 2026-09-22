import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.tsx'

gsap.registerPlugin(useGSAP)

inject()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
