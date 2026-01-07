import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-small font-medium text-[var(--text-primary)] mb-2">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5',
            'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-card',
            'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-drogaria-primary/20 dark:focus:ring-[var(--drogaria-primary)]/20 focus:border-drogaria-primary dark:focus:border-[var(--drogaria-primary)]',
            'transition-all duration-200',
            'disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
