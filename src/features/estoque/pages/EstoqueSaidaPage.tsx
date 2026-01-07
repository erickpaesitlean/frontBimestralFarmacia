import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Package, ArrowUpRight, FileText } from 'lucide-react'
import { estoqueService } from '../api/estoqueService'
import { medicamentoService } from '@/features/medicamentos/api/medicamentoService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection, FormFooter } from '@/components/ui/FormCard'
import { FormField } from '@/components/ui/FormField'
import { cn } from '@/lib/utils'

const saidaSchema = z.object({
  medicamentoId: z.number().min(1, 'Medicamento é obrigatório'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  motivo: z.string().min(1, 'Motivo é obrigatório'),
})

type SaidaFormData = z.infer<typeof saidaSchema>

export function EstoqueSaidaPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [medicamentos, setMedicamentos] = useState<Array<{ id: number; nome: string }>>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SaidaFormData>({
    resolver: zodResolver(saidaSchema),
  })

  useEffect(() => {
    loadMedicamentos()
  }, [])

  async function loadMedicamentos() {
    try {
      const data = await medicamentoService.listar()
      setMedicamentos(data.map((m) => ({ id: m.id, nome: m.nome })))
    } catch (error) {
      showToast('error', 'Erro ao carregar medicamentos')
    }
  }

  async function onSubmit(data: SaidaFormData) {
    try {
      await estoqueService.registrarSaida(data)
      showToast('success', 'Saída de estoque registrada com sucesso!')
      reset()
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg: any) => {
            showToast('error', String(msg))
          })
        } else {
          showToast('error', errorData.message || 'Erro ao registrar saída')
        }
      } else {
        showToast('error', 'Erro ao registrar saída de estoque')
      }
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/estoque')} className="gap-2">
        <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
        Voltar
      </Button>

      <FormCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
            title="Registrar Saída"
            description="Preencha os dados abaixo para remover medicamentos do estoque"
          />

          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Medicamento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none stroke-[1.75]" />
                  <select
                    {...register('medicamentoId', { valueAsNumber: true })}
                    className={cn(
                      'w-full pl-11 pr-4 py-2.5',
                      'bg-white border border-slate-300 rounded-xl',
                      'text-slate-900',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                      'transition-all duration-200',
                      errors.medicamentoId && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                    )}
                  >
                    <option value="">Selecione um medicamento</option>
                    {medicamentos.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.nome}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.medicamentoId && (
                  <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.medicamentoId.message}</p>
                )}
              </div>

              <FormField
                label="Quantidade"
                type="number"
                min="1"
                icon={ArrowUpRight}
                {...register('quantidade', { valueAsNumber: true })}
                error={errors.quantidade?.message}
                placeholder="Ex: 10"
                required
                helperText="Quantidade de unidades a remover"
              />
            </div>

            <FormField
              as="textarea"
              label="Motivo"
              icon={FileText}
              {...register('motivo')}
              error={errors.motivo?.message}
              placeholder="Ex: Ajuste de inventário"
              required
              helperText="Descreva o motivo da saída de estoque"
              rows={3}
            />
          </FormSection>

          <FormFooter>
            <Button type="button" variant="ghost" onClick={() => navigate('/estoque')} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              Registrar Saída
            </Button>
          </FormFooter>
        </form>
      </FormCard>
    </div>
  )
}
