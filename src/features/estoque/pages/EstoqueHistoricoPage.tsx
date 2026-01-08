import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Check, Filter, Package, Search, X } from 'lucide-react'
import { medicamentoService, type MedicamentoResponseDTO } from '@/features/medicamentos/api/medicamentoService'
import { estoqueService, type MovimentacaoEstoqueResponseDTO } from '../api/estoqueService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection } from '@/components/ui/FormCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { cn } from '@/lib/utils'

type TipoMov = 'TODOS' | 'ENTRADA' | 'SAIDA'

const DEFAULT_MEDICAMENTOS_AGREGADOS = 30
const DEFAULT_LIMITE_POR_MED = 10
const LIMITE_POR_MED_SELECIONADO = 200

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function startOfDayISO(dateStr: string) {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function endOfDayISO(dateStr: string) {
  const d = new Date(dateStr)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export function EstoqueHistoricoPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [medicamentos, setMedicamentos] = useState<Array<{ id: number; nome: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(true)
  const [historico, setHistorico] = useState<MovimentacaoEstoqueResponseDTO[]>([])

  const [tipo, setTipo] = useState<TipoMov>('TODOS')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')

  const [medicamentoBusca, setMedicamentoBusca] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [sugestaoAtiva, setSugestaoAtiva] = useState(0)
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<{ id: number; nome: string } | null>(null)
  const medInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setIsLoading(true)
      const meds = await medicamentoService.listar()
      const mapped = meds.map((m: MedicamentoResponseDTO) => ({ id: m.id, nome: m.nome }))
      setMedicamentos(mapped)
      await loadHistoricoAgregado(mapped)
    } catch (error) {
      showToast('error', 'Erro ao carregar histórico')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadHistoricoAgregado(meds: Array<{ id: number; nome: string }>) {
    try {
      setIsLoadingHistorico(true)
      const selecionados = meds.slice(0, DEFAULT_MEDICAMENTOS_AGREGADOS)
      const prom = selecionados.map((m) =>
        estoqueService.buscarHistorico(m.id, DEFAULT_LIMITE_POR_MED).catch(() => [])
      )
      const res = await Promise.all(prom)
      const merged = res
        .flat()
        .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
      setHistorico(merged)
    } catch (error) {
      showToast('error', 'Erro ao carregar movimentações')
    } finally {
      setIsLoadingHistorico(false)
    }
  }

  async function loadHistoricoDoMedicamento(med: { id: number; nome: string }) {
    try {
      setIsLoadingHistorico(true)
      const data = await estoqueService.buscarHistorico(med.id, LIMITE_POR_MED_SELECIONADO)
      setHistorico(
        data.sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
      )
    } catch (error) {
      showToast('error', 'Erro ao carregar histórico do medicamento')
    } finally {
      setIsLoadingHistorico(false)
    }
  }

  const medicamentosFiltrados = useMemo(() => {
    const q = medicamentoBusca.trim().toLowerCase()
    if (!q) return []
    return medicamentos.filter((m) => m.nome.toLowerCase().includes(q)).slice(0, 20)
  }, [medicamentoBusca, medicamentos])

  const historicoFiltrado = useMemo(() => {
    let list = historico

    if (tipo !== 'TODOS') {
      list = list.filter((m) => m.tipo === tipo)
    }

    if (dataInicio) {
      const start = startOfDayISO(dataInicio)
      list = list.filter((m) => new Date(m.dataMovimentacao).getTime() >= start)
    }
    if (dataFim) {
      const end = endOfDayISO(dataFim)
      list = list.filter((m) => new Date(m.dataMovimentacao).getTime() <= end)
    }

    return list
  }, [historico, tipo, dataInicio, dataFim])

  function handleSelecionarMedicamento(med: { id: number; nome: string }) {
    setMedicamentoSelecionado(med)
    setMedicamentoBusca(med.nome)
    setMostrarSugestoes(false)
    setSugestaoAtiva(0)
    loadHistoricoDoMedicamento(med)
  }

  function handleLimparMedicamento() {
    setMedicamentoSelecionado(null)
    setMedicamentoBusca('')
    setMostrarSugestoes(false)
    setSugestaoAtiva(0)
    loadHistoricoAgregado(medicamentos)
    requestAnimationFrame(() => medInputRef.current?.focus())
  }

  function handleMedKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrarSugestoes) {
      if (e.key === 'Enter' && medicamentosFiltrados.length === 1) {
        e.preventDefault()
        handleSelecionarMedicamento(medicamentosFiltrados[0])
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSugestaoAtiva((prev) => Math.min(prev + 1, Math.max(medicamentosFiltrados.length - 1, 0)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSugestaoAtiva((prev) => Math.max(prev - 1, 0))
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setMostrarSugestoes(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const med = medicamentosFiltrados[sugestaoAtiva]
      if (med) handleSelecionarMedicamento(med)
    }
  }

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.med-historico-autocomplete')) setMostrarSugestoes(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/estoque')} className="gap-2">
        <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
        Voltar
      </Button>

      <FormCard allowOverflow className="max-w-7xl">
        <FormHeader
          title="Histórico de Movimentações"
          description="Consulte e filtre as movimentações por período, medicamento e tipo"
        />

        <FormSection>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Medicamento (autocomplete) */}
            <div className="med-historico-autocomplete relative lg:col-span-2">
              <label className="block text-small font-medium text-[var(--text-primary)] mb-2">
                Medicamento
              </label>
              <div className="relative z-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75]" />
                <input
                  ref={medInputRef}
                  type="text"
                  value={medicamentoBusca}
                  onChange={(e) => {
                    const v = e.target.value
                    setMedicamentoBusca(v)
                    setMostrarSugestoes(v.trim().length > 0)
                    setSugestaoAtiva(0)
                  }}
                  onKeyDown={handleMedKeyDown}
                  onFocus={() => {
                    if (medicamentoBusca.trim().length > 0) setMostrarSugestoes(true)
                  }}
                  placeholder="Digite para buscar medicamento"
                  className={cn(
                    'w-full pl-11 pr-10 py-2.5',
                    'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                    'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                    'transition-all duration-200'
                  )}
                />
                {(medicamentoBusca || medicamentoSelecionado) && (
                  <button
                    type="button"
                    onClick={handleLimparMedicamento}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                    title="Limpar filtro de medicamento"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {mostrarSugestoes && medicamentoBusca.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 z-[100] mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                  >
                    {medicamentosFiltrados.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum medicamento encontrado.</div>
                    ) : (
                      medicamentosFiltrados.map((med, idx) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => handleSelecionarMedicamento(med)}
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors border-b border-[var(--border-primary)] last:border-b-0 first:rounded-t-xl last:rounded-b-xl',
                            idx === sugestaoAtiva ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{med.nome}</p>
                            {idx === sugestaoAtiva ? (
                              <Check className="w-4 h-4 text-green-500 stroke-[2] flex-shrink-0" />
                            ) : null}
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Período */}
            <div>
              <label className="block text-small font-medium text-[var(--text-primary)] mb-2">De</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75]" />
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className={cn(
                    'w-full pl-11 pr-4 py-2.5',
                    'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl',
                    'text-[var(--text-primary)]',
                    'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </div>
            <div>
              <label className="block text-small font-medium text-[var(--text-primary)] mb-2">Até</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75]" />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className={cn(
                    'w-full pl-11 pr-4 py-2.5',
                    'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl',
                    'text-[var(--text-primary)]',
                    'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--text-tertiary)] stroke-[1.75]" />
              <label className="text-small font-medium text-[var(--text-primary)]">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoMov)}
                className={cn(
                  'h-10 px-3 rounded-xl border border-[var(--border-primary)]',
                  'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
                  'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                  'transition-all duration-200'
                )}
              >
                <option value="TODOS">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>

            <div className="text-xs text-[var(--text-tertiary)]">
              {medicamentoSelecionado
                ? `Mostrando histórico de: ${medicamentoSelecionado.nome}`
                : `Visão agregada (amostra): ${DEFAULT_MEDICAMENTOS_AGREGADOS} medicamentos • ${DEFAULT_LIMITE_POR_MED} mov./med`}
            </div>
          </div>
        </FormSection>

        <FormSection>
          {isLoading || isLoadingHistorico ? (
            <div className="py-12 text-center">
              <p className="text-[var(--text-secondary)]">Carregando histórico...</p>
            </div>
          ) : historicoFiltrado.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 stroke-[1.75]" />
              <p className="text-body text-[var(--text-secondary)] font-medium">Nenhuma movimentação encontrada</p>
              <p className="text-small text-[var(--text-tertiary)] mt-1">Ajuste os filtros para ver resultados</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Saldo Anterior</TableHead>
                      <TableHead className="text-right">Saldo Atual</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* Evitar “linha dupla”: TableRow já tem border-b */}
                  <TableBody className="divide-y-0">
                    {historicoFiltrado.map((mov, idx) => (
                      <TableRow
                        key={mov.id}
                        className={cn(
                          'hover:bg-[var(--bg-hover)]',
                          idx % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)]/40'
                        )}
                      >
                        <TableCell className="whitespace-nowrap text-[var(--text-primary)]">
                          {formatDateTime(mov.dataMovimentacao)}
                        </TableCell>
                        <TableCell className="font-medium text-[var(--text-primary)] max-w-[360px]">
                          <span className="block truncate" title={mov.medicamentoNome}>
                            {mov.medicamentoNome}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                              mov.tipo === 'ENTRADA'
                                ? 'bg-drogaria-secondary-light dark:bg-emerald-900/30 text-drogaria-secondary-dark dark:text-emerald-300 border border-drogaria-secondary dark:border-emerald-600'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                            )}
                          >
                            {mov.tipo}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap font-semibold text-[var(--text-primary)]">
                          {mov.quantidade}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap text-[var(--text-secondary)]">
                          {mov.saldoAnterior}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap font-semibold text-[var(--text-primary)]">
                          {mov.saldoAtual}
                        </TableCell>
                        <TableCell className="text-[var(--text-secondary)] max-w-[420px]">
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
                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{mov.medicamentoNome}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{formatDateTime(mov.dataMovimentacao)}</p>
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
                      <p className="text-sm text-[var(--text-primary)]">{mov.motivo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </FormSection>
      </FormCard>
    </div>
  )
}


