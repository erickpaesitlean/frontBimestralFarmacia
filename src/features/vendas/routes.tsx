import { Routes, Route } from 'react-router-dom'
import { VendaListPage } from './pages/VendaListPage'
import { VendaFormPage } from './pages/VendaFormPage'
import { VendaDetalhesPage } from './pages/VendaDetalhesPage'

export function VendaRoutes() {
  return (
    <Routes>
      <Route path="listar" element={<VendaListPage />} />
      <Route path="criar" element={<VendaFormPage />} />
      <Route path="detalhes/:id" element={<VendaDetalhesPage />} />
    </Routes>
  )
}

