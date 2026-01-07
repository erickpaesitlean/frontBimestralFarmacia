import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clienteService, type ClienteResponseDTO } from '../api/clienteService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/Table'
import { maskCPF } from '@/lib/masks'

export function ClienteListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [clientes, setClientes] = useState<ClienteResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClientes()
  }, [])

  async function loadClientes() {
    try {
      setIsLoading(true)
      const data = await clienteService.listar()
      setClientes(data)
    } catch (error: any) {
      showToast('error', 'Erro ao carregar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h1 text-drogaria-primary dark:text-[var(--drogaria-primary)]">Clientes</h1>
        <Button onClick={() => navigate('/clientes/criar')}>Novo Cliente</Button>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)]">
          <p className="text-[var(--text-secondary)] mb-4">Nenhum cliente cadastrado</p>
          <Button onClick={() => navigate('/clientes/criar')}>Criar primeiro cliente</Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Data Nascimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="whitespace-nowrap font-mono">{cliente.id}</TableCell>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{maskCPF(cliente.cpf)}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium">#{cliente.id}</span>
                    <p className="text-base font-semibold text-[var(--text-primary)] mt-1">{cliente.nome}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                    className="ml-2"
                  >
                    Editar
                  </Button>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">CPF</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{maskCPF(cliente.cpf)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">E-mail</p>
                    <p className="text-sm text-[var(--text-primary)] break-all">{cliente.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Data de Nascimento</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

