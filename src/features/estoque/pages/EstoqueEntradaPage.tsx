import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Package, ArrowDownLeft, FileText, Check, X } from 'lucide-react'
import { estoqueService } from '../api/estoqueService'
import { medicamentoService } from '@/features/medicamentos/api/medicamentoService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection, FormFooter } from '@/components/ui/FormCard'
import { FormField } from '@/components/ui/FormField'
import { cn } from '@/lib/utils'

const entradaSchema = z.object({
  medicamentoId: z.number().min(1, 'Medicamento é obrigatório'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  motivo: z.string().min(1, 'Motivo é obrigatório'),
})

type EntradaFormData = z.infer<typeof entradaSchema>

export function EstoqueEntradaPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [medicamentos, setMedicamentos] = useState<Array<{ id: number; nome: string }>>([])
  const [medicamentoBusca, setMedicamentoBusca] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [sugestaoAtiva, setSugestaoAtiva] = useState(0)
  const medicamentoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    clearErrors,
    reset,
  } = useForm<EntradaFormData>({
    resolver: zodResolver(entradaSchema),
    defaultValues: {
      medicamentoId: 0,
      quantidade: 1,
      motivo: '',
    },
  })

  const medicamentoIdValue = watch('medicamentoId')

  useEffect(() => {
    loadMedicamentos()
  }, [])

  const medicamentosFiltrados = useMemo(() => {
    const q = medicamentoBusca.trim().toLowerCase()
    if (!q) return []
    return medicamentos.filter((m) => m.nome.toLowerCase().includes(q))
  }, [medicamentoBusca, medicamentos])

  // Prefill do texto quando já existe medicamentoId no form
  useEffect(() => {
    if (!medicamentoIdValue) return
    const med = medicamentos.find((m) => m.id === medicamentoIdValue)
    if (med && medicamentoBusca !== med.nome) {
      setMedicamentoBusca(med.nome)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicamentoIdValue, medicamentos])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.medicamento-autocomplete-container')) {
        setMostrarSugestoes(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadMedicamentos() {
    try {
      const data = await medicamentoService.listar()
      setMedicamentos(data.map((m) => ({ id: m.id, nome: m.nome })))
    } catch (error) {
      showToast('error', 'Erro ao carregar medicamentos')
    }
  }

  function handleSelecionarMedicamento(med: { id: number; nome: string }) {
    setValue('medicamentoId', med.id, { shouldDirty: true, shouldValidate: true })
    setMedicamentoBusca(med.nome)
    setMostrarSugestoes(false)
    setSugestaoAtiva(0)
    clearErrors('medicamentoId')
  }

  function handleLimparMedicamento() {
    setValue('medicamentoId', 0, { shouldDirty: true, shouldValidate: true })
    setMedicamentoBusca('')
    setMostrarSugestoes(false)
    setSugestaoAtiva(0)
    medicamentoInputRef.current?.focus()
  }

  function handleMedicamentoKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrarSugestoes) {
      if (e.key === 'Enter' && medicamentosFiltrados.length === 1) {
        e.preventDefault()
        handleSelecionarMedicamento(medicamentosFiltrados[0])
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSugestaoAtiva((prev) => Math.min(prev + 1, Math.max(medicamentosFiltrados.length - 1, 0)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSugestaoAtiva((prev) => Math.max(prev - 1, 0))
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setMostrarSugestoes(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const med = medicamentosFiltrados[sugestaoAtiva]
      if (med) handleSelecionarMedicamento(med)
    }
  }

  async function onSubmit(data: EntradaFormData) {
    try {
      await estoqueService.registrarEntrada(data)
      showToast('success', 'Entrada de estoque registrada com sucesso!')
      reset()
      navigate('/estoque')
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg: any) => {
            showToast('error', String(msg))
          })
        } else {
          showToast('error', errorData.message || 'Erro ao registrar entrada')
        }
      } else {
        showToast('error', 'Erro ao registrar entrada de estoque')
      }
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/estoque')} className="gap-2">
        <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
        Voltar
      </Button>

      <FormCard allowOverflow>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
            title="Registrar Entrada"
            description="Preencha os dados abaixo para adicionar medicamentos ao estoque"
          />

          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="medicamento-autocomplete-container relative">
                <label className="block text-small font-medium text-[var(--text-primary)] mb-2">
                  Medicamento <span className="text-red-500">*</span>
                </label>
                <input type="hidden" {...register('medicamentoId', { valueAsNumber: true })} />

                <div className="relative z-10">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75] z-10" />
                  <input
                    ref={medicamentoInputRef}
                    type="text"
                    value={medicamentoBusca}
                    onChange={(e) => {
                      const v = e.target.value
                      setMedicamentoBusca(v)
                      setMostrarSugestoes(v.trim().length > 0)
                      setSugestaoAtiva(0)
                      setValue('medicamentoId', 0, { shouldDirty: true, shouldValidate: true })
                    }}
                    onKeyDown={handleMedicamentoKeyDown}
                    onFocus={() => {
                      if (medicamentoBusca.trim().length > 0) setMostrarSugestoes(true)
                    }}
                    placeholder="Digite o nome do medicamento"
                    className={cn(
                      'w-full pl-11 pr-10 py-2.5',
                      'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl',
                      'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                      'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                      'transition-all duration-200',
                      errors.medicamentoId && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                    )}
                  />
                  {medicamentoIdValue ? (
                    <button
                      type="button"
                      onClick={handleLimparMedicamento}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors z-10"
                      title="Limpar seleção"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>
                  ) : null}
                </div>

                <AnimatePresence>
                  {mostrarSugestoes && medicamentoBusca.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 z-[100] mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                    >
                      {medicamentosFiltrados.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum medicamento encontrado.</div>
                      ) : (
                        medicamentosFiltrados.map((med, idx) => (
                          <button
                            key={med.id}
                            type="button"
                            onClick={() => handleSelecionarMedicamento(med)}
                            className={cn(
                              'w-full px-4 py-3 text-left transition-colors border-b border-[var(--border-primary)] last:border-b-0 first:rounded-t-xl last:rounded-b-xl',
                              idx === sugestaoAtiva ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{med.nome}</p>
                              {idx === sugestaoAtiva ? (
                                <Check className="w-4 h-4 text-green-500 stroke-[2] flex-shrink-0" />
                              ) : null}
                            </div>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.medicamentoId && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{errors.medicamentoId.message}</p>
                )}
              </div>

              <FormField
                label="Quantidade"
                type="number"
                min="1"
                icon={ArrowDownLeft}
                {...register('quantidade', { valueAsNumber: true })}
                error={errors.quantidade?.message}
                placeholder="Ex: 50"
                required
                helperText="Quantidade de unidades a adicionar"
              />
            </div>

            <FormField
              as="textarea"
              label="Motivo"
              icon={FileText}
              {...register('motivo')}
              error={errors.motivo?.message}
              placeholder="Ex: Reposição do fornecedor"
              required
              helperText="Descreva o motivo da entrada de estoque"
              rows={3}
            />
          </FormSection>

          <FormFooter>
            <Button type="button" variant="ghost" onClick={() => navigate('/estoque')} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              Registrar Entrada
            </Button>
          </FormFooter>
        </form>
      </FormCard>
    </div>
  )
}
