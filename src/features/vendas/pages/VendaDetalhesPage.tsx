import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { vendaService, type VendaResumoResponseDTO } from '../api/vendaService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/masks'

export function VendaDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [venda, setVenda] = useState<VendaResumoResponseDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadVenda(Number(id))
    }
  }, [id])

  async function loadVenda(vendaId: number) {
    try {
      setIsLoading(true)
      const data = await vendaService.buscarPorId(vendaId)
      setVenda(data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast('error', 'Venda não encontrada')
        navigate('/vendas/listar')
      } else {
        showToast('error', 'Erro ao carregar venda')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (!venda) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/vendas/listar')} className="mb-4">
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Detalhes da Venda #{venda.id}</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-500">Data da Venda</p>
            <p className="text-lg font-medium text-slate-900">
              {new Date(venda.dataVenda).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Cliente</p>
            <p className="text-lg font-medium text-slate-900">{venda.cliente.nome}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Itens</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Medicamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Preço Unitário</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {venda.itens.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-slate-900">{item.medicamentoNome}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.quantidade}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.precoUnitario)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-slate-900">Total:</span>
            <span className="text-3xl font-bold text-blue-600">{formatCurrency(venda.valorTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

