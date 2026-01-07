import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-button font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

    const variants = {
      primary:
        'bg-drogaria-accent dark:bg-[var(--drogaria-accent)] text-white hover:bg-drogaria-accent-dark dark:hover:bg-[var(--drogaria-accent-dark)] shadow-drogaria hover:shadow-drogaria-lg focus-visible:ring-drogaria-accent',
      secondary:
        'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] focus-visible:ring-drogaria-primary',
      danger:
        'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 shadow-drogaria hover:shadow-drogaria-lg focus-visible:ring-red-500',
      ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] focus-visible:ring-drogaria-primary',
      outline:
        'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-drogaria-primary focus-visible:ring-drogaria-primary shadow-drogaria',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin stroke-[1.75]" />
            Carregando...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
