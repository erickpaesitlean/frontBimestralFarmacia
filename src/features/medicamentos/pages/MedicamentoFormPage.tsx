import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Pill, FileText, Layers, DollarSign, Package, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { medicamentoService, type MedicamentoRequestDTO } from '../api/medicamentoService'
import { categoriaService } from '@/features/categorias/api/categoriaService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection, FormFooter } from '@/components/ui/FormCard'
import { FormField } from '@/components/ui/FormField'
import { cn } from '@/lib/utils'

const medicamentoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200, 'Nome deve ter no máximo 200 caracteres'),
  descricao: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional().or(z.literal('')),
  categoriaId: z.number().min(1, 'Categoria é obrigatória'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  quantidadeEstoque: z.coerce.number().min(0, 'Estoque não pode ser negativo').default(0),
  dataValidade: z.string().refine((val) => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }, 'Data de validade deve ser futura'),
  ativo: z.boolean().optional(),
})

type MedicamentoFormData = z.input<typeof medicamentoSchema>

export function MedicamentoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isEdit = !!id
  const [categorias, setCategorias] = useState<Array<{ id: number; nome: string }>>([])
  const [categoriaBusca, setCategoriaBusca] = useState('')
  const [mostrarSugestoesCategoria, setMostrarSugestoesCategoria] = useState(false)
  const [categoriaSugestaoAtiva, setCategoriaSugestaoAtiva] = useState(0)
  const categoriaInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<MedicamentoFormData>({
    resolver: zodResolver(medicamentoSchema),
    defaultValues: {
      quantidadeEstoque: 0,
      ativo: true,
    },
  })

  const ativoValue = watch('ativo') ?? true
  const categoriaIdValue = watch('categoriaId')

  const categoriasFiltradas = useMemo(() => {
    const query = categoriaBusca.trim().toLowerCase()
    if (!query) return []
    return categorias.filter((c) => c.nome.toLowerCase().includes(query))
  }, [categoriaBusca, categorias])

  useEffect(() => {
    loadCategorias()
    if (isEdit && id) {
      loadMedicamento(Number(id))
    }
  }, [isEdit, id])

  async function loadCategorias() {
    try {
      const data = await categoriaService.listar()
      setCategorias(data.map((c) => ({ id: c.id, nome: c.nome })))
    } catch (error) {
      showToast('error', 'Erro ao carregar categorias')
    }
  }

  // Prefill do autocomplete quando estiver editando (ou quando o valor já existir)
  useEffect(() => {
    if (!categoriaIdValue) return
    const cat = categorias.find((c) => c.id === categoriaIdValue)
    if (cat && categoriaBusca !== cat.nome) {
      setCategoriaBusca(cat.nome)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaIdValue, categorias])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.categoria-autocomplete-container')) {
        setMostrarSugestoesCategoria(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelecionarCategoria(cat: { id: number; nome: string }) {
    setValue('categoriaId', cat.id, { shouldDirty: true, shouldValidate: true })
    setCategoriaBusca(cat.nome)
    setMostrarSugestoesCategoria(false)
  }

  function handleCategoriaKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrarSugestoesCategoria) {
      if (e.key === 'Enter' && categoriasFiltradas.length === 1) {
        e.preventDefault()
        handleSelecionarCategoria(categoriasFiltradas[0])
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCategoriaSugestaoAtiva((prev) => Math.min(prev + 1, Math.max(categoriasFiltradas.length - 1, 0)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCategoriaSugestaoAtiva((prev) => Math.max(prev - 1, 0))
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setMostrarSugestoesCategoria(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const cat = categoriasFiltradas[categoriaSugestaoAtiva]
      if (cat) handleSelecionarCategoria(cat)
    }
  }

  async function loadMedicamento(id: number) {
    try {
      const medicamento = await medicamentoService.buscarPorId(id)
      reset({
        nome: medicamento.nome,
        descricao: medicamento.descricao || '',
        categoriaId: medicamento.categoria.id,
        preco: medicamento.preco,
        quantidadeEstoque: 0, // No PUT, sempre começa com 0 (será uma entrada adicional)
        dataValidade: medicamento.dataValidade,
        ativo: medicamento.ativo ?? true,
      })
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast('error', 'Medicamento não encontrado')
        navigate('/medicamentos/listar')
      } else {
        showToast('error', 'Erro ao carregar medicamento')
      }
    }
  }

  async function onSubmit(data: MedicamentoFormData) {
    try {
      // Garantir que quantidadeEstoque seja sempre um número válido
      const quantidadeEstoque = Number(data.quantidadeEstoque ?? 0)
      const quantidadeEstoqueSafe = Number.isFinite(quantidadeEstoque) ? quantidadeEstoque : 0

      const payload: MedicamentoRequestDTO = {
        nome: data.nome,
        descricao: data.descricao || undefined,
        categoriaId: data.categoriaId,
        preco: data.preco,
        // Na criação, sempre envia um número (0 se não informado). No PUT, só envia se > 0 (entrada adicional)
        quantidadeEstoque: isEdit
          ? quantidadeEstoqueSafe > 0
            ? quantidadeEstoqueSafe
            : undefined
          : quantidadeEstoqueSafe, // Na criação, sempre envia número (0 se não informado)
        dataValidade: data.dataValidade,
        ativo: data.ativo,
      }

      if (isEdit && id) {
        await medicamentoService.atualizar(Number(id), payload)
        showToast('success', 'Medicamento atualizado com sucesso!')
      } else {
        await medicamentoService.criar(payload)
        showToast('success', 'Medicamento criado com sucesso!')
      }
      navigate('/medicamentos/listar')
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg: any) => {
            showToast('error', String(msg))
          })
        } else {
          showToast('error', errorData.message || 'Erro ao salvar medicamento')
        }
      } else {
        showToast('error', 'Erro ao salvar medicamento')
      }
    }
  }

  return (
    <FormCard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          title={isEdit ? 'Editar Medicamento' : 'Novo Medicamento'}
          description={
            isEdit
              ? 'Atualize os dados do medicamento'
              : 'Preencha os dados abaixo para cadastrar um novo medicamento'
          }
        />

        {isEdit && (
          <div className="mx-6 lg:mx-8 mt-4 mb-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0 stroke-[1.75]" />
                <p className="text-sm text-amber-800">
                  <strong>Atenção:</strong> O campo "Quantidade de Estoque" será tratado como uma{' '}
                  <strong>ENTRADA ADICIONAL</strong> ao estoque atual. Use 0 se não quiser adicionar estoque.
                </p>
              </div>
            </div>
          </div>
        )}

        <FormSection title="Informações Básicas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Nome"
              icon={Pill}
              {...register('nome')}
              error={errors.nome?.message}
              placeholder="Ex: Dipirona"
              required
              helperText="Nome único do medicamento (3-200 caracteres)"
            />

            <div className="categoria-autocomplete-container relative">
              <label className="block text-small font-medium text-[var(--text-primary)] mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              {/* Campo escondido para RHF manter categoriaId */}
              <input type="hidden" {...register('categoriaId', { valueAsNumber: true })} />

              <div className="relative z-10">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75] z-10" />
                <input
                  ref={categoriaInputRef}
                  type="text"
                  value={categoriaBusca}
                  onChange={(e) => {
                    const v = e.target.value
                    setCategoriaBusca(v)
                    setMostrarSugestoesCategoria(v.trim().length > 0)
                    setCategoriaSugestaoAtiva(0)
                    // se usuário alterar manualmente, limpa categoriaId até selecionar
                    setValue('categoriaId', 0, { shouldDirty: true, shouldValidate: true })
                  }}
                  onKeyDown={handleCategoriaKeyDown}
                  onFocus={() => {
                    if (categoriaBusca.trim().length > 0) setMostrarSugestoesCategoria(true)
                  }}
                  placeholder="Digite para buscar categoria"
                  className={cn(
                    'w-full pl-11 pr-4 py-2.5',
                    'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                    'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                    'transition-all duration-200',
                    errors.categoriaId && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  )}
                />
              </div>

              <AnimatePresence>
                {mostrarSugestoesCategoria && categoriaBusca.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 z-[100] mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                  >
                    {categoriasFiltradas.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhuma categoria encontrada.</div>
                    ) : (
                      categoriasFiltradas.map((cat, idx) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelecionarCategoria(cat)}
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors border-b border-[var(--border-primary)] last:border-b-0 first:rounded-t-xl last:rounded-b-xl',
                            idx === categoriaSugestaoAtiva ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'
                          )}
                        >
                          <p className="text-sm font-medium text-[var(--text-primary)]">{cat.nome}</p>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {errors.categoriaId && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{errors.categoriaId.message}</p>
              )}
            </div>
          </div>

          <FormField
            as="textarea"
            label="Descrição"
            icon={FileText}
            {...register('descricao')}
            error={errors.descricao?.message}
            placeholder="Descrição do medicamento (opcional)"
            helperText="Informações adicionais sobre o medicamento"
            rows={4}
          />
        </FormSection>

        <FormSection title="Preço e Estoque">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Preço"
              type="number"
              step="0.01"
              min="0.01"
              icon={DollarSign}
              {...register('preco', { valueAsNumber: true })}
              error={errors.preco?.message}
              placeholder="0.00"
              required
              helperText="Preço unitário do medicamento"
            />

            <FormField
              label={isEdit ? 'Quantidade de Estoque (Entrada Adicional)' : 'Quantidade de Estoque Inicial'}
              type="number"
              min="0"
              icon={Package}
              defaultValue={0}
              {...register('quantidadeEstoque', { valueAsNumber: true })}
              error={errors.quantidadeEstoque?.message}
              placeholder="0"
              helperText={
                isEdit
                  ? 'Quantidade adicional a adicionar ao estoque atual'
                  : 'Estoque inicial (padrão: 0). Você pode adicionar depois via entrada de estoque.'
              }
            />
          </div>
        </FormSection>

        <FormSection title="Validade e Status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Data de Validade"
              type="date"
              icon={Calendar}
              {...register('dataValidade')}
              error={errors.dataValidade?.message}
              required
              helperText="Data de validade deve ser futura"
            />

            <div>
              <label className="block text-small font-medium text-[var(--text-primary)] mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Status do medicamento</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {ativoValue ? 'Ativo (aparece para venda)' : 'Inativo (não aparece para venda)'}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                      ativoValue
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    )}
                  >
                    {ativoValue ? (
                      <CheckCircle className="w-3.5 h-3.5 stroke-[2]" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 stroke-[2]" />
                    )}
                    {ativoValue ? 'Ativo' : 'Inativo'}
                  </span>

                  <label htmlFor="ativo" className="relative inline-flex items-center cursor-pointer select-none">
                    <input id="ativo" type="checkbox" {...register('ativo')} className="sr-only peer" />
                    <span
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full border transition-colors',
                        'bg-[var(--bg-secondary)] border-[var(--border-primary)]',
                        'peer-checked:bg-drogaria-accent dark:peer-checked:bg-[var(--drogaria-accent)]',
                        'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-drogaria-accent/30',
                        'peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--bg-secondary)]'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-5 w-5 transform rounded-full transition-transform shadow-drogaria',
                          'bg-white dark:bg-[var(--bg-secondary)]',
                          ativoValue ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                      />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <FormFooter>
          <Button type="button" variant="ghost" onClick={() => navigate('/medicamentos/listar')} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            {isEdit ? 'Atualizar Medicamento' : 'Criar Medicamento'}
          </Button>
        </FormFooter>
      </form>
    </FormCard>
  )
}
