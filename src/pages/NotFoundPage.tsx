import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-8">Página não encontrada</p>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    </div>
  )
}

