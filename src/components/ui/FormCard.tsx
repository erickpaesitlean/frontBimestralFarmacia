import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FormCardProps {
  children: ReactNode
  className?: string
  allowOverflow?: boolean
}

export function FormCard({ children, className, allowOverflow = false }: FormCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)] shadow-drogaria',
        'max-w-4xl mx-auto',
        !allowOverflow && 'overflow-hidden',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

interface FormHeaderProps {
  title: string
  description?: string
  className?: string
}

export function FormHeader({ title, description, className }: FormHeaderProps) {
  return (
    <div className={cn('px-6 lg:px-8 pt-6 lg:pt-8 pb-4 border-b border-[var(--border-primary)]', className)}>
      <h1 className="text-h1 text-drogaria-primary dark:text-[var(--drogaria-primary)] mb-2">{title}</h1>
      {description && <p className="text-body text-[var(--text-secondary)]">{description}</p>}
    </div>
  )
}

interface FormSectionProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function FormSection({ children, title, description, className }: FormSectionProps) {
  return (
    <div className={cn('px-6 lg:px-8 py-6', className)}>
      {title && (
        <div className="mb-6">
          <h2 className="text-h3 text-drogaria-primary dark:text-[var(--drogaria-primary)] mb-1">{title}</h2>
          {description && <p className="text-small text-[var(--text-secondary)]">{description}</p>}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  )
}

interface FormFooterProps {
  children: ReactNode
  className?: string
}

export function FormFooter({ children, className }: FormFooterProps) {
  return (
    <div
      className={cn(
        'px-6 lg:px-8 py-4 lg:py-5 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]',
        'sticky bottom-0 z-10',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">{children}</div>
    </div>
  )
}

