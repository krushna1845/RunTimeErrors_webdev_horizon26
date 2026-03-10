import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PlanProvider } from './context/PlanContext'
import { UIProvider } from './context/UIContext'
import { BusinessProvider } from './context/BusinessContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <UIProvider>
            <BusinessProvider>
              <App />
            </BusinessProvider>
          </UIProvider>
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
