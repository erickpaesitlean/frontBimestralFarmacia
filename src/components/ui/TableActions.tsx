import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, MoreVertical, Package, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface TableActionsProps {
  onEdit: () => void
  onHistory?: () => void
  onToggle?: () => void
  onDelete?: () => void
  isActive?: boolean
  showHistory?: boolean
  showToggle?: boolean
  showDelete?: boolean
}

export function TableActions({
  onEdit,
  onHistory,
  onToggle,
  onDelete,
  isActive = true,
  showHistory = true,
  showToggle = true,
  showDelete = true,
}: TableActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Calcular posição do menu
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setMenuPosition({
          top: rect.bottom + window.scrollY + 4,
          right: window.innerWidth - rect.right - window.scrollX,
        })
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const menuItems = [
    showHistory &&
      onHistory && {
        label: 'Histórico de Movimentações',
        icon: Package,
        onClick: () => {
          onHistory()
          setIsOpen(false)
        },
        className: 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
      },
    showToggle &&
      onToggle && {
        label: isActive ? 'Inativar' : 'Ativar',
        icon: RotateCcw,
        onClick: () => {
          onToggle()
          setIsOpen(false)
        },
        className: 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
      },
    showDelete &&
      onDelete && {
        label: 'Excluir',
        icon: Trash2,
        onClick: () => {
          onDelete()
          setIsOpen(false)
        },
        className: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
      },
  ].filter(Boolean) as Array<{
    label: string
    icon: typeof Package
    onClick: () => void
    className: string
  }>

  return (
    <div className="flex items-center gap-2 justify-end">
      {/* Botão Editar */}
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="gap-1.5 border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-drogaria-primary dark:hover:border-[var(--drogaria-primary)]"
      >
        <Pencil className="w-3.5 h-3.5 stroke-[1.75]" />
        Editar
      </Button>

      {/* Menu Dropdown */}
      {menuItems.length > 0 && (
        <>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
                'hover:bg-[var(--bg-hover)] active:scale-95',
                isOpen && 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
              )}
              aria-label="Mais opções"
            >
              <MoreVertical className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {isOpen &&
            typeof window !== 'undefined' &&
            createPortal(
              <AnimatePresence>
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[100]"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* Menu */}
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'fixed',
                      top: `${menuPosition.top}px`,
                      right: `${menuPosition.right}px`,
                    }}
                    className={cn(
                      'z-[101]',
                      'min-w-[160px]',
                      'bg-[var(--bg-secondary)] backdrop-blur-xl',
                      'border border-[var(--border-primary)]',
                      'rounded-xl shadow-drogaria-lg',
                      'overflow-hidden',
                      'py-1'
                    )}
                  >
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium',
                            'transition-colors duration-150',
                            'hover:bg-[var(--bg-hover)]',
                            item.className
                          )}
                        >
                          <Icon className="w-4 h-4 stroke-[1.75]" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </motion.div>
                </>
              </AnimatePresence>,
              document.body
            )}
        </>
      )}
    </div>
  )
}

