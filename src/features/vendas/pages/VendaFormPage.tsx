import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Pill, Plus, Trash2, ShoppingCart, DollarSign, Check, X, Loader2 } from 'lucide-react'
import { vendaService } from '../api/vendaService'
import { clienteService, type ClienteResponseDTO } from '@/features/clientes/api/clienteService'
import { medicamentoService } from '@/features/medicamentos/api/medicamentoService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FormCard, FormHeader, FormSection, FormFooter } from '@/components/ui/FormCard'
import { FormField } from '@/components/ui/FormField'
import { formatCurrency, maskCPF, unmaskCPF } from '@/lib/masks'
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
  const [clientes, setClientes] = useState<ClienteResponseDTO[]>([])
  const [medicamentos, setMedicamentos] = useState<
    Array<{ id: number; nome: string; preco: number; quantidadeEstoque: number }>
  >([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [cpfBusca, setCpfBusca] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResponseDTO | null>(null)
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [clientesFiltrados, setClientesFiltrados] = useState<ClienteResponseDTO[]>([])
  const [cpfSugestaoAtiva, setCpfSugestaoAtiva] = useState(0)
  const cpfInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para autocomplete de medicamentos
  const [medicamentoBuscas, setMedicamentoBuscas] = useState<Record<number, string>>({})
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState<Record<number, typeof medicamentos[0] | null>>({})
  const [mostrarSugestoesMed, setMostrarSugestoesMed] = useState<Record<number, boolean>>({})
  const [medicamentosFiltrados, setMedicamentosFiltrados] = useState<Record<number, typeof medicamentos>>({})
  const [medSugestaoAtiva, setMedSugestaoAtiva] = useState<Record<number, number>>({})
  const medicamentoInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setFocus,
    setValue,
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
      setIsLoadingData(true)
      const [clientesData, medicamentosData] = await Promise.all([
        clienteService.listar(),
        medicamentoService.listar(),
      ])
      setClientes(clientesData)
      setMedicamentos(
        medicamentosData
          .filter((m) => m.ativo && new Date(m.dataValidade) > new Date())
          .map((m) => ({ id: m.id, nome: m.nome, preco: m.preco, quantidadeEstoque: m.quantidadeEstoque }))
      )
    } catch (error) {
      showToast('error', 'Erro ao carregar dados')
    } finally {
      setIsLoadingData(false)
    }
  }

  // Autofocus no CPF (fluxo rápido de PDV)
  useEffect(() => {
    cpfInputRef.current?.focus()
  }, [])

  function handleCpfChange(value: string) {
    const maskedValue = maskCPF(value)
    setCpfBusca(maskedValue)
    
    // Se limpar o campo, resetar cliente selecionado
    if (value === '') {
      setClienteSelecionado(null)
      setValue('clienteId', 0)
      setClientesFiltrados([])
      setMostrarSugestoes(false)
      return
    }

    // Filtrar clientes pelo CPF
    const cpfDigitado = unmaskCPF(maskedValue)
    const filtrados = clientes.filter(cliente => 
      unmaskCPF(cliente.cpf).includes(cpfDigitado)
    )
    
    setClientesFiltrados(filtrados)
    // Mostrar lista (mesmo vazia) para reduzir esforço cognitivo (feedback imediato)
    setMostrarSugestoes(!clienteSelecionado && cpfDigitado.length > 0)
    setCpfSugestaoAtiva(0)
  }

  function handleSelecionarCliente(cliente: ClienteResponseDTO) {
    setClienteSelecionado(cliente)
    setCpfBusca(maskCPF(cliente.cpf))
    setValue('clienteId', cliente.id)
    setMostrarSugestoes(false)
    clearErrors('clienteId')

    // Próximo passo natural: focar no 1º medicamento
    requestAnimationFrame(() => {
      medicamentoInputRefs.current[0]?.focus()
    })
  }

  function handleLimparCliente() {
    setClienteSelecionado(null)
    setCpfBusca('')
    setValue('clienteId', 0)
    setClientesFiltrados([])
    setMostrarSugestoes(false)
    cpfInputRef.current?.focus()
  }

  // Funções para autocomplete de medicamentos
  function handleMedicamentoChange(index: number, value: string) {
    setMedicamentoBuscas(prev => ({ ...prev, [index]: value }))
    
    // Se limpar o campo, resetar medicamento selecionado
    if (value === '') {
      setMedicamentosSelecionados(prev => ({ ...prev, [index]: null }))
      setValue(`itens.${index}.medicamentoId`, 0)
      setMedicamentosFiltrados(prev => ({ ...prev, [index]: [] }))
      setMostrarSugestoesMed(prev => ({ ...prev, [index]: false }))
      setMedSugestaoAtiva(prev => ({ ...prev, [index]: 0 }))
      return
    }

    // Filtrar medicamentos pelo nome
    const medicamentosSelecionadosIds = getMedicamentosSelecionados(index)
    const filtrados = medicamentos.filter(med => 
      med.nome.toLowerCase().includes(value.toLowerCase()) &&
      !medicamentosSelecionadosIds.includes(med.id)
    )
    
    setMedicamentosFiltrados(prev => ({ ...prev, [index]: filtrados }))
    setMostrarSugestoesMed(prev => ({ ...prev, [index]: filtrados.length > 0 && !medicamentosSelecionados[index] }))
    setMedSugestaoAtiva(prev => ({ ...prev, [index]: 0 }))
  }

  function handleSelecionarMedicamento(index: number, medicamento: typeof medicamentos[0]) {
    setMedicamentosSelecionados(prev => ({ ...prev, [index]: medicamento }))
    setMedicamentoBuscas(prev => ({ ...prev, [index]: medicamento.nome }))
    setValue(`itens.${index}.medicamentoId`, medicamento.id)
    setMostrarSugestoesMed(prev => ({ ...prev, [index]: false }))
    clearErrors(`itens.${index}.medicamentoId`)

    // Após escolher, ir direto para quantidade
    requestAnimationFrame(() => setFocus(`itens.${index}.quantidade`))
  }

  function handleLimparMedicamento(index: number) {
    setMedicamentosSelecionados(prev => ({ ...prev, [index]: null }))
    setMedicamentoBuscas(prev => ({ ...prev, [index]: '' }))
    setValue(`itens.${index}.medicamentoId`, 0)
    setMedicamentosFiltrados(prev => ({ ...prev, [index]: [] }))
    setMostrarSugestoesMed(prev => ({ ...prev, [index]: false }))
    setMedSugestaoAtiva(prev => ({ ...prev, [index]: 0 }))
    medicamentoInputRefs.current[index]?.focus()
  }

  function handleCpfKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Enter com CPF completo: se tiver match único, seleciona e segue
    if (!mostrarSugestoes) {
      if (e.key === 'Enter') {
        const digits = unmaskCPF(cpfBusca)
        if (digits.length === 11) {
          const matches = clientes.filter((c) => unmaskCPF(c.cpf) === digits)
          if (matches.length === 1) {
            e.preventDefault()
            handleSelecionarCliente(matches[0])
          }
        }
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCpfSugestaoAtiva((prev) => Math.min(prev + 1, Math.max(clientesFiltrados.length - 1, 0)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCpfSugestaoAtiva((prev) => Math.max(prev - 1, 0))
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setMostrarSugestoes(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const cliente = clientesFiltrados[cpfSugestaoAtiva]
      if (cliente) handleSelecionarCliente(cliente)
    }
  }

  function handleMedicamentoKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    const list = medicamentosFiltrados[index] || []
    const open = !!mostrarSugestoesMed[index]
    const active = medSugestaoAtiva[index] || 0

    if (!open) {
      // Se restou 1 opção, Enter seleciona
      if (e.key === 'Enter' && list.length === 1) {
        e.preventDefault()
        handleSelecionarMedicamento(index, list[0])
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMedSugestaoAtiva((prev) => ({ ...prev, [index]: Math.min(active + 1, Math.max(list.length - 1, 0)) }))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMedSugestaoAtiva((prev) => ({ ...prev, [index]: Math.max(active - 1, 0) }))
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setMostrarSugestoesMed((prev) => ({ ...prev, [index]: false }))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const med = list[active]
      if (med) handleSelecionarMedicamento(index, med)
    }
  }

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.cpf-autocomplete-container')) {
        setMostrarSugestoes(false)
      }
      if (!target.closest('.medicamento-autocomplete-container')) {
        setMostrarSugestoesMed({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Evitar useMemo aqui: em alguns cenários o RHF "muta" o array sem trocar a referência,
  // o que faria o total ficar "travado". Calcular direto é barato e confiável.
  const totalVenda = calcularTotal()

  const canSubmit = (() => {
    if (isLoadingData) return false
    if (!clienteSelecionado) return false
    if (!itens?.length) return false

    for (const item of itens) {
      if (!item.medicamentoId || item.medicamentoId <= 0) return false
      if (!item.quantidade || item.quantidade <= 0) return false
      const med = medicamentos.find((m) => m.id === item.medicamentoId)
      if (!med) return false
      if (item.quantidade > med.quantidadeEstoque) return false
    }

    return true
  })()

  // Obter medicamentos já selecionados em outros itens
  function getMedicamentosSelecionados(currentIndex: number): number[] {
    return itens
      .map((item, index) => (index !== currentIndex && item.medicamentoId > 0 ? item.medicamentoId : null))
      .filter((id): id is number => id !== null)
  }

  function handleAdicionarItem() {
    const medicamentosSelecionadosIds = getMedicamentosSelecionados(-1)
    const medicamentosDisponiveis = medicamentos.filter((m) => !medicamentosSelecionadosIds.includes(m.id))

    if (medicamentosDisponiveis.length === 0) {
      showToast('warning', 'Todos os medicamentos disponíveis já foram adicionados à venda')
      return
    }

    const newIndex = fields.length
    append({ medicamentoId: 0, quantidade: 1 })
    
    // Inicializar estados para o novo item
    setMedicamentoBuscas(prev => ({ ...prev, [newIndex]: '' }))
    setMedicamentosSelecionados(prev => ({ ...prev, [newIndex]: null }))
    setMostrarSugestoesMed(prev => ({ ...prev, [newIndex]: false }))
    setMedicamentosFiltrados(prev => ({ ...prev, [newIndex]: [] }))
  }

  return (
    <FormCard allowOverflow>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          title="Nova Venda"
          description="Preencha os dados abaixo para registrar uma nova venda"
        />

        <FormSection title="Cliente">
          <div className="space-y-4">
            <div className="cpf-autocomplete-container relative">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                CPF do Cliente <span className="text-red-500">*</span>
              </label>
              <div className="relative z-20">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75] z-10" />
                <input
                  ref={cpfInputRef}
                  type="text"
                  value={cpfBusca}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  onKeyDown={handleCpfKeyDown}
                  onFocus={() => {
                    if (clientesFiltrados.length >= 0 && !clienteSelecionado && unmaskCPF(cpfBusca).length > 0) {
                      setMostrarSugestoes(true)
                    }
                  }}
                  placeholder={isLoadingData ? 'Carregando clientes...' : 'Digite o CPF do cliente'}
                  maxLength={14}
                  disabled={!!clienteSelecionado || isLoadingData}
                  className={cn(
                    'w-full pl-11 pr-10 py-2.5',
                    'bg-[var(--bg-primary)] dark:bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                    'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                    'transition-all duration-200',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    errors.clienteId && 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  )}
                />
                {isLoadingData && !clienteSelecionado && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] z-10">
                    <Loader2 className="w-4 h-4 animate-spin stroke-[1.75]" />
                  </div>
                )}
                {clienteSelecionado && (
                  <button
                    type="button"
                    onClick={handleLimparCliente}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors z-10"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                )}
              </div>

              {/* Sugestões de Autocomplete */}
              <AnimatePresence>
                {mostrarSugestoes && !isLoadingData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 z-[100] mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                  >
                    {clientesFiltrados.length === 0 && (
                      <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        Nenhum cliente encontrado.
                      </div>
                    )}
                    {clientesFiltrados.map((cliente, idx) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => handleSelecionarCliente(cliente)}
                        className={cn(
                          'w-full px-4 py-3 text-left transition-colors border-b border-[var(--border-primary)] last:border-b-0 first:rounded-t-xl last:rounded-b-xl',
                          idx === cpfSugestaoAtiva ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{cliente.nome}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              CPF: {maskCPF(cliente.cpf)}
                            </p>
                          </div>
                          {idx === cpfSugestaoAtiva ? (
                            <Check className="w-4 h-4 text-green-500 stroke-[2]" />
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {errors.clienteId && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.clienteId.message}</p>
              )}
            </div>

            {/* Informações do Cliente Selecionado */}
            <AnimatePresence>
              {clienteSelecionado && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-white stroke-[2.5]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                        Cliente Selecionado
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-medium">Nome:</span>
                          <p className="text-green-900 dark:text-green-100">{clienteSelecionado.nome}</p>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-medium">CPF:</span>
                          <p className="text-green-900 dark:text-green-100">{maskCPF(clienteSelecionado.cpf)}</p>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-medium">Email:</span>
                          <p className="text-green-900 dark:text-green-100">{clienteSelecionado.email}</p>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-medium">Data Nascimento:</span>
                          <p className="text-green-900 dark:text-green-100">
                            {new Date(clienteSelecionado.dataNascimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                    className={cn(
                      'bg-[var(--bg-tertiary)] border rounded-xl p-5',
                      errors.itens?.[index] ? 'border-red-300 dark:border-red-700' : 'border-[var(--border-primary)]'
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Item {index + 1}</h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                          Remover
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="medicamento-autocomplete-container relative">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Medicamento <span className="text-red-500">*</span>
                        </label>
                        <div className="relative z-10">
                          <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none stroke-[1.75] z-10" />
                          <input
                            ref={(el) => (medicamentoInputRefs.current[index] = el)}
                            type="text"
                            value={medicamentoBuscas[index] || ''}
                            onChange={(e) => handleMedicamentoChange(index, e.target.value)}
                            onKeyDown={(e) => handleMedicamentoKeyDown(index, e)}
                            onFocus={() => {
                              if ((medicamentosFiltrados[index]?.length || 0) > 0 && !medicamentosSelecionados[index]) {
                                setMostrarSugestoesMed(prev => ({ ...prev, [index]: true }))
                              }
                            }}
                            placeholder="Digite o nome do medicamento"
                            disabled={!!medicamentosSelecionados[index]}
                            className={cn(
                              'w-full pl-11 pr-10 py-2.5',
                              'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl',
                              'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                              'focus:outline-none focus:ring-2 focus:ring-drogaria-accent/20 focus:border-drogaria-accent dark:focus:border-[var(--drogaria-accent)]',
                              'transition-all duration-200',
                              'disabled:opacity-60 disabled:cursor-not-allowed',
                              errors.itens?.[index]?.medicamentoId &&
                                'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                            )}
                          />
                          {medicamentosSelecionados[index] && (
                            <button
                              type="button"
                              onClick={() => handleLimparMedicamento(index)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors z-10"
                            >
                              <X className="w-4 h-4 stroke-[2]" />
                            </button>
                          )}
                        </div>

                        {/* Sugestões de Autocomplete */}
                        <AnimatePresence>
                          {mostrarSugestoesMed[index] && (medicamentosFiltrados[index]?.length || 0) > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 right-0 z-[100] mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                            >
                              {medicamentosFiltrados[index]?.map((med, idx) => (
                                <button
                                  key={med.id}
                                  type="button"
                                  onClick={() => handleSelecionarMedicamento(index, med)}
                                  className={cn(
                                    'w-full px-4 py-3 text-left transition-colors border-b border-[var(--border-primary)] last:border-b-0 first:rounded-t-xl last:rounded-b-xl',
                                    idx === (medSugestaoAtiva[index] || 0)
                                      ? 'bg-[var(--bg-hover)]'
                                      : 'hover:bg-[var(--bg-hover)]'
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                        {med.nome}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs text-[var(--text-secondary)]">
                                          Estoque: <span className="font-medium">{med.quantidadeEstoque}</span>
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                          Preço: <span className="font-medium text-drogaria-accent">{formatCurrency(med.preco)}</span>
                                        </p>
                                      </div>
                                    </div>
                                    {idx === (medSugestaoAtiva[index] || 0) ? (
                                      <Check className="w-4 h-4 text-green-500 stroke-[2] flex-shrink-0" />
                                    ) : null}
                                  </div>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {errors.itens?.[index]?.medicamentoId && (
                          <p className="mt-1.5 text-sm text-red-600 font-medium">
                            {errors.itens[index]?.medicamentoId?.message}
                          </p>
                        )}

                        {/* Informações do Medicamento Selecionado */}
                        <AnimatePresence>
                          {medicamentosSelecionados[index] && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[2] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 truncate">
                                    {medicamentosSelecionados[index]?.nome}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-blue-700 dark:text-blue-300">
                                      Estoque: {medicamentosSelecionados[index]?.quantidadeEstoque}
                                    </span>
                                    <span className="text-xs text-blue-700 dark:text-blue-300">•</span>
                                    <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                      {formatCurrency(medicamentosSelecionados[index]?.preco || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                      <div className="mt-4 p-3 bg-[var(--bg-primary)] dark:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--text-secondary)]">Subtotal:</span>
                          <span className="text-base font-semibold text-[var(--text-primary)]">
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

        <div className="px-6 lg:px-8 py-5 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[var(--text-secondary)] stroke-[1.75]" />
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Total da Venda</p>
                <p className="text-xs text-[var(--text-tertiary)]">{itens.length} item(ns)</p>
              </div>
            </div>
            <motion.span
              key={totalVenda}
              initial={{ scale: 1.03, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-3xl font-bold text-drogaria-accent dark:text-[var(--drogaria-accent)]"
            >
              {formatCurrency(totalVenda)}
            </motion.span>
          </div>
          {!canSubmit && (
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Para finalizar: selecione um cliente, escolha os medicamentos e informe quantidades válidas.
            </p>
          )}
        </div>

        <FormFooter>
          <Button type="button" variant="ghost" onClick={() => navigate('/vendas/listar')} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit} className="w-full sm:w-auto">
            <DollarSign className="w-4 h-4 mr-2 stroke-[1.75]" />
            Registrar Venda • {formatCurrency(totalVenda)}
          </Button>
        </FormFooter>
      </form>
    </FormCard>
  )
}
