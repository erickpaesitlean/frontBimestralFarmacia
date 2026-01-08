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
} from 'lucide-react'
import { medicamentoService } from '@/features/medicamentos/api/medicamentoService'
import { alertaService } from '@/features/alertas/api/alertaService'
import { useToast } from '@/components/toast/ToastProvider'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)

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
    } catch (error) {
      showToast('error', 'Erro ao carregar dados do estoque')
    } finally {
      setIsLoading(false)
    }
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
    {
      label: 'Histórico de Movimentações',
      description: 'Consultar e filtrar movimentações',
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25',
      onClick: () => navigate('/estoque/historico'),
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

    </div>
  )
}
