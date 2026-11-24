/** Common badge / tag component used throughout TOOLROOM. */

const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium'

export function Badge({ children, variant = 'gray', className = '' }: {
  children: React.ReactNode
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'white'
  className?: string
}) {
  const variants = {
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-amber-100 text-amber-700',
    red:    'bg-red-100 text-red-700',
    gray:   'bg-slate-100 text-slate-600',
    white:  'bg-white border border-slate-200 text-slate-600',
  }
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>
}

export function StatusDot({ status }: { status: string }) {
  const color = status === 'active' || status === 'issued' || status === 'completed' ? 'bg-green-500'
    : status === 'overdue' || status === 'damaged' || status === 'in_progress' ? 'bg-amber-500'
      : status === 'removed' || status === 'cancelled' ? 'bg-red-500'
        : 'bg-slate-400'
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {status}
    </span>
  )
}
