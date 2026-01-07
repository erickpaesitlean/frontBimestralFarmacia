// Tipos comuns da API

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  errors?: Record<string, string>
  details?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

