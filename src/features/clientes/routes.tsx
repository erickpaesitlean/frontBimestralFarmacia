import { Routes, Route } from 'react-router-dom'
import { ClienteListPage } from './pages/ClienteListPage'
import { ClienteFormPage } from './pages/ClienteFormPage'

export function ClienteRoutes() {
  return (
    <Routes>
      <Route path="listar" element={<ClienteListPage />} />
      <Route path="criar" element={<ClienteFormPage />} />
      <Route path="editar/:id" element={<ClienteFormPage />} />
    </Routes>
  )
}

