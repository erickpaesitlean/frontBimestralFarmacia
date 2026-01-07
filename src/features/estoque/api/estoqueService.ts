import { api } from '@/api/axios'

export interface MovimentacaoEstoqueRequestDTO {
  medicamentoId: number
  quantidade: number
  motivo: string
}

export interface MovimentacaoEstoqueResponseDTO {
  id: number
  medicamentoId: number
  medicamentoNome: string
  tipo: 'ENTRADA' | 'SAIDA'
  quantidade: number
  motivo: string
  dataMovimentacao: string
  saldoAnterior: number
  saldoAtual: number
}

export const estoqueService = {
  registrarEntrada: async (data: MovimentacaoEstoqueRequestDTO): Promise<MovimentacaoEstoqueResponseDTO> => {
    const response = await api.post<MovimentacaoEstoqueResponseDTO>('/api/estoque/entrada', data)
    return response.data
  },

  registrarSaida: async (data: MovimentacaoEstoqueRequestDTO): Promise<MovimentacaoEstoqueResponseDTO> => {
    const response = await api.post<MovimentacaoEstoqueResponseDTO>('/api/estoque/saida', data)
    return response.data
  },

  buscarHistorico: async (medicamentoId: number, limite?: number): Promise<MovimentacaoEstoqueResponseDTO[]> => {
    const response = await api.get<MovimentacaoEstoqueResponseDTO[]>(`/api/estoque/${medicamentoId}/historico`, {
      params: limite ? { limite } : undefined,
    })
    return response.data
  },
}

