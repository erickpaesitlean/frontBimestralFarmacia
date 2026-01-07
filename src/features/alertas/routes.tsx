import { Routes, Route } from 'react-router-dom'
import { AlertaIndexPage } from './pages/AlertaIndexPage'
import { AlertaEstoqueBaixoPage } from './pages/AlertaEstoqueBaixoPage'
import { AlertaValidadeProximaPage } from './pages/AlertaValidadeProximaPage'

export function AlertaRoutes() {
  return (
    <Routes>
      <Route index element={<AlertaIndexPage />} />
      <Route path="estoque-baixo" element={<AlertaEstoqueBaixoPage />} />
      <Route path="validade-proxima" element={<AlertaValidadeProximaPage />} />
    </Routes>
  )
}

