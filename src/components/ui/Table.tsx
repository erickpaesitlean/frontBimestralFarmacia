import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-card border border-[var(--border-primary)] shadow-drogaria overflow-hidden">
      <div className="overflow-x-auto">
        <table className={cn('w-full', className)}>{children}</table>
      </div>
    </div>
  )
}

interface TableHeaderProps {
  children: ReactNode
  className?: string
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn('bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]', className)}>
      {children}
    </thead>
  )
}

interface TableRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--border-primary)] transition-colors duration-150',
        onClick && 'cursor-pointer hover:bg-[var(--bg-hover)]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface TableHeadProps {
  children: ReactNode
  className?: string
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-6 py-3.5 text-left text-xs font-semibold text-drogaria-primary dark:text-[var(--drogaria-primary)] uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn('px-6 py-4 text-body text-[var(--text-primary)]', className)}>{children}</td>
  )
}

interface TableBodyProps {
  children: ReactNode
  className?: string
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn('divide-y divide-[var(--border-primary)]', className)}>{children}</tbody>
}

