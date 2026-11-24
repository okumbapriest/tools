import { getDashboardStats, getTodayMovements, getOutstandingTools, getActivityLogs, getDamagedAndRepairs } from '@/lib/queries'
import Link from 'next/link'
import type { ReactNode } from 'react'

export default async function StorekeeperDashboardPage() {
  const stats = await getDashboardStats()
  const movements = await getTodayMovements()
  const outstanding = await getOutstandingTools({ status: 'all' })
  const damages = await getDamagedAndRepairs()
  const logs = await getActivityLogs()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-muted">Manage the store. Keep track of every tool.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-brand-blue">Every Tool</p>
          <p className="text-xs font-medium text-brand-blue">Accounted For.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Tools" value={stats.total_tools.toLocaleString()} icon="tools" />
        <StatCard title="Available" value={stats.in_store.toLocaleString()} icon="available" accent />
        <StatCard title="Issued" value={stats.issued.toLocaleString()} icon="issued" />
        <StatCard title="Overdue" value={stats.overdue.toString()} icon="overdue" danger />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction
          href="/storekeeper/issue-tools"
          label="Issue Tools"
          description="Hand tools to workers"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
          primary
        />
        <QuickAction
          href="/storekeeper/returns"
          label="Record Return"
          description="Receive tools back"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
        />
        <QuickAction
          href="/storekeeper/workers"
          label="Add Worker"
          description="Register new worker"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />}
        />
        <QuickAction
          href="/storekeeper/tools"
          label="Register Tools"
          description="Add new inventory"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
        />
      </div>

      {/* Search Workers + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outstanding Tools */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-brand-charcoal">Outstanding Tools</h2>
            <Link href="/storekeeper/outstanding" className="text-xs text-brand-blue hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">Worker</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">Tool</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">Qty</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">Due</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {(outstanding ?? []).slice(0, 5).map((issue: any) => (
                  <tr key={issue.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium">{issue.workers?.full_name}</td>
                    <td className="px-3 py-2 text-muted">
                      {issue.issue_items?.map((item: any) => item.tools?.tool_name).join(', ') || '—'}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold">
                      {issue.issue_items?.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-3 py-2">{issue.expected_return_date ? new Date(issue.expected_return_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={issue.status} expectedReturn={issue.expected_return_date} />
                    </td>
                  </tr>
                ))}
                {(!outstanding || outstanding.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted text-sm">No outstanding tools</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Movements + Quick Actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-brand-charcoal">Today's Movements</h2>
              <Link href="/storekeeper/history" className="text-xs text-brand-blue hover:underline">View All →</Link>
            </div>
            <div className="space-y-3">
              <MovementRow label="Issues" count={movements.issues} icon="↑" color="blue" />
              <MovementRow label="Returns" count={movements.returns} icon="↓" color="green" />
            </div>
          </div>

          {/* Damaged & Repair Alert */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-brand-charcoal">Needs Attention</h2>
              <Link href="/storekeeper/damages" className="text-xs text-brand-blue hover:underline">View All</Link>
            </div>
            <div className="space-y-2">
              {(damages ?? []).slice(0, 3).map((dr: any) => (
                <div key={dr.id} className="flex items-center gap-2 text-sm">
                  <span className="text-amber-500">⚠</span>
                  <span className="text-charcoal flex-1 truncate">{dr.tools?.tool_name}</span>
                  <span className="badge badge-yellow text-xs">{dr.status}</span>
                </div>
              ))}
              {(!damages || damages.length === 0) && (
                <p className="text-sm text-green-600">All tools in good condition ✓</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Reports */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-brand-charcoal">Inventory Reports</h2>
            <p className="text-xs text-brand-muted mt-0.5">Download inventory reports for any period</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'This Week', days: 7 },
            { label: 'This Month', days: 30 },
            { label: '3 Months', days: 90 },
            { label: '6 Months', days: 180 },
            { label: '1 Year', days: 365 },
          ].map((period) => (
            <a
              key={period.label}
              href={`/storekeeper/reports?days=${period.days}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              {period.label}
              <span className="text-xs">↓</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, accent, danger }: {
  title: string
  value: string
  icon: string
  accent?: boolean
  danger?: boolean
}) {
  const baseClass = accent ? 'bg-brand-blue text-white' : danger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-brand-charcoal'
  const iconColors = accent ? 'text-white/80' : danger ? 'text-red-400' : 'text-slate-400'

  const iconMap: Record<string, ReactNode> = {
    tools: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    available: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    issued: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4-4m0 6H4m0 0l4 4m-4-4l4-4" />,
    overdue: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  }

  return (
    <div className={`stat-card ${accent ? '!border-transparent !bg-brand-blue !text-white' : ''} ${danger ? '' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${accent ? 'text-blue-100' : 'text-muted'}`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 ${accent ? 'text-white' : 'text-charcoal'}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent ? 'bg-white/20' : danger ? 'bg-red-100' : 'bg-slate-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${accent ? 'text-white' : danger ? 'text-red-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {iconMap[icon]}
          </svg>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ href, label, description, icon, primary }: {
  href: string
  label: string
  description: string
  icon: ReactNode
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl p-4 text-center transition-all hover:shadow-md ${primary
        ? 'bg-brand-blue text-white hover:bg-blue-700'
        : 'bg-white border border-slate-200 text-charcoal hover:border-blue-300'
        }`}
    >
      <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${primary ? 'bg-white/20' : 'bg-blue-50'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${primary ? 'text-white' : 'text-brand-blue'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div className={`font-semibold text-sm ${primary ? 'text-white' : 'text-charcoal'}`}>{label}</div>
      <div className={`text-xs mt-0.5 ${primary ? 'text-blue-100' : 'text-muted'}`}>{description}</div>
    </Link>
  )
}

function MovementRow({ label, count, icon, color }: { label: string; count: number; icon: string; color: string }) {
  const colorClasses = color === 'blue' ? 'text-blue-600' : 'text-green-600'
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className={colorClasses}>{icon}</span>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className={`text-sm font-bold ${colorClasses}`}>{count}</span>
    </div>
  )
}

function StatusBadge({ status, expectedReturn }: { status: string; expectedReturn?: string | null }) {
  const isOverdue = expectedReturn && new Date(expectedReturn) < new Date() && status === 'issued'
  const cls = isOverdue
    ? 'badge badge-red'
    : status === 'partially_returned'
      ? 'badge badge-yellow'
      : 'badge badge-green'
  const text = isOverdue ? 'Overdue' : status === 'partially_returned' ? 'Partial' : 'Outstanding'
  return <span className={cls}>{text}</span>
}
