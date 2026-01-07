import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { type ToastMessage } from './types'
import { cn } from '@/lib/utils'

interface ToastProps {
  toast: ToastMessage
  onClose: () => void
}

export function Toast({ toast, onClose }: ToastProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-drogaria-secondary',
      border: 'border-drogaria-secondary-dark',
      iconColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bg: 'bg-drogaria-danger',
      border: 'border-red-600',
      iconColor: 'text-white',
    },
    info: {
      icon: Info,
      bg: 'bg-drogaria-primary',
      border: 'border-drogaria-primary-dark',
      iconColor: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-drogaria-warning',
      border: 'border-yellow-600',
      iconColor: 'text-white',
    },
  }[toast.type]

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative bg-[var(--bg-secondary)] rounded-card shadow-drogaria-lg border',
        config.border,
        'min-w-[320px] max-w-md',
        'overflow-hidden'
      )}
    >
      <div className={cn('absolute top-0 left-0 right-0 h-1', config.bg)} />
      
      <div className="flex items-start gap-3 p-4">
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', config.bg)}>
          <Icon className={cn('w-5 h-5 stroke-[1.75]', config.iconColor)} />
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-small font-medium text-[var(--text-primary)] leading-relaxed">{toast.message}</p>
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded hover:bg-[var(--bg-hover)]"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>
    </motion.div>
  )
}
