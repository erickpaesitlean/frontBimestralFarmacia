import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { alertaService, type AlertaValidadeResponseDTO } from '../api/alertaService'
import { useToast } from '@/components/toast/ToastProvider'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function AlertaValidadeProximaPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [alerta, setAlerta] = useState<AlertaValidadeResponseDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dias, setDias] = useState<number>(30)

  useEffect(() => {
    loadAlerta()
  }, [])

  async function loadAlerta() {
    try {
      setIsLoading(true)
      const data = await alertaService.validadeProxima(dias || undefined)
      setAlerta(data)
    } catch (error) {
      showToast('error', 'Erro ao carregar alertas')
    } finally {
      setIsLoading(false)
    }
  }

  function handleFiltrar() {
    loadAlerta()
  }

  if (isLoading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Carregando...</div>
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate('/alertas')}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
        Voltar
      </Button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Alertas de Validade Próxima</h1>
        <div className="flex gap-3 items-end">
          <div className="w-48">
            <Input
              label="Dias"
              type="number"
              min="1"
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleFiltrar}>Filtrar</Button>
        </div>
      </div>

      {alerta && (
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6">
          <div className="mb-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Mostrando medicamentos com validade nos próximos <strong className="text-[var(--text-primary)]">{alerta.diasUtilizados}</strong> dias
            </p>
            <p className="text-lg font-semibold text-[var(--text-primary)] mt-2">
              Total: {alerta.quantidade} medicamento(s)
            </p>
          </div>

          {alerta.medicamentos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-secondary)]">Nenhum medicamento com validade próxima</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block border border-[var(--border-primary)] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--bg-tertiary)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Data Validade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-primary)]">
                    {alerta.medicamentos.map((med) => (
                      <tr key={med.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{med.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{med.nome}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{med.categoria}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                            {new Date(med.dataValidade).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {alerta.medicamentos.map((med) => (
                  <div
                    key={med.id}
                    className="border border-[var(--border-primary)] rounded-lg p-4 bg-[var(--bg-secondary)]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">#{med.id}</p>
                        <p className="text-base font-semibold text-[var(--text-primary)]">{med.nome}</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{med.categoria}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-primary)] flex items-center justify-between">
                      <p className="text-xs text-[var(--text-tertiary)]">Validade</p>
                      <span className="inline-flex px-2.5 py-1.5 text-sm font-bold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                        {new Date(med.dataValidade).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

