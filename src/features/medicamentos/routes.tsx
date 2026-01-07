import { Routes, Route } from 'react-router-dom'
import { MedicamentoListPage } from './pages/MedicamentoListPage'
import { MedicamentoFormPage } from './pages/MedicamentoFormPage'
import { MedicamentoHistoricoPage } from './pages/MedicamentoHistoricoPage'

export function MedicamentoRoutes() {
  return (
    <Routes>
      <Route path="listar" element={<MedicamentoListPage />} />
      <Route path="criar" element={<MedicamentoFormPage />} />
      <Route path="editar/:id" element={<MedicamentoFormPage />} />
      <Route path="historico/:id" element={<MedicamentoHistoricoPage />} />
    </Routes>
  )
}

