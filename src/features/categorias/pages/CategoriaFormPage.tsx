import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText } from 'lucide-react'
import { categoriaService, type CategoriaResponseDTO } from '../api/categoriaService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection, FormFooter } from '@/components/ui/FormCard'
import { FormField } from '@/components/ui/FormField'

const categoriaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional().or(z.literal('')),
})

type CategoriaFormData = z.infer<typeof categoriaSchema>

export function CategoriaFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isEdit = !!id

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
  })

  useEffect(() => {
    if (isEdit && id) {
      loadCategoria(Number(id))
    }
  }, [isEdit, id])

  async function loadCategoria(id: number) {
    try {
      const categoria = await categoriaService.buscarPorId(id)
      reset({
        nome: categoria.nome,
        descricao: categoria.descricao || '',
      })
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast('error', 'Categoria não encontrada')
        navigate('/categorias/listar')
      } else {
        showToast('error', 'Erro ao carregar categoria')
      }
    }
  }

  async function onSubmit(data: CategoriaFormData) {
    try {
      if (isEdit && id) {
        await categoriaService.atualizar(Number(id), {
          nome: data.nome,
          descricao: data.descricao || undefined,
        })
        showToast('success', 'Categoria atualizada com sucesso!')
      } else {
        await categoriaService.criar({
          nome: data.nome,
          descricao: data.descricao || undefined,
        })
        showToast('success', 'Categoria criada com sucesso!')
      }
      navigate('/categorias/listar')
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg: any) => {
            showToast('error', String(msg))
          })
        } else {
          showToast('error', errorData.message || 'Erro ao salvar categoria')
        }
      } else {
        showToast('error', 'Erro ao salvar categoria')
      }
    }
  }

  return (
    <FormCard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          title={isEdit ? 'Editar Categoria' : 'Nova Categoria'}
          description={isEdit ? 'Atualize os dados da categoria' : 'Preencha os dados abaixo para criar uma nova categoria'}
        />

        <FormSection>
          <FormField
            label="Nome"
            icon={FileText}
            {...register('nome')}
            error={errors.nome?.message}
            placeholder="Ex: Analgésicos"
            required
            helperText="Nome único da categoria (3-100 caracteres)"
          />

          <FormField
            as="textarea"
            label="Descrição"
            {...register('descricao')}
            error={errors.descricao?.message}
            placeholder="Descrição da categoria (opcional)"
            helperText="Informações adicionais sobre a categoria"
            rows={4}
          />
        </FormSection>

        <FormFooter>
          <Button type="button" variant="ghost" onClick={() => navigate('/categorias/listar')} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            {isEdit ? 'Atualizar' : 'Criar Categoria'}
          </Button>
        </FormFooter>
      </form>
    </FormCard>
  )
}
