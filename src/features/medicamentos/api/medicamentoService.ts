import { api } from '@/api/axios'

export interface MedicamentoRequestDTO {
  nome: string
  descricao?: string
  categoriaId: number
  preco: number
  quantidadeEstoque?: number // No PUT, isso é uma ENTRADA adicional
  dataValidade: string // YYYY-MM-DD
  ativo?: boolean
}

export interface CategoriaResponseDTO {
  id: number
  nome: string
  descricao?: string
}

export interface MedicamentoResponseDTO {
  id: number
  nome: string
  descricao?: string
  categoria: CategoriaResponseDTO
  preco: number
  quantidadeEstoque: number
  dataValidade: string
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export const medicamentoService = {
  listar: async (): Promise<MedicamentoResponseDTO[]> => {
    const response = await api.get<MedicamentoResponseDTO[]>('/api/medicamentos')
    return response.data
  },

  buscarPorId: async (id: number): Promise<MedicamentoResponseDTO> => {
    const response = await api.get<MedicamentoResponseDTO>(`/api/medicamentos/${id}`)
    return response.data
  },

  criar: async (data: MedicamentoRequestDTO): Promise<MedicamentoResponseDTO> => {
    const response = await api.post<MedicamentoResponseDTO>('/api/medicamentos', data)
    return response.data
  },

  atualizar: async (id: number, data: MedicamentoRequestDTO): Promise<MedicamentoResponseDTO> => {
    const response = await api.put<MedicamentoResponseDTO>(`/api/medicamentos/${id}`, data)
    return response.data
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/medicamentos/${id}`)
  },

  atualizarStatus: async (id: number, ativo: boolean): Promise<void> => {
    await api.patch(`/api/medicamentos/${id}/status`, null, {
      params: { ativo },
    })
  },
}

