import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'relative bg-[var(--bg-secondary)] rounded-card shadow-drogaria-lg',
                sizes[size],
                'w-full max-h-[90vh] overflow-hidden flex flex-col',
                'border border-[var(--border-primary)]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                <h2 className="text-h2 text-drogaria-primary dark:text-[var(--drogaria-primary)]">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded hover:bg-[var(--bg-hover)]"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 stroke-[1.75]" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-secondary)]">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-6 py-4">{footer}</div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-body text-[var(--text-secondary)] leading-relaxed">{message}</p>
    </Modal>
  )
}
