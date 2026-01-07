import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { estoqueService, type MovimentacaoEstoqueResponseDTO } from '@/features/estoque/api/estoqueService'
import { medicamentoService } from '../api/medicamentoService'
import { useToast } from '@/components/toast/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'

export function MedicamentoHistoricoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [historico, setHistorico] = useState<MovimentacaoEstoqueResponseDTO[]>([])
  const [medicamentoNome, setMedicamentoNome] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData(Number(id))
    }
  }, [id])

  async function loadData(medicamentoId: number) {
    try {
      setIsLoading(true)
      const [medicamento, movimentacoes] = await Promise.all([
        medicamentoService.buscarPorId(medicamentoId),
        estoqueService.buscarHistorico(medicamentoId),
      ])
      setMedicamentoNome(medicamento.nome)
      setHistorico(movimentacoes)
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast('error', 'Medicamento não encontrado')
        navigate('/medicamentos/listar')
      } else {
        showToast('error', 'Erro ao carregar histórico')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/medicamentos/listar')}
          className="mb-4 gap-2 text-drogaria-primary hover:text-drogaria-accent"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
          Voltar
        </Button>
        <h1 className="text-h1 text-drogaria-primary mb-2">Histórico de Movimentações</h1>
        <p className="text-body text-drogaria-gray-medium">Medicamento: {medicamentoNome}</p>
      </div>

      {historico.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-card border border-gray-200 shadow-drogaria">
          <p className="text-body text-drogaria-gray-medium">Nenhuma movimentação registrada</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Saldo Anterior</TableHead>
              <TableHead className="text-right">Saldo Atual</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historico.map((mov) => (
              <TableRow key={mov.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(mov.dataMovimentacao).toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                      mov.tipo === 'ENTRADA'
                        ? 'bg-drogaria-secondary-light text-drogaria-secondary-dark border border-drogaria-secondary'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    {mov.tipo}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">{mov.quantidade}</TableCell>
                <TableCell className="text-right">{mov.saldoAnterior}</TableCell>
                <TableCell className="text-right font-semibold">{mov.saldoAtual}</TableCell>
                <TableCell>{mov.motivo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

