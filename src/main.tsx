import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initBlocking } from './services/blocking'

initBlocking()

createRoot(document.getElementById('root')!).render(<App />)
