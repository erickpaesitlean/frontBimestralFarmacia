import { api } from '@/api/axios'

export interface CategoriaRequestDTO {
  nome: string
  descricao?: string
}

export interface CategoriaResponseDTO {
  id: number
  nome: string
  descricao?: string
  dataCriacao: string
  dataAtualizacao: string
}

export const categoriaService = {
  listar: async (): Promise<CategoriaResponseDTO[]> => {
    const response = await api.get<CategoriaResponseDTO[]>('/api/categorias')
    return response.data
  },

  buscarPorId: async (id: number): Promise<CategoriaResponseDTO> => {
    const response = await api.get<CategoriaResponseDTO>(`/api/categorias/${id}`)
    return response.data
  },

  criar: async (data: CategoriaRequestDTO): Promise<CategoriaResponseDTO> => {
    const response = await api.post<CategoriaResponseDTO>('/api/categorias', data)
    return response.data
  },

  atualizar: async (id: number, data: CategoriaRequestDTO): Promise<CategoriaResponseDTO> => {
    const response = await api.put<CategoriaResponseDTO>(`/api/categorias/${id}`, data)
    return response.data
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/categorias/${id}`)
  },
}

