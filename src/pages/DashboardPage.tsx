import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layers, Users, Pill, Receipt, TrendingUp, ArrowRight } from 'lucide-react'
import { api } from '@/api/axios'
import { useToast } from '@/components/toast/ToastProvider'
import { cn } from '@/lib/utils'

interface DashboardStats {
  categorias: number
  clientes: number
  medicamentos: number
  vendas: number
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    categorias: 0,
    clientes: 0,
    medicamentos: 0,
    vendas: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [categoriasRes, clientesRes, medicamentosRes, vendasRes] = await Promise.all([
          api.get('/api/categorias'),
          api.get('/api/clientes'),
          api.get('/api/medicamentos'),
          api.get('/api/vendas'),
        ])

        setStats({
          categorias: categoriasRes.data.length,
          clientes: clientesRes.data.length,
          medicamentos: medicamentosRes.data.length,
          vendas: vendasRes.data.length,
        })
      } catch (error) {
        showToast('error', 'Erro ao carregar estatísticas')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [showToast])

  const statCards = [
    {
      label: 'Categorias',
      value: stats.categorias,
      icon: Layers,
      color: 'drogaria-primary',
      path: '/categorias',
    },
    {
      label: 'Clientes',
      value: stats.clientes,
      icon: Users,
      color: 'drogaria-secondary',
      path: '/clientes',
    },
    {
      label: 'Medicamentos',
      value: stats.medicamentos,
      icon: Pill,
      color: 'drogaria-primary',
      path: '/medicamentos',
    },
    {
      label: 'Vendas',
      value: stats.vendas,
      icon: Receipt,
      color: 'drogaria-accent',
      path: '/vendas',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-drogaria-primary dark:border-[var(--drogaria-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] font-medium">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'drogaria-primary':
        return {
          bg: 'bg-drogaria-primary',
          hover: 'hover:bg-drogaria-primary-dark',
          text: 'text-drogaria-primary',
          border: 'border-drogaria-primary',
          light: 'bg-drogaria-primary-light',
        }
      case 'drogaria-secondary':
        return {
          bg: 'bg-drogaria-secondary',
          hover: 'hover:bg-drogaria-secondary-dark',
          text: 'text-drogaria-secondary',
          border: 'border-drogaria-secondary',
          light: 'bg-drogaria-secondary-light',
        }
      case 'drogaria-accent':
        return {
          bg: 'bg-drogaria-accent',
          hover: 'hover:bg-drogaria-accent-dark',
          text: 'text-drogaria-accent',
          border: 'border-drogaria-accent',
          light: 'bg-drogaria-accent-light',
        }
      default:
        return {
          bg: 'bg-drogaria-primary',
          hover: 'hover:bg-drogaria-primary-dark',
          text: 'text-drogaria-primary',
          border: 'border-drogaria-primary',
          light: 'bg-drogaria-primary-light',
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-drogaria-primary dark:text-[var(--drogaria-primary)] mb-2">Painel de Controle</h1>
        <p className="text-body text-[var(--text-secondary)]">Visão geral do sistema de gestão farmacêutica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const colors = getColorClasses(card.color)
          return (
            <motion.button
              key={card.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.path)}
              className={cn(
                'group relative bg-[var(--bg-secondary)] rounded-card p-6',
                'border border-[var(--border-primary)] hover:border-drogaria-primary dark:hover:border-[var(--drogaria-primary)]',
                'shadow-drogaria hover:shadow-drogaria-lg',
                'transition-all duration-300 text-left overflow-hidden'
              )}
            >
              {/* Background Hover */}
              <div className={`absolute inset-0 ${colors.light} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-card flex items-center justify-center shadow-drogaria',
                      colors.bg
                    )}
                  >
                    <Icon className="w-6 h-6 text-white stroke-[1.75]" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-drogaria-primary dark:group-hover:text-[var(--drogaria-primary)] group-hover:translate-x-1 transition-all duration-300 stroke-[1.75]" />
                </div>
                <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">{card.value}</p>
                <p className="text-small font-medium text-[var(--text-secondary)]">{card.label}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-[var(--bg-secondary)] rounded-card p-6 border border-[var(--border-primary)] shadow-drogaria"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-drogaria-primary dark:text-[var(--drogaria-primary)] stroke-[1.75]" />
          <h2 className="text-h3 text-drogaria-primary dark:text-[var(--drogaria-primary)]">Ações Rápidas</h2>
        </div>
        <p className="text-body text-[var(--text-secondary)]">
          Navegue pelos módulos do sistema usando o menu lateral ou clique nos cards acima.
        </p>
      </motion.div>
    </div>
  )
}
