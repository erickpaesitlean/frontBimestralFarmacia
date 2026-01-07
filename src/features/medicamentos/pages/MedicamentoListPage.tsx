import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { medicamentoService, type MedicamentoResponseDTO } from '../api/medicamentoService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/Modal'
import { TableActions } from '@/components/ui/TableActions'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/Table'
import { formatCurrency } from '@/lib/masks'

export function MedicamentoListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [medicamentos, setMedicamentos] = useState<MedicamentoResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [toggleId, setToggleId] = useState<number | null>(null)

  useEffect(() => {
    loadMedicamentos()
  }, [])

  async function loadMedicamentos() {
    try {
      setIsLoading(true)
      const data = await medicamentoService.listar()
      setMedicamentos(data)
    } catch (error: any) {
      showToast('error', 'Erro ao carregar medicamentos')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await medicamentoService.excluir(id)
      showToast('success', 'Medicamento excluído com sucesso!')
      loadMedicamentos()
      setDeleteId(null)
    } catch (error: any) {
      if (error.response?.status === 400) {
        showToast('error', error.response.data.message || 'Não é possível excluir medicamento que já foi vendido')
      } else {
        showToast('error', 'Erro ao excluir medicamento')
      }
    }
  }

  async function handleToggleStatus(id: number, currentStatus: boolean) {
    try {
      await medicamentoService.atualizarStatus(id, !currentStatus)
      showToast('success', `Medicamento ${!currentStatus ? 'ativado' : 'inativado'} com sucesso!`)
      loadMedicamentos()
      setToggleId(null)
    } catch (error: any) {
      showToast('error', 'Erro ao alterar status do medicamento')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h1 text-drogaria-primary dark:text-[var(--drogaria-primary)]">Medicamentos</h1>
        <Button onClick={() => navigate('/medicamentos/criar')}>Novo Medicamento</Button>
      </div>

      {medicamentos.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)]">
          <p className="text-[var(--text-secondary)] mb-4">Nenhum medicamento cadastrado</p>
          <Button onClick={() => navigate('/medicamentos/criar')}>Criar primeiro medicamento</Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicamentos.map((medicamento) => (
                  <TableRow key={medicamento.id}>
                    <TableCell className="whitespace-nowrap font-mono">{medicamento.id}</TableCell>
                    <TableCell className="font-medium">{medicamento.nome}</TableCell>
                    <TableCell>{medicamento.categoria.nome}</TableCell>
                    <TableCell>{formatCurrency(medicamento.preco)}</TableCell>
                    <TableCell>{medicamento.quantidadeEstoque}</TableCell>
                    <TableCell>{new Date(medicamento.dataValidade).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                          medicamento.ativo
                            ? 'bg-drogaria-secondary-light text-drogaria-secondary-dark border border-drogaria-secondary'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                          {medicamento.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <TableActions
                        onEdit={() => navigate(`/medicamentos/editar/${medicamento.id}`)}
                        onHistory={() => navigate(`/medicamentos/historico/${medicamento.id}`)}
                        onToggle={() => setToggleId(medicamento.id)}
                        onDelete={() => setDeleteId(medicamento.id)}
                        isActive={medicamento.ativo}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {medicamentos.map((medicamento) => (
              <div
                key={medicamento.id}
                className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium">#{medicamento.id}</span>
                    <p className="text-base font-semibold text-[var(--text-primary)] mt-1">{medicamento.nome}</p>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ml-2 ${
                      medicamento.ativo
                        ? 'bg-drogaria-secondary-light dark:bg-emerald-900/30 text-drogaria-secondary-dark dark:text-emerald-300 border border-drogaria-secondary dark:border-emerald-600'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                    }`}
                  >
                    {medicamento.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Categoria</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{medicamento.categoria.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Preço</p>
                    <p className="text-sm text-[var(--text-primary)] font-bold">{formatCurrency(medicamento.preco)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Estoque</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{medicamento.quantidadeEstoque}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Validade</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {new Date(medicamento.dataValidade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[var(--border-primary)] flex justify-end">
                  <TableActions
                    onEdit={() => navigate(`/medicamentos/editar/${medicamento.id}`)}
                    onHistory={() => navigate(`/medicamentos/historico/${medicamento.id}`)}
                    onToggle={() => setToggleId(medicamento.id)}
                    onDelete={() => setDeleteId(medicamento.id)}
                    isActive={medicamento.ativo}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            const medicamento = medicamentos.find((m) => m.id === deleteId)
            if (medicamento) {
              handleDelete(medicamento.id)
            }
          }
        }}
        title="Excluir Medicamento"
        message="Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />

      <ConfirmModal
        isOpen={toggleId !== null}
        onClose={() => setToggleId(null)}
        onConfirm={() => {
          if (toggleId) {
            const medicamento = medicamentos.find((m) => m.id === toggleId)
            if (medicamento) {
              handleToggleStatus(medicamento.id, medicamento.ativo)
            }
          }
        }}
        title={toggleId ? (medicamentos.find((m) => m.id === toggleId)?.ativo ? 'Inativar' : 'Ativar') + ' Medicamento' : ''}
        message={
          toggleId
            ? `Tem certeza que deseja ${medicamentos.find((m) => m.id === toggleId)?.ativo ? 'inativar' : 'ativar'} este medicamento?`
            : ''
        }
        confirmText="Confirmar"
        variant="primary"
      />
    </div>
  )
}

