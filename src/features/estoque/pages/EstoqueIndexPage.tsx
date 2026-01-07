import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Info,
} from 'lucide-react'
import { medicamentoService, type MedicamentoResponseDTO } from '@/features/medicamentos/api/medicamentoService'
import { estoqueService, type MovimentacaoEstoqueResponseDTO } from '../api/estoqueService'
import { alertaService } from '@/features/alertas/api/alertaService'
import { useToast } from '@/components/toast/ToastProvider'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/Table'
import { cn } from '@/lib/utils'

interface StockStats {
  totalMedicamentos: number
  medicamentosAtivos: number
  medicamentosEstoqueBaixo: number
}

export function EstoqueIndexPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stats, setStats] = useState<StockStats>({
    totalMedicamentos: 0,
    medicamentosAtivos: 0,
    medicamentosEstoqueBaixo: 0,
  })
  const [historico, setHistorico] = useState<MovimentacaoEstoqueResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      setIsLoadingHistory(true)

      // Carregar medicamentos e alertas em paralelo
      const [medicamentos, alertaEstoque] = await Promise.all([
        medicamentoService.listar(),
        alertaService.estoqueBaixo(10).catch(() => null), // Ignora erro se não houver alertas
      ])

      // Calcular estatísticas
      const medicamentosAtivos = medicamentos.filter((m) => m.ativo).length
      const medicamentosEstoqueBaixo = alertaEstoque?.medicamentos?.length || 0

      setStats({
        totalMedicamentos: medicamentos.length,
        medicamentosAtivos,
        medicamentosEstoqueBaixo,
      })

      // Carregar histórico agregado (últimas movimentações de cada medicamento)
      await loadHistorico(medicamentos)
    } catch (error) {
      showToast('error', 'Erro ao carregar dados do estoque')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadHistorico(medicamentos: MedicamentoResponseDTO[]) {
    try {
      setIsLoadingHistory(true)

      // Buscar histórico dos primeiros 10 medicamentos (para performance)
      const medicamentosLimitados = medicamentos.slice(0, 10)
      const historicosPromises = medicamentosLimitados.map((med) =>
        estoqueService.buscarHistorico(med.id, 5).catch(() => []) // 5 últimas movimentações por medicamento
      )

      const historicos = await Promise.all(historicosPromises)
      const historicoAgregado = historicos
        .flat()
        .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
        .slice(0, 20) // Últimas 20 movimentações no total

      setHistorico(historicoAgregado)
    } catch (error) {
      showToast('error', 'Erro ao carregar histórico')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const kpis = [
    {
      label: 'Total de Medicamentos',
      value: stats.totalMedicamentos,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25',
    },
    {
      label: 'Medicamentos Ativos',
      value: stats.medicamentosAtivos,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
    },
    {
      label: 'Estoque Baixo',
      value: stats.medicamentosEstoqueBaixo,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-500/25',
    },
  ]

  const actions = [
    {
      label: 'Registrar Entrada',
      description: 'Adicionar medicamentos ao estoque',
      icon: ArrowDownLeft,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
      onClick: () => navigate('/estoque/entrada'),
    },
    {
      label: 'Registrar Saída',
      description: 'Remover medicamentos do estoque',
      icon: ArrowUpRight,
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/25',
      onClick: () => navigate('/estoque/saida'),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-drogaria-primary mb-2">Gestão de Estoque</h1>
        <p className="text-body text-drogaria-gray-medium">Central de controle e movimentações</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-[var(--bg-secondary)] rounded-card p-6 border border-[var(--border-primary)] animate-pulse"
              >
                <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-card mb-4" />
                <div className="h-8 bg-[var(--bg-tertiary)] rounded mb-2" />
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-2/3" />
              </div>
            ))
          : kpis.map((kpi, index) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative bg-[var(--bg-secondary)] rounded-card p-6 border border-[var(--border-primary)] hover:border-drogaria-primary dark:hover:border-[var(--drogaria-primary)] shadow-drogaria hover:shadow-drogaria-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg ${kpi.shadow}`}
                      >
                        <Icon className="w-6 h-6 text-white stroke-[1.75]" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">{kpi.value}</p>
                    <p className="text-small font-medium text-[var(--text-secondary)]">{kpi.label}</p>
                  </div>
                </motion.div>
              )
            })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={action.onClick}
                className="group relative w-full bg-[var(--bg-secondary)] rounded-card p-6 border border-[var(--border-primary)] hover:border-drogaria-primary dark:hover:border-[var(--drogaria-primary)] shadow-drogaria hover:shadow-drogaria-lg transition-all duration-300 text-left overflow-hidden"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg ${action.shadow}`}
                    >
                      <Icon className="w-5 h-5 text-white stroke-[1.75]" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-drogaria-gray-medium group-hover:text-drogaria-primary group-hover:translate-x-1 transition-all duration-300 stroke-[1.75]" />
                  </div>
                  <h2 className="text-h3 text-drogaria-primary mb-1">{action.label}</h2>
                  <p className="text-small text-drogaria-gray-medium">{action.description}</p>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Histórico de Movimentações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)] shadow-drogaria overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h3 text-[var(--text-primary)]">Histórico de Movimentações</h2>
              <p className="text-small text-[var(--text-secondary)] mt-0.5">Últimas movimentações de estoque</p>
            </div>
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-drogaria-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--text-secondary)] font-medium">Carregando histórico...</p>
            </div>
          </div>
        ) : historico.length === 0 ? (
          <div className="p-12 text-center">
              <Package className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 stroke-[1.75]" />
            <p className="text-body text-[var(--text-secondary)] font-medium">Nenhuma movimentação registrada</p>
            <p className="text-small text-[var(--text-tertiary)] mt-1">As movimentações aparecerão aqui</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
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
                <TableBody>
                  {historico.map((mov, index) => (
                    <motion.tr
                      key={mov.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={cn(
                        'border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-150',
                        index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-tertiary)]/50'
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-drogaria-gray-medium stroke-[1.75]" />
                          <span className="text-body text-[var(--text-primary)]">{formatDate(mov.dataMovimentacao)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-[var(--text-primary)]">{mov.medicamentoNome}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                            mov.tipo === 'ENTRADA'
                              ? 'bg-drogaria-secondary-light dark:bg-emerald-900/30 text-drogaria-secondary-dark dark:text-emerald-300 border border-drogaria-secondary dark:border-emerald-600'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                          )}
                        >
                          {mov.tipo === 'ENTRADA' ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 mr-1 stroke-[1.75]" />
                              ENTRADA
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 mr-1 stroke-[1.75]" />
                              SAÍDA
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-[var(--text-primary)]">{mov.quantidade}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[var(--text-secondary)]">{mov.saldoAnterior}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-[var(--text-primary)]">{mov.saldoAtual}</span>
                      </TableCell>
                      <TableCell>
                        <div className="group relative">
                          <div className="flex items-center gap-2">
                            <span className="text-body text-[var(--text-secondary)] truncate max-w-[200px]">{mov.motivo}</span>
                            <Info className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-drogaria-primary dark:group-hover:text-[var(--drogaria-primary)] transition-colors stroke-[1.75]" />
                          </div>
                          <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-10">
                            <div className="bg-drogaria-primary text-white text-xs rounded-lg px-3 py-2 shadow-drogaria-lg max-w-xs">
                              {mov.motivo}
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-drogaria-primary rotate-45" />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-4">
              {historico.map((mov, index) => (
                <motion.div
                  key={mov.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-card p-4 shadow-drogaria hover:shadow-drogaria-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{mov.medicamentoNome}</h3>
                      <div className="flex items-center gap-2 text-small text-[var(--text-secondary)]">
                        <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{formatDate(mov.dataMovimentacao)}</span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2',
                        mov.tipo === 'ENTRADA'
                          ? 'bg-drogaria-secondary-light text-drogaria-secondary-dark border border-drogaria-secondary'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      )}
                    >
                      {mov.tipo === 'ENTRADA' ? (
                        <>
                          <ArrowDownLeft className="w-3 h-3 mr-1 stroke-[1.75]" />
                          ENTRADA
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3 h-3 mr-1 stroke-[1.75]" />
                          SAÍDA
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-0.5">Quantidade</p>
                      <p className="text-small font-semibold text-[var(--text-primary)]">{mov.quantidade}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-0.5">Anterior</p>
                      <p className="text-small text-[var(--text-secondary)]">{mov.saldoAnterior}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-0.5">Atual</p>
                      <p className="text-small font-semibold text-[var(--text-primary)]">{mov.saldoAtual}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-primary)]">
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Motivo</p>
                    <p className="text-small text-[var(--text-primary)]">{mov.motivo}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
