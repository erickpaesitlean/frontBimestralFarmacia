import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Layers,
  Users,
  Pill,
  Package,
  Receipt,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/categorias', label: 'Categorias', icon: Layers },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/medicamentos', label: 'Medicamentos', icon: Pill },
  { path: '/estoque', label: 'Estoque', icon: Package },
  { path: '/vendas', label: 'Vendas', icon: Receipt },
  { path: '/alertas', label: 'Alertas', icon: AlertTriangle },
]

export function AppLayout() {
  const { logout, username } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false) // No desktop, sidebar sempre visível
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'bg-gradient-to-b from-drogaria-primary to-drogaria-primary-dark',
          'dark:from-[var(--bg-secondary)] dark:to-[var(--bg-tertiary)]',
          'flex flex-col w-64',
          'transition-transform duration-300 ease-in-out',
          isMobile && (sidebarOpen ? 'translate-x-0' : '-translate-x-full'),
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/20 dark:border-[var(--border-primary)] flex-shrink-0 bg-white dark:bg-[var(--bg-secondary)]">
          <div className="flex items-center">
            <img
              src="/DSP_Marca_130716-01.png"
              alt="Drogaria SP Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-drogaria-primary dark:text-[var(--drogaria-primary)] hover:text-drogaria-accent dark:hover:text-[var(--drogaria-accent)] transition-colors p-1 rounded hover:bg-drogaria-light dark:hover:bg-[var(--bg-hover)]"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate(item.path)
                      if (isMobile) setSidebarOpen(false)
                    }}
                    className={cn(
                      'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      'text-sm font-medium',
                      isActive
                        ? 'bg-drogaria-accent dark:bg-[var(--drogaria-accent)] text-white shadow-drogaria'
                        : 'text-white/80 dark:text-[var(--text-secondary)] hover:text-white dark:hover:text-[var(--text-primary)] hover:bg-white/10 dark:hover:bg-[var(--bg-hover)]'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 stroke-[1.75] transition-colors',
                        isActive ? 'text-white' : 'text-white/80 dark:text-[var(--text-secondary)] hover:text-drogaria-accent dark:hover:text-[var(--drogaria-accent)]'
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-2 h-2 bg-white rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 dark:border-[var(--border-primary)] flex-shrink-0 bg-white/5 dark:bg-[var(--bg-tertiary)]">
          <div className="mb-3 px-3 py-2.5 bg-white/10 dark:bg-[var(--bg-hover)] rounded-card border border-white/20 dark:border-[var(--border-primary)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 dark:bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white dark:text-[var(--text-primary)] stroke-[1.75]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white dark:text-[var(--text-primary)] truncate">{username}</p>
                <p className="text-xs text-white/60 dark:text-[var(--text-tertiary)]">Usuário logado</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-white/80 dark:text-[var(--text-secondary)] hover:text-white dark:hover:text-[var(--text-primary)] hover:bg-white/10 dark:hover:bg-[var(--bg-hover)]"
          >
            <LogOut className="w-4 h-4 stroke-[1.75]" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-primary)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 flex-shrink-0 shadow-drogaria">
          {/* Botão Menu Mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-drogaria-gray-medium dark:text-[var(--text-secondary)] hover:text-drogaria-primary dark:hover:text-[var(--drogaria-primary)] transition-colors p-2 rounded hover:bg-drogaria-light dark:hover:bg-[var(--bg-hover)]"
          >
            <Menu className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Logo Centralizado (mobile - apenas quando sidebar fechada) */}
          <div className={cn(
            'absolute left-1/2 -translate-x-1/2',
            'lg:hidden', // Oculto em desktop (sidebar sempre visível)
            !sidebarOpen ? 'block' : 'hidden' // Visível apenas quando sidebar fechada
          )}>
            <img
              src="/DSP_Marca_130716-01.png"
              alt="Drogaria SP Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
