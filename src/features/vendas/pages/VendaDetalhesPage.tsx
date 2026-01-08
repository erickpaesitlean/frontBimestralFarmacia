import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
    return <div className="text-center py-8 text-[var(--text-secondary)]">Carregando...</div>
  }

  if (!venda) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/vendas/listar')} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Detalhes da Venda #{venda.id}</h1>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Data da Venda</p>
            <p className="text-lg font-medium text-[var(--text-primary)]">
              {new Date(venda.dataVenda).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Cliente</p>
            <p className="text-lg font-medium text-[var(--text-primary)]">{venda.cliente.nome}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Itens</h2>
          <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--bg-tertiary)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Medicamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Preço Unitário</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {venda.itens.map((item, index) => (
                  <tr key={index} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{item.medicamentoNome}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{item.quantidade}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{formatCurrency(item.precoUnitario)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-[var(--border-primary)] pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-[var(--text-primary)]">Total:</span>
            <span className="text-3xl font-bold text-drogaria-accent dark:text-[var(--drogaria-accent)]">{formatCurrency(venda.valorTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

