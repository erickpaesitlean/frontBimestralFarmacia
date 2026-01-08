import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingDown, Clock, Bell } from 'lucide-react'

export function AlertaIndexPage() {
  const navigate = useNavigate()

  const alerts = [
    {
      label: 'Estoque Baixo',
      description: 'Medicamentos com estoque abaixo do limite',
      icon: TrendingDown,
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/25',
      onClick: () => navigate('/alertas/estoque-baixo'),
    },
    {
      label: 'Validade Próxima',
      description: 'Medicamentos com validade próxima do vencimento',
      icon: Clock,
      gradient: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-500/25',
      onClick: () => navigate('/alertas/validade-proxima'),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Bell className="w-5 h-5 text-white stroke-[1.75]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Alertas do Sistema</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Monitore estoque baixo e validades próximas</p>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {alerts.map((alert, index) => {
          const Icon = alert.icon
          return (
            <motion.div
              key={alert.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={alert.onClick}
                className="group relative w-full bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)] hover:border-[var(--border-secondary)] shadow-sm hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${alert.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${alert.gradient} flex items-center justify-center shadow-lg ${alert.shadow}`}
                    >
                      <Icon className="w-7 h-7 text-white stroke-[1.75]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{alert.label}</h2>
                      <p className="text-sm text-[var(--text-secondary)]">{alert.description}</p>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
