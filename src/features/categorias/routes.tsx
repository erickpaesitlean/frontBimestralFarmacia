import { Routes, Route } from 'react-router-dom'
import { CategoriaListPage } from './pages/CategoriaListPage'
import { CategoriaFormPage } from './pages/CategoriaFormPage'

export function CategoriaRoutes() {
  return (
    <Routes>
      <Route path="listar" element={<CategoriaListPage />} />
      <Route path="criar" element={<CategoriaFormPage />} />
      <Route path="editar/:id" element={<CategoriaFormPage />} />
    </Routes>
  )
}

