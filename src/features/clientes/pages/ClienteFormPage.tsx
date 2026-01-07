import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, CreditCard, Mail, Calendar } from 'lucide-react'
import { clienteService } from '../api/clienteService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection, FormFooter } from '@/components/ui/FormCard'
import { FormField } from '@/components/ui/FormField'
import { maskCPF, unmaskCPF } from '@/lib/masks'

const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200, 'Nome deve ter no máximo 200 caracteres'),
  cpf: z.string().refine((val) => unmaskCPF(val).length === 11, 'CPF deve ter 11 dígitos'),
  email: z.string().email('E-mail inválido'),
  dataNascimento: z.string().refine((val) => {
    const date = new Date(val)
    const today = new Date()
    const age = today.getFullYear() - date.getFullYear()
    const monthDiff = today.getMonth() - date.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age
    return actualAge >= 18
  }, 'Cliente deve ter 18 anos ou mais'),
})

type ClienteFormData = z.infer<typeof clienteSchema>

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isEdit = !!id

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  })

  const cpfValue = watch('cpf')

  useEffect(() => {
    if (cpfValue) {
      const masked = maskCPF(cpfValue)
      if (masked !== cpfValue) {
        setValue('cpf', masked, { shouldValidate: false })
      }
    }
  }, [cpfValue, setValue])

  useEffect(() => {
    if (isEdit && id) {
      loadCliente(Number(id))
    }
  }, [isEdit, id])

  async function loadCliente(id: number) {
    try {
      const cliente = await clienteService.buscarPorId(id)
      reset({
        nome: cliente.nome,
        cpf: maskCPF(cliente.cpf),
        email: cliente.email,
        dataNascimento: cliente.dataNascimento,
      })
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast('error', 'Cliente não encontrado')
        navigate('/clientes/listar')
      } else {
        showToast('error', 'Erro ao carregar cliente')
      }
    }
  }

  async function onSubmit(data: ClienteFormData) {
    try {
      const payload = {
        nome: data.nome,
        cpf: unmaskCPF(data.cpf),
        email: data.email,
        dataNascimento: data.dataNascimento,
      }

      if (isEdit && id) {
        await clienteService.atualizar(Number(id), payload)
        showToast('success', 'Cliente atualizado com sucesso!')
      } else {
        await clienteService.criar(payload)
        showToast('success', 'Cliente criado com sucesso!')
      }
      navigate('/clientes/listar')
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg: any) => {
            showToast('error', String(msg))
          })
        } else {
          showToast('error', errorData.message || 'Erro ao salvar cliente')
        }
      } else {
        showToast('error', 'Erro ao salvar cliente')
      }
    }
  }

  return (
    <FormCard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          description={
            isEdit
              ? 'Atualize os dados do cliente'
              : 'Preencha os dados abaixo para cadastrar um novo cliente (mínimo 18 anos)'
          }
        />

        <FormSection title="Dados Pessoais">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Nome Completo"
              icon={User}
              {...register('nome')}
              error={errors.nome?.message}
              placeholder="Ex: João Silva"
              required
              helperText="Nome completo do cliente (3-200 caracteres)"
            />

            <FormField
              label="CPF"
              icon={CreditCard}
              {...register('cpf')}
              error={errors.cpf?.message}
              placeholder="000.000.000-00"
              maxLength={14}
              required
              helperText="CPF com 11 dígitos numéricos"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="E-mail"
              type="email"
              icon={Mail}
              {...register('email')}
              error={errors.email?.message}
              placeholder="exemplo@email.com"
              required
              helperText="E-mail válido e único"
            />

            <FormField
              label="Data de Nascimento"
              type="date"
              icon={Calendar}
              {...register('dataNascimento')}
              error={errors.dataNascimento?.message}
              required
              helperText="Cliente deve ter 18 anos ou mais"
            />
          </div>
        </FormSection>

        <FormFooter>
          <Button type="button" variant="ghost" onClick={() => navigate('/clientes/listar')} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            {isEdit ? 'Atualizar Cliente' : 'Criar Cliente'}
          </Button>
        </FormFooter>
      </form>
    </FormCard>
  )
}
