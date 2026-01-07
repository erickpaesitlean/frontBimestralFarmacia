import { Routes, Route } from 'react-router-dom'
import { EstoqueIndexPage } from './pages/EstoqueIndexPage'
import { EstoqueEntradaPage } from './pages/EstoqueEntradaPage'
import { EstoqueSaidaPage } from './pages/EstoqueSaidaPage'

export function EstoqueRoutes() {
  return (
    <Routes>
      <Route index element={<EstoqueIndexPage />} />
      <Route path="entrada" element={<EstoqueEntradaPage />} />
      <Route path="saida" element={<EstoqueSaidaPage />} />
    </Routes>
  )
}

