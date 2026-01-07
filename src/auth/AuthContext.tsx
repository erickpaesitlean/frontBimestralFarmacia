import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getAuthFromMemory, clearAuthFromMemory, saveAuthToMemory } from '@/api/axios'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  username: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se há auth salva na memória
    const authData = getAuthFromMemory()
    if (authData) {
      setIsAuthenticated(true)
      setUsername(authData.username)
    }
  }, [])

  const login = async (username: string, password: string) => {
    // Salvar em memória (sessionStorage)
    saveAuthToMemory(username, password)
    setIsAuthenticated(true)
    setUsername(username)
  }

  const logout = () => {
    clearAuthFromMemory()
    setIsAuthenticated(false)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, username }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

