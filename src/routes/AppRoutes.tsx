import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { CategoriaRoutes } from '@/features/categorias/routes'
import { ClienteRoutes } from '@/features/clientes/routes'
import { MedicamentoRoutes } from '@/features/medicamentos/routes'
import { EstoqueRoutes } from '@/features/estoque/routes'
import { VendaRoutes } from '@/features/vendas/routes'
import { AlertaRoutes } from '@/features/alertas/routes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

          {/* Features */}
          <Route path="/categorias" element={<Navigate to="/categorias/listar" replace />} />
          <Route path="/categorias/*" element={<CategoriaRoutes />} />

          <Route path="/clientes" element={<Navigate to="/clientes/listar" replace />} />
          <Route path="/clientes/*" element={<ClienteRoutes />} />

          <Route path="/medicamentos" element={<Navigate to="/medicamentos/listar" replace />} />
          <Route path="/medicamentos/*" element={<MedicamentoRoutes />} />

          <Route path="/estoque/*" element={<EstoqueRoutes />} />

          <Route path="/vendas" element={<Navigate to="/vendas/listar" replace />} />
          <Route path="/vendas/*" element={<VendaRoutes />} />

          <Route path="/alertas/*" element={<AlertaRoutes />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}


