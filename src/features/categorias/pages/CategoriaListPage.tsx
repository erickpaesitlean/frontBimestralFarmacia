import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Layers } from 'lucide-react'
import { categoriaService, type CategoriaResponseDTO } from '../api/categoriaService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/Modal'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/Table'

export function CategoriaListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    loadCategorias()
  }, [])

  async function loadCategorias() {
    try {
      setIsLoading(true)
      const data = await categoriaService.listar()
      setCategorias(data)
    } catch (error: any) {
      showToast('error', 'Erro ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await categoriaService.excluir(id)
      showToast('success', 'Categoria excluída com sucesso!')
      loadCategorias()
      setDeleteId(null)
    } catch (error: any) {
      if (error.response?.status === 400) {
        showToast(
          'error',
          error.response.data.message || 'Não é possível excluir categoria com medicamentos vinculados'
        )
      } else {
        showToast('error', 'Erro ao excluir categoria')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-drogaria-primary dark:border-[var(--drogaria-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] font-medium">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 text-drogaria-primary dark:text-[var(--drogaria-primary)] mb-2">Categorias</h1>
          <p className="text-body text-[var(--text-secondary)]">Gerencie as categorias de medicamentos</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => navigate('/categorias/criar')} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2 stroke-[1.75]" />
            Nova Categoria
          </Button>
        </motion.div>
      </div>

      {/* Table */}
      {categorias.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)] p-12 text-center"
        >
          <Layers className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 stroke-[1.75]" />
          <p className="text-[var(--text-secondary)] mb-4 font-medium">Nenhuma categoria cadastrada</p>
          <Button onClick={() => navigate('/categorias/criar')}>
            <Plus className="w-4 h-4 mr-2 stroke-[1.75]" />
            Criar primeira categoria
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((categoria, index) => (
                  <motion.tr
                    key={categoria.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-150"
                  >
                    <TableCell className="font-mono text-[var(--text-tertiary)]">{categoria.id}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-[var(--text-primary)]">{categoria.nome}</span>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">
                      {categoria.descricao || <span className="text-[var(--text-tertiary)]">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/categorias/editar/${categoria.id}`)}
                          className="gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5 stroke-[1.75]" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteId(categoria.id)}
                          className="gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {categorias.map((categoria, index) => (
              <motion.div
                key={categoria.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium">#{categoria.id}</span>
                    <p className="text-base font-semibold text-[var(--text-primary)] mt-1">{categoria.nome}</p>
                  </div>
                </div>

                {/* Description */}
                {categoria.descricao && (
                  <div className="mb-3">
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Descrição</p>
                    <p className="text-sm text-[var(--text-secondary)]">{categoria.descricao}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-[var(--border-primary)] flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/categorias/editar/${categoria.id}`)}
                    className="flex-1 gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5 stroke-[1.75]" />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteId(categoria.id)}
                    className="flex-1 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                    Excluir
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Excluir Categoria"
        message="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  )
}
