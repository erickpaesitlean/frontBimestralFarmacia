// Máscaras para formatação

export function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return value
}

export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}

