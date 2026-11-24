import { getDashboardStats, getActivityLogs, getAppointedStorekeeper } from '@/lib/queries'
import Link from 'next/link'
import type { ReactNode } from 'react'

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  const logs = await getActivityLogs()
  const storekeeper = await getAppointedStorekeeper()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Welcome, Administrator</h1>
          <p className="text-sm text-brand-muted mt-1">System oversight. Complete control.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-brand-blue">Every Tool</p>
          <p className="text-xs font-medium text-brand-blue">Accounted For.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon="fa-wrench"
          title="Total Tools"
          value={stats.total_tools.toLocaleString()}
          color="blue"
          href="/admin/inventory"
        />
        <StatCard
          icon="warehouse"
          title="In Store"
          value={stats.in_store.toLocaleString()}
          color="green"
          href="/admin/inventory"
        />
        <StatCard
          icon="exchange"
          title="Issued"
          value={stats.issued.toLocaleString()}
          color="amber"
          href="/admin/accountability"
        />
        <StatCard
          icon="alert"
          title="Damaged"
          value={stats.damaged.toString()}
          color="red"
          href="/admin/accountability"
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Storekeeper */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-charcoal mb-4">Current Storekeeper</h2>
          {storekeeper ? (
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue font-bold text-xl">
                {storekeeper.users?.full_name?.charAt(0) || 'J'}
              </div>
              <div>
                <div className="font-semibold text-brand-charcoal">{storekeeper.users?.full_name}</div>
                <div className="text-sm text-brand-muted">Active Storekeeper</div>
                {storekeeper.users?.last_login && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    Last active: {new Date(storekeeper.users.last_login).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-brand-muted py-4 text-center">No storekeeper appointed</div>
          )}
          <div className="flex gap-2">
            <Link href="/admin/storekeeper-control" className="btn-primary text-xs py-1.5">
              Change
            </Link>
            <Link href="/admin/storekeeper-control" className="btn-secondary text-xs py-1.5">
              Remove
            </Link>
          </div>
        </div>

        {/* Inventory Overview Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-charcoal mb-4">Inventory Overview</h2>
          <div className="flex items-center gap-6">
            {/* Donut chart representation */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                {/* Available portion */}
                <circle
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeDasharray={`${(stats.in_store / stats.total_tools) * 100} ${100 - (stats.in_store / stats.total_tools) * 100}`}
                  strokeLinecap="round"
                />
                {/* Issued portion */}
                <circle
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke="#1D4ED8"
                  strokeWidth="3"
                  strokeDasharray={`${(stats.issued / stats.total_tools) * 100} ${100 - (stats.issued / stats.total_tools) * 100}`}
                  strokeDashoffset={`-${(stats.in_store / stats.total_tools) * 100}`}
                  strokeLinecap="round"
                />
                {/* Damaged portion */}
                <circle
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="3"
                  strokeDasharray={`${(stats.damaged / stats.total_tools) * 100} ${100 - (stats.damaged / stats.total_tools) * 100}`}
                  strokeDashoffset={`-${((stats.in_store + stats.issued) / stats.total_tools) * 100}`}
                  strokeLinecap="round"
                />
                {/* Under repair */}
                <circle
                  cx="18" cy="18" r="15.915"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeDasharray={`${((stats.under_repair || 0) / stats.total_tools) * 100} ${100 - ((stats.under_repair || 0) / stats.total_tools) * 100}`}
                  strokeDashoffset={`-${((stats.in_store + stats.issued + stats.damaged) / stats.total_tools) * 100}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-charcoal">{stats.total_tools.toLocaleString()}</span>
                <span className="text-xs text-muted">Total</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600" /><span className="text-muted">In Store</span><span className="font-semibold ml-auto">{stats.in_store}</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-800" /><span className="text-muted">Issued</span><span className="font-semibold ml-auto">{stats.issued}</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600" /><span className="text-muted">Damaged</span><span className="font-semibold ml-auto">{stats.damaged}</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-600" /><span className="text-muted">Under Repair</span><span className="font-semibold ml-auto">{stats.under_repair || 0}</span></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-brand-charcoal">Recent Activity</h2>
            <Link href="/admin/activity-log" className="text-xs text-brand-blue hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {(logs ?? []).slice(0, 5).map((log: any) => (
              <ActivityItem key={log.id} log={log} />
            ))}
            {(logs ?? []).length === 0 && (
              <p className="text-sm text-brand-muted text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-charcoal mb-4">Inventory Reports</h2>
          <p className="text-sm text-brand-muted mb-4">Download reports for any period</p>
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
                href={`/admin/reports?days=${period.days}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-brand-blue hover:text-brand-blue transition-colors"
              >
                {period.label}
                <span className="text-xs">↓</span>
              </a>
            ))}
          </div>
        </div>

        {/* Exceptions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-charcoal mb-4">Exceptions</h2>
          <div className="space-y-2">
            <ExceptionRow label="Overdue Tools" count={stats.overdue} href="/admin/accountability" />
            <ExceptionRow label="Damaged" count={stats.damaged} href="/storekeeper/damages" />
            <ExceptionRow label="Under Repair" count={stats.under_repair || 0} href="/storekeeper/damages" />
            <ExceptionRow label="Missing" count={stats.missing} href="/admin/inventory" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color, href }: {
  icon: string
  title: string
  value: string
  color: 'blue' | 'green' | 'amber' | 'red'
  href: string
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  const icons = {
    wrench: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    warehouse: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    exchange: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4-4m0 6H4m0 0l4 4m-4-4l4-4" />,
    alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  }

  return (
    <Link href={href} className="block stat-card hover:border-blue-300 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-muted">{title}</p>
          <p className="text-3xl font-bold text-brand-charcoal mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[icon as keyof typeof icons]}
          </svg>
        </div>
      </div>
    </Link>
  )
}

function ActivityItem({ log }: { log: any }) {
  const actions: Record<string, { label: string; color: string; icon: ReactNode }> = {
    tool_issued: { label: 'Tools issued', color: 'text-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> },
    tool_returned: { label: 'Tools returned', color: 'text-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
    worker_registered: { label: 'Worker registered', color: 'text-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /> },
    tool_added: { label: 'New tools added', color: 'text-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> },
    login: { label: 'User login', color: 'text-slate-500', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /> },
  }

  const action = actions[log.action] || { label: log.action, color: 'text-slate-500', icon: null }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${action.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {action.icon}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal truncate">{action.label}</p>
        <p className="text-xs text-muted truncate">
          {log.users?.full_name || log.users?.email || 'System'} · {formatTimeAgo(log.created_at)}
        </p>
      </div>
    </div>
  )
}

function ExceptionRow({ label, count, href }: { label: string; count: number; href: string }) {
  const isWarning = count > 0
  return (
    <Link href={href} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isWarning ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'} transition-colors`}>
      <span className={`text-sm ${isWarning ? 'text-red-700 font-medium' : 'text-slate-600'}`}>{label}</span>
      <span className={`text-sm font-bold ${isWarning ? 'text-red-600' : 'text-slate-400'}`}>{count}</span>
    </Link>
  )
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
