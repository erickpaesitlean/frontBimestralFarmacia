import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Pill, Plus, Trash2, ShoppingCart, DollarSign } from 'lucide-react'
import { vendaService } from '../api/vendaService'
import { clienteService } from '@/features/clientes/api/clienteService'
import { medicamentoService } from '@/features/medicamentos/api/medicamentoService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection, FormFooter } from '@/components/ui/FormCard'
import { FormField } from '@/components/ui/FormField'
import { formatCurrency } from '@/lib/masks'
import { cn } from '@/lib/utils'

const itemSchema = z.object({
  medicamentoId: z.number().min(1, 'Medicamento é obrigatório'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
})

const vendaSchema = z
  .object({
    clienteId: z.number().min(1, 'Cliente é obrigatório'),
    itens: z.array(itemSchema).min(1, 'A venda deve conter pelo menos um item'),
  })
  .refine(
    (data) => {
      const medicamentosIds = data.itens.map((item) => item.medicamentoId)
      const medicamentosUnicos = new Set(medicamentosIds)
      return medicamentosIds.length === medicamentosUnicos.size
    },
    {
      message: 'Não é permitido adicionar o mesmo medicamento mais de uma vez na venda',
      path: ['itens'],
    }
  )

type VendaFormData = z.infer<typeof vendaSchema>

export function VendaFormPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [clientes, setClientes] = useState<Array<{ id: number; nome: string }>>([])
  const [medicamentos, setMedicamentos] = useState<
    Array<{ id: number; nome: string; preco: number; quantidadeEstoque: number }>
  >([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteId: 0,
      itens: [{ medicamentoId: 0, quantidade: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'itens',
  })

  const itens = watch('itens')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [clientesData, medicamentosData] = await Promise.all([
        clienteService.listar(),
        medicamentoService.listar(),
      ])
      setClientes(clientesData.map((c) => ({ id: c.id, nome: c.nome })))
      setMedicamentos(
        medicamentosData
          .filter((m) => m.ativo && new Date(m.dataValidade) > new Date())
          .map((m) => ({ id: m.id, nome: m.nome, preco: m.preco, quantidadeEstoque: m.quantidadeEstoque }))
      )
    } catch (error) {
      showToast('error', 'Erro ao carregar dados')
    }
  }

  async function onSubmit(data: VendaFormData) {
    try {
      await vendaService.criar(data)
      showToast('success', 'Venda registrada com sucesso!')
      navigate('/vendas/listar')
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg: any) => {
            showToast('error', String(msg))
          })
        } else {
          showToast('error', errorData.message || 'Erro ao registrar venda')
        }
      } else {
        showToast('error', 'Erro ao registrar venda')
      }
    }
  }

  function calcularTotal() {
    return itens.reduce((total, item) => {
      const medicamento = medicamentos.find((m) => m.id === item.medicamentoId)
      if (medicamento) {
        return total + medicamento.preco * item.quantidade
      }
      return total
    }, 0)
  }

  // Obter medicamentos já selecionados em outros itens
  function getMedicamentosSelecionados(currentIndex: number): number[] {
    return itens
      .map((item, index) => (index !== currentIndex && item.medicamentoId > 0 ? item.medicamentoId : null))
      .filter((id): id is number => id !== null)
  }

  function handleAdicionarItem() {
    const medicamentosSelecionados = getMedicamentosSelecionados(-1)
    const medicamentosDisponiveis = medicamentos.filter((m) => !medicamentosSelecionados.includes(m.id))

    if (medicamentosDisponiveis.length === 0) {
      showToast('warning', 'Todos os medicamentos disponíveis já foram adicionados à venda')
      return
    }

    append({ medicamentoId: 0, quantidade: 1 })
  }

  return (
    <FormCard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          title="Nova Venda"
          description="Preencha os dados abaixo para registrar uma nova venda"
        />

        <FormSection title="Cliente">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none stroke-[1.75]" />
              <select
                {...register('clienteId', { valueAsNumber: true })}
                className={cn(
                  'w-full pl-11 pr-4 py-2.5',
                  'bg-white border border-slate-300 rounded-xl',
                  'text-slate-900',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                  'transition-all duration-200',
                  errors.clienteId && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                )}
              >
                <option value="0">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
            {errors.clienteId && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.clienteId.message}</p>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Itens da Venda"
          description="Adicione os medicamentos que serão vendidos"
        >
          <div className="space-y-4">
            <AnimatePresence>
              {fields.map((field, index) => {
                const medicamentoId = itens[index]?.medicamentoId
                const medicamento = medicamentos.find((m) => m.id === medicamentoId)
                const subtotal = medicamento ? medicamento.preco * (itens[index]?.quantidade || 0) : 0

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-700">Item {index + 1}</h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                          Remover
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Medicamento <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none stroke-[1.75]" />
                          <select
                            {...register(`itens.${index}.medicamentoId`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                const novoMedicamentoId = Number(e.target.value)
                                if (novoMedicamentoId > 0) {
                                  const medicamentosSelecionados = getMedicamentosSelecionados(index)
                                  if (medicamentosSelecionados.includes(novoMedicamentoId)) {
                                    showToast('error', 'Este medicamento já foi adicionado à venda')
                                    setValue(`itens.${index}.medicamentoId`, 0)
                                    setError(`itens.${index}.medicamentoId`, {
                                      type: 'manual',
                                      message: 'Este medicamento já foi adicionado',
                                    })
                                    return
                                  }
                                  clearErrors(`itens.${index}.medicamentoId`)
                                }
                              },
                            })}
                            className={cn(
                              'w-full pl-11 pr-4 py-2.5',
                              'bg-white border border-slate-300 rounded-xl',
                              'text-slate-900',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                              'transition-all duration-200',
                              errors.itens?.[index]?.medicamentoId &&
                                'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                            )}
                          >
                            <option value="0">Selecione um medicamento</option>
                            {medicamentos
                              .filter((med) => {
                                // Filtrar medicamentos já selecionados em outros itens
                                const medicamentosSelecionados = getMedicamentosSelecionados(index)
                                return !medicamentosSelecionados.includes(med.id) || med.id === medicamentoId
                              })
                              .map((med) => (
                                <option key={med.id} value={med.id}>
                                  {med.nome} - Estoque: {med.quantidadeEstoque} - {formatCurrency(med.preco)}
                                </option>
                              ))}
                          </select>
                        </div>
                        {errors.itens?.[index]?.medicamentoId && (
                          <p className="mt-1.5 text-sm text-red-600 font-medium">
                            {errors.itens[index]?.medicamentoId?.message}
                          </p>
                        )}
                      </div>

                      <FormField
                        label="Quantidade"
                        type="number"
                        min="1"
                        max={medicamento?.quantidadeEstoque || undefined}
                        {...register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                        error={errors.itens?.[index]?.quantidade?.message}
                        placeholder="1"
                        required
                        helperText={
                          medicamento
                            ? `Estoque disponível: ${medicamento.quantidadeEstoque} unidades`
                            : 'Selecione um medicamento primeiro'
                        }
                      />
                    </div>

                    {medicamento && (
                      <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Subtotal:</span>
                          <span className="text-base font-semibold text-slate-900">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAdicionarItem}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4 stroke-[1.75]" />
                Adicionar Item
              </Button>
            </motion.div>

            {errors.itens && typeof errors.itens.message === 'string' && (
              <p className="text-sm text-red-600 font-medium">{errors.itens.message}</p>
            )}
          </div>
        </FormSection>

        <div className="px-6 lg:px-8 py-5 border-t border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-600 stroke-[1.75]" />
              <span className="text-lg font-semibold text-slate-900">Total da Venda:</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(calcularTotal())}
            </span>
          </div>
        </div>

        <FormFooter>
          <Button type="button" variant="ghost" onClick={() => navigate('/vendas/listar')} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            <DollarSign className="w-4 h-4 mr-2 stroke-[1.75]" />
            Registrar Venda
          </Button>
        </FormFooter>
      </form>
    </FormCard>
  )
}
