import { getDashboardStats, getTodayMovements, getOutstandingTools, searchWorkers, getAllWorkers } from '@/lib/queries'
import Link from 'next/link'

export default async function StorekeeperDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const [stats, movements, outstanding, workers] = await Promise.all([
    getDashboardStats(),
    getTodayMovements(),
    getOutstandingTools({ status: 'all' }),
    query ? searchWorkers(query) : getAllWorkers(),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Welcome, Storekeeper</h1>
          <p className="text-sm text-brand-muted mt-1">Manage the store. Keep track of every tool.</p>
        </div>
        <div className="hidden sm:block text-right leading-tight">
          <p className="text-sm font-semibold text-brand-blue">Every Tool</p>
          <p className="text-sm font-semibold text-brand-blue">Accounted For.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric title="Total Tools" value={stats.total_tools.toLocaleString()} icon="tool"/>
        <Metric title="Available" value={stats.in_store.toLocaleString()} icon="store"/>
        <Metric title="Issued" value={stats.issued.toLocaleString()} icon="arrows"/>
        <Metric title="Overdue" value={stats.overdue.toLocaleString()} icon="warning" danger/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/storekeeper/issue-tools" className="dashboard-action bg-brand-blue text-white hover:bg-blue-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18m9-9H3"/></svg>
          Issue Tools
        </Link>
        <Link href="/storekeeper/returns" className="dashboard-action border border-brand-blue bg-white text-brand-blue hover:bg-blue-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v4"/></svg>
          Record Return
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="portal-panel-title">Search Workers</h2>
            <span className="text-xs text-slate-400">{workers?.length ?? 0} found</span>
          </div>
          <form method="get" className="flex gap-2 mb-3">
            <input className="worker-search-input flex-1" name="q" defaultValue={query} placeholder="Enter name or ID..." aria-label="Search workers by name or ID"/>
            <button className="btn-primary" type="submit">Search</button>
          </form>
          <div className="divide-y divide-slate-100">
            {(workers ?? []).slice(0, 3).map((worker: any) => (
              <div key={worker.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{worker.full_name}</p>
                  <p className="text-xs text-slate-500">{worker.worker_id} · {worker.trade || 'Worker'}</p>
                </div>
                <span className={worker.status === 'active' ? 'badge badge-green' : 'badge badge-gray'}>{worker.status}</span>
              </div>
            ))}
            {(!workers || workers.length === 0) && <p className="text-sm text-slate-500 py-4">{query ? 'No workers match your search.' : 'No workers registered yet.'}</p>}
          </div>
          <Link href="/storekeeper/workers" className="inline-block text-xs text-brand-blue mt-2 hover:underline">Manage workers →</Link>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h2 className="portal-panel-title mb-3">Quick Actions</h2>
          <div className="space-y-3">
            <QuickLink href="/storekeeper/workers" label="Add Worker"/>
            <QuickLink href="/storekeeper/tools" label="Register Tools"/>
            <QuickLink href="/storekeeper/damages" label="Record Damage"/>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="portal-panel-title">Outstanding Tools</h2>
            <Link href="/storekeeper/outstanding" className="text-xs text-brand-blue hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-2 text-xs text-slate-500">Worker</th>
                <th className="text-left py-2 pr-2 text-xs text-slate-500">Tools</th>
                <th className="text-center py-2 text-xs text-slate-500">Qty</th>
                <th className="text-left py-2 pl-2 text-xs text-slate-500">Due</th>
              </tr></thead>
              <tbody>
                {(outstanding ?? []).slice(0, 4).map((issue: any) => (
                  <tr key={issue.id} className="border-b border-slate-50">
                    <td className="py-2 pr-2 font-medium">{issue.workers?.full_name || '—'}</td>
                    <td className="py-2 pr-2 text-slate-500 max-w-28 truncate">{issue.issue_items?.map((item: any) => item.tools?.tool_name).join(', ') || '—'}</td>
                    <td className="py-2 text-center font-semibold">{issue.issue_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ?? 0}</td>
                    <td className="py-2 pl-2 text-slate-500 whitespace-nowrap">{issue.expected_return_date ? new Date(issue.expected_return_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</td>
                  </tr>
                ))}
                {(!outstanding || outstanding.length === 0) && <tr><td colSpan={4} className="py-7 text-center text-slate-500">No outstanding tools</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="portal-panel-title">Today’s Movements</h2>
            <Link href="/storekeeper/history" className="text-xs text-brand-blue hover:underline">View All →</Link>
          </div>
          <div className="space-y-2">
            <Movement label="Issues" count={movements.issues} arrow="↑" color="blue"/>
            <Movement label="Returns" count={movements.returns} arrow="↓" color="green"/>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Inventory Reports</h3>
            <p className="text-xs text-slate-500 mb-3">Download inventory reports for any period</p>
            <div className="flex flex-wrap gap-2">
              {[['This Week',7],['This Month',30],['3 Months',90],['6 Months',180],['1 Year',365]].map(([label,days]) => (
                <Link key={label} href={`/storekeeper/reports?days=${days}`} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-brand-blue hover:text-brand-blue">{label} ↓</Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function Metric({title,value,icon,danger}:{title:string;value:string;icon:string;danger?:boolean}) {
  const paths:Record<string,string> = {
    tool:'M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 11l-3-3 3.7-1.7Z',
    store:'M3 10 12 4l9 6v10H3V10Zm5 10v-6h8v6',
    arrows:'M4 7h15l-4-4m5 14H5l4 4',
    warning:'M12 3 2.5 20h19L12 3Zm0 6v5m0 3h.01',
  }
  return <div className={`stat-card bg-white ${danger?'border-red-200':''}`}>
    <div className="flex items-start justify-between">
      <div><p className="text-sm text-slate-500">{title}</p><p className={`text-3xl font-bold mt-1 ${danger?'text-red-600':'text-slate-900'}`}>{value}</p></div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${danger?'bg-red-50 text-red-500':'bg-blue-50 text-brand-blue'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d={paths[icon]}/></svg>
      </div>
    </div>
  </div>
}
function QuickLink({href,label}:{href:string;label:string}) {
  return <Link href={href} className="flex items-center gap-3 text-sm text-brand-blue hover:bg-blue-50 rounded-md px-2 py-2"><span className="text-xl font-light">＋</span>{label}</Link>
}
function Movement({label,count,arrow,color}:{label:string;count:number;arrow:string;color:string}) {
  return <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3">
    <div className="flex items-center gap-3"><span className={`text-xl font-bold ${color==='blue'?'text-blue-600':'text-green-600'}`}>{arrow}</span><span className="text-sm text-slate-700">{label}</span></div>
    <strong className={`text-sm ${color==='blue'?'text-blue-600':'text-green-600'}`}>{count}</strong>
  </div>
}
