import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-drogaria-primary dark:focus:ring-[var(--drogaria-primary)] focus:ring-offset-2',
        'bg-gray-200 dark:bg-[var(--bg-tertiary)]'
      )}
      aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      role="switch"
      aria-checked={theme === 'dark'}
    >
      <span
        className={cn(
          'inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md',
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        )}
      >
        <span className="flex h-full w-full items-center justify-center">
          {theme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-gray-700 stroke-[1.75]" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-yellow-500 stroke-[1.75]" />
          )}
        </span>
      </span>
    </button>
  )
}

