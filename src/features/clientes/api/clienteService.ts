import { api } from '@/api/axios'

export interface ClienteRequestDTO {
  nome: string
  cpf: string
  email: string
  dataNascimento: string // YYYY-MM-DD
}

export interface ClienteResponseDTO {
  id: number
  nome: string
  cpf: string
  email: string
  dataNascimento: string
  dataCriacao: string
  dataAtualizacao: string
}

export const clienteService = {
  listar: async (): Promise<ClienteResponseDTO[]> => {
    const response = await api.get<ClienteResponseDTO[]>('/api/clientes')
    return response.data
  },

  buscarPorId: async (id: number): Promise<ClienteResponseDTO> => {
    const response = await api.get<ClienteResponseDTO>(`/api/clientes/${id}`)
    return response.data
  },

  criar: async (data: ClienteRequestDTO): Promise<ClienteResponseDTO> => {
    const response = await api.post<ClienteResponseDTO>('/api/clientes', data)
    return response.data
  },

  atualizar: async (id: number, data: ClienteRequestDTO): Promise<ClienteResponseDTO> => {
    const response = await api.put<ClienteResponseDTO>(`/api/clientes/${id}`, data)
    return response.data
  },
}

