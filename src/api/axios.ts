import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Funções auxiliares para gerenciar auth em memória (definidas ANTES dos interceptors)
const AUTH_KEY = 'farmacia_auth_memory'

interface AuthData {
  username: string
  password: string
}

export function saveAuthToMemory(username: string, password: string): void {
  const authData: AuthData = { username, password }
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(authData))
}

export function getAuthFromMemory(): AuthData | null {
  const data = sessionStorage.getItem(AUTH_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as AuthData
  } catch {
    return null
  }
}

export function clearAuthFromMemory(): void {
  sessionStorage.removeItem(AUTH_KEY)
}

// Configuração do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const authData = getAuthFromMemory()
    if (authData && config.headers) {
      const token = btoa(`${authData.username}:${authData.password}`)
      config.headers.Authorization = `Basic ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Limpar auth e redirecionar para login (apenas se não estiver na página de login)
      clearAuthFromMemory()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

