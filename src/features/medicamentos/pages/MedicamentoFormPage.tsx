import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pill, FileText, Layers, DollarSign, Package, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'
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

type MedicamentoFormData = z.infer<typeof medicamentoSchema>

export function MedicamentoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isEdit = !!id
  const [categorias, setCategorias] = useState<Array<{ id: number; nome: string }>>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<MedicamentoFormData>({
    resolver: zodResolver(medicamentoSchema),
  })

  const precoValue = watch('preco')

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
        ativo: medicamento.ativo,
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
      const quantidadeEstoque =
        Number.isNaN(data.quantidadeEstoque) || data.quantidadeEstoque === undefined ? 0 : data.quantidadeEstoque

      const payload: MedicamentoRequestDTO = {
        nome: data.nome,
        descricao: data.descricao || undefined,
        categoriaId: data.categoriaId,
        preco: data.preco,
        // Na criação, sempre envia um número (0 se não informado). No PUT, só envia se > 0 (entrada adicional)
        quantidadeEstoque: isEdit
          ? quantidadeEstoque > 0
            ? quantidadeEstoque
            : undefined
          : quantidadeEstoque, // Na criação, sempre envia número (0 se não informado)
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

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75]" />
                <select
                  {...register('categoriaId', { valueAsNumber: true })}
                  className={cn(
                    'w-full pl-11 pr-4 py-2.5',
                    'bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl',
                    'text-[var(--text-primary)]',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                    'transition-all duration-200',
                    errors.categoriaId && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  )}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>
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

            <div className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                id="ativo"
                {...register('ativo')}
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-400 stroke-[1.75]" />
                Medicamento ativo
              </label>
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
