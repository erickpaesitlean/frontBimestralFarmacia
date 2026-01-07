import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendaService, type VendaResumoResponseDTO } from '../api/vendaService'
import { clienteService } from '@/features/clientes/api/clienteService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/masks'

export function VendaListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [vendas, setVendas] = useState<VendaResumoResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clienteFiltro, setClienteFiltro] = useState<string>('')
  const [filtroAtivo, setFiltroAtivo] = useState(false)
  const [clienteNaoEncontrado, setClienteNaoEncontrado] = useState(false)
  const [clientes, setClientes] = useState<Array<{ id: number; nome: string }>>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<Array<{ id: number; nome: string }>>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<{ id: number; nome: string } | null>(null)

  useEffect(() => {
    loadVendas()
    loadClientes()
  }, [])

  async function loadVendas() {
    try {
      setIsLoading(true)
      setClienteNaoEncontrado(false)
      setFiltroAtivo(false)
      const data = await vendaService.listar()
      setVendas(data)
    } catch (error: any) {
      showToast('error', 'Erro ao carregar vendas')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadClientes() {
    try {
      const data = await clienteService.listar()
      setClientes(data.map(c => ({ id: c.id, nome: c.nome })))
    } catch (error) {
      showToast('error', 'Erro ao carregar clientes')
    }
  }

  function handleChangeNome(valor: string) {
    setClienteFiltro(valor)
    setClienteSelecionado(null)
    
    if (valor.trim().length >= 2) {
      const filtrados = clientes.filter(c => 
        c.nome.toLowerCase().includes(valor.toLowerCase())
      ).slice(0, 10) // Limita a 10 sugestões
      setClientesFiltrados(filtrados)
      setMostrarSugestoes(true)
    } else {
      setClientesFiltrados([])
      setMostrarSugestoes(false)
    }
  }

  function handleSelecionarCliente(cliente: { id: number; nome: string }) {
    setClienteFiltro(cliente.nome)
    setClienteSelecionado(cliente)
    setMostrarSugestoes(false)
    setClientesFiltrados([])
  }

  async function handleFiltrarPorCliente() {
    if (!clienteFiltro) {
      loadVendas()
      return
    }

    if (!clienteSelecionado) {
      showToast('error', 'Selecione um cliente da lista de sugestões')
      return
    }

    try {
      setIsLoading(true)
      setClienteNaoEncontrado(false)
      
      // Buscar vendas do cliente
      const data = await vendaService.buscarPorCliente(clienteSelecionado.id)
      
      setVendas(data)
      setFiltroAtivo(true)
      
      if (data.length === 0) {
        showToast('info', `Nenhuma venda encontrada para o cliente ${clienteSelecionado.nome}`)
      }
    } catch (error: any) {
      showToast('error', 'Erro ao filtrar vendas')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLimparFiltro() {
    setClienteFiltro('')
    setClienteSelecionado(null)
    setFiltroAtivo(false)
    setClienteNaoEncontrado(false)
    setMostrarSugestoes(false)
    setClientesFiltrados([])
    loadVendas()
  }

  if (isLoading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Vendas</h1>
        <Button onClick={() => navigate('/vendas/criar')}>Nova Venda</Button>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-4 mb-6">
        <div className="flex gap-3 items-start">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Digite o nome do cliente..."
              value={clienteFiltro}
              onChange={(e) => handleChangeNome(e.target.value)}
              onFocus={() => clienteFiltro.length >= 2 && setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
              className="w-full px-3 py-2 border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-md"
            />
            
            {/* Lista de sugestões (autocomplete) */}
            {mostrarSugestoes && clientesFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => handleSelecionarCliente(cliente)}
                    className="w-full px-3 py-2 text-left hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors"
                  >
                    <span className="font-medium">{cliente.nome}</span>
                    <span className="text-xs text-[var(--text-tertiary)] ml-2">ID: {cliente.id}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Indicador de cliente selecionado */}
            {clienteSelecionado && (
              <div className="mt-1 text-xs text-[var(--text-secondary)]">
                ✓ Cliente selecionado: <span className="font-medium">{clienteSelecionado.nome}</span>
              </div>
            )}
          </div>
          
          <Button onClick={handleFiltrarPorCliente} disabled={!clienteSelecionado}>
            Filtrar
          </Button>
          {filtroAtivo && (
            <Button variant="ghost" onClick={handleLimparFiltro}>
              Limpar Filtro
            </Button>
          )}
        </div>
      </div>

      {vendas.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
          {clienteNaoEncontrado ? (
            <>
              <p className="text-[var(--text-secondary)] mb-2 font-medium">
                Cliente não encontrado
              </p>
              <p className="text-sm text-[var(--text-tertiary)] mb-4">
                Não há vendas para este cliente ou o cliente não existe no sistema.
              </p>
              <Button variant="ghost" onClick={handleLimparFiltro}>
                Limpar filtro
              </Button>
            </>
          ) : filtroAtivo ? (
            <>
              <p className="text-[var(--text-secondary)] mb-4 font-medium">
                Nenhuma venda encontrada para este cliente
              </p>
              <Button variant="ghost" onClick={handleLimparFiltro}>
                Limpar filtro
              </Button>
            </>
          ) : (
            <>
              <p className="text-[var(--text-secondary)] mb-4">Nenhuma venda encontrada</p>
              <Button onClick={() => navigate('/vendas/criar')}>Criar primeira venda</Button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--bg-tertiary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Valor Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Itens</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{venda.id}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {new Date(venda.dataVenda).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">{venda.cliente.nome}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                      {formatCurrency(venda.valorTotal)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{venda.itens.length} item(s)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/vendas/detalhes/${venda.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {vendas.map((venda) => (
              <div
                key={venda.id}
                className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-4 shadow-sm"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-[var(--border-primary)]">
                  <div>
                    <span className="text-xs text-[var(--text-tertiary)] font-medium">VENDA #{venda.id}</span>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {new Date(venda.dataVenda).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                    {venda.itens.length} {venda.itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                {/* Conteúdo do Card */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">Cliente</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{venda.cliente.nome}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">Valor Total</p>
                    <p className="text-lg text-[var(--text-primary)] font-bold">
                      {formatCurrency(venda.valorTotal)}
                    </p>
                  </div>
                </div>

                {/* Ação */}
                <div className="mt-4 pt-3 border-t border-[var(--border-primary)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/vendas/detalhes/${venda.id}`)}
                    className="w-full justify-center"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

