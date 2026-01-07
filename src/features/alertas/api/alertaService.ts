import { api } from '@/api/axios'

export interface AlertaEstoqueItemDTO {
  id: number
  nome: string
  categoria: string
  quantidadeEstoque: number
}

export interface AlertaEstoqueResponseDTO {
  limiteUtilizado: number
  quantidade: number
  medicamentos: AlertaEstoqueItemDTO[]
}

export interface AlertaValidadeItemDTO {
  id: number
  nome: string
  categoria: string
  dataValidade: string
}

export interface AlertaValidadeResponseDTO {
  diasUtilizados: number
  quantidade: number
  medicamentos: AlertaValidadeItemDTO[]
}

export const alertaService = {
  estoqueBaixo: async (limite?: number): Promise<AlertaEstoqueResponseDTO> => {
    const response = await api.get<AlertaEstoqueResponseDTO>('/api/alertas/estoque-baixo', {
      params: limite ? { limite } : undefined,
    })
    return response.data
  },

  validadeProxima: async (dias?: number): Promise<AlertaValidadeResponseDTO> => {
    const response = await api.get<AlertaValidadeResponseDTO>('/api/alertas/validade-proxima', {
      params: dias ? { dias } : undefined,
    })
    return response.data
  },
}

