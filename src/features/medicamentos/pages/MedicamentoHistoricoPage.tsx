import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { estoqueService, type MovimentacaoEstoqueResponseDTO } from '@/features/estoque/api/estoqueService'
import { medicamentoService } from '../api/medicamentoService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { cn } from '@/lib/utils'

export function MedicamentoHistoricoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [historico, setHistorico] = useState<MovimentacaoEstoqueResponseDTO[]>([])
  const [medicamentoNome, setMedicamentoNome] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [tipo, setTipo] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')

  useEffect(() => {
    if (id) {
      loadData(Number(id))
    }
  }, [id])

  async function loadData(medicamentoId: number) {
    try {
      setIsLoading(true)
      const [medicamento, movimentacoes] = await Promise.all([
        medicamentoService.buscarPorId(medicamentoId),
        estoqueService.buscarHistorico(medicamentoId),
      ])
      setMedicamentoNome(medicamento.nome)
      setHistorico(
        movimentacoes.sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
      )
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast('error', 'Medicamento não encontrado')
        navigate('/medicamentos/listar')
      } else {
        showToast('error', 'Erro ao carregar histórico')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const historicoFiltrado = useMemo(() => {
    let list = historico

    if (tipo !== 'TODOS') {
      list = list.filter((m) => m.tipo === tipo)
    }

    if (dataInicio) {
      const start = new Date(dataInicio)
      start.setHours(0, 0, 0, 0)
      const startMs = start.getTime()
      list = list.filter((m) => new Date(m.dataMovimentacao).getTime() >= startMs)
    }

    if (dataFim) {
      const end = new Date(dataFim)
      end.setHours(23, 59, 59, 999)
      const endMs = end.getTime()
      list = list.filter((m) => new Date(m.dataMovimentacao).getTime() <= endMs)
    }

    return list
  }, [historico, tipo, dataInicio, dataFim])

  if (isLoading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/medicamentos/listar')} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
          Voltar
        </Button>
        <h1 className="text-h1 text-[var(--text-primary)] mb-2">Histórico de Movimentações</h1>
        <p className="text-body text-[var(--text-secondary)]">Medicamento: {medicamentoNome}</p>
      </div>

      {/* Filtros */}
      <div className="bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-small font-medium text-[var(--text-primary)] mb-2">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)] transition-all duration-200"
            >
              <option value="TODOS">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-small font-medium text-[var(--text-primary)] mb-2">De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)] transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-small font-medium text-[var(--text-primary)] mb-2">Até</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)] transition-all duration-200"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTipo('TODOS')
                setDataInicio('')
                setDataFim('')
              }}
              className="w-full"
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      </div>

      {historicoFiltrado.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)] shadow-drogaria">
          <p className="text-body text-[var(--text-secondary)]">
            {historico.length === 0 ? 'Nenhuma movimentação registrada' : 'Nenhuma movimentação encontrada para os filtros'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Saldo Anterior</TableHead>
                  <TableHead className="text-right">Saldo Atual</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y-0">
                {historicoFiltrado.map((mov, idx) => (
                  <TableRow
                    key={mov.id}
                    className={cn(
                      'hover:bg-[var(--bg-hover)]',
                      idx % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)]/40'
                    )}
                  >
                    <TableCell className="whitespace-nowrap">
                      {new Date(mov.dataMovimentacao).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full',
                          mov.tipo === 'ENTRADA'
                            ? 'bg-drogaria-secondary-light dark:bg-emerald-900/30 text-drogaria-secondary-dark dark:text-emerald-300 border border-drogaria-secondary dark:border-emerald-600'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                        )}
                      >
                        {mov.tipo}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">{mov.quantidade}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{mov.saldoAnterior}</TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">{mov.saldoAtual}</TableCell>
                    <TableCell className="max-w-[420px]">
                      <span className="block truncate" title={mov.motivo}>
                        {mov.motivo}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {historicoFiltrado.map((mov) => (
              <div
                key={mov.id}
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-card p-4 shadow-drogaria"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {new Date(mov.dataMovimentacao).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {mov.motivo}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0',
                      mov.tipo === 'ENTRADA'
                        ? 'bg-drogaria-secondary-light dark:bg-emerald-900/30 text-drogaria-secondary-dark dark:text-emerald-300 border border-drogaria-secondary dark:border-emerald-600'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                    )}
                  >
                    {mov.tipo}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Qtd</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{mov.quantidade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Anterior</p>
                    <p className="text-sm text-[var(--text-secondary)]">{mov.saldoAnterior}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Atual</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{mov.saldoAtual}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
                  <p className="text-xs text-[var(--text-tertiary)]">Motivo</p>
                  <p className="text-sm text-[var(--text-primary)] break-words">{mov.motivo}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

