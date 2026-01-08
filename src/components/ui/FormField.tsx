import { type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, forwardRef, type ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BaseFieldProps {
  label?: string
  error?: string
  helperText?: string
  icon?: ComponentType<{ className?: string }>
  className?: string
  required?: boolean
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {
  as?: 'input'
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {
  as: 'textarea'
}

type FormFieldProps = InputFieldProps | TextareaFieldProps

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({ label, error, helperText, icon: Icon, className, required, as = 'input', ...props }, ref) => {
    const inputProps = props as any
    const baseInputClasses = cn(
      'w-full px-4 py-2.5',
      'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-card',
      'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
      'focus:outline-none focus:ring-2 focus:ring-drogaria-primary/20 dark:focus:ring-[var(--drogaria-primary)]/20 focus:border-drogaria-primary dark:focus:border-[var(--drogaria-primary)]',
      'transition-all duration-200',
      'disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed',
      error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
      Icon && 'pl-11'
    )

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="block text-small font-medium text-[var(--text-primary)] mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div
              className={cn(
                'absolute left-3 text-[var(--text-tertiary)] pointer-events-none',
                as === 'textarea' ? 'top-3' : 'top-1/2 -translate-y-1/2'
              )}
            >
              <Icon className="w-5 h-5 stroke-[1.75]" />
            </div>
          )}

          {as === 'textarea' ? (
            <textarea
              ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
              className={cn(baseInputClasses, Icon && 'pt-3', 'resize-none min-h-[100px]')}
              {...inputProps}
            />
          ) : (
            <input
              ref={ref as React.ForwardedRef<HTMLInputElement>}
              className={baseInputClasses}
              {...inputProps}
            />
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1.5 text-small text-red-600 font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {helperText && !error && (
          <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{helperText}</p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

