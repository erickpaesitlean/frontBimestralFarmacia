import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/auth/AuthContext'
import { ToastProvider } from '@/components/toast/ToastProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppRoutes } from '@/routes/AppRoutes'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
