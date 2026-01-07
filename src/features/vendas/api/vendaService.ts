import { api } from '@/api/axios'

export interface ItemVendaRequestDTO {
  medicamentoId: number
  quantidade: number
}

export interface VendaRequestDTO {
  clienteId: number
  itens: ItemVendaRequestDTO[]
}

export interface ItemVendaResumoDTO {
  medicamentoId: number
  medicamentoNome: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export interface ClienteResumoDTO {
  id: number
  nome: string
}

export interface VendaResumoResponseDTO {
  id: number
  dataVenda: string
  valorTotal: number
  cliente: ClienteResumoDTO
  itens: ItemVendaResumoDTO[]
}

export const vendaService = {
  listar: async (): Promise<VendaResumoResponseDTO[]> => {
    const response = await api.get<VendaResumoResponseDTO[]>('/api/vendas')
    return response.data
  },

  buscarPorId: async (id: number): Promise<VendaResumoResponseDTO> => {
    const response = await api.get<VendaResumoResponseDTO>(`/api/vendas/${id}`)
    return response.data
  },

  buscarPorCliente: async (clienteId: number): Promise<VendaResumoResponseDTO[]> => {
    const response = await api.get<VendaResumoResponseDTO[]>(`/api/vendas/cliente/${clienteId}`)
    return response.data
  },

  criar: async (data: VendaRequestDTO): Promise<VendaResumoResponseDTO> => {
    const response = await api.post<VendaResumoResponseDTO>('/api/vendas', data)
    return response.data
  },
}

