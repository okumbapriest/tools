'use client'

import { useState } from 'react'
import Link from 'next/link'

interface IssueRecord {
  id: string
  reference: string
  worker_name: string
  worker_id: string
  tool_name: string
  quantity: number
  site: string
  issue_date: string
  expected_return: string
  status: 'issued' | 'overdue' | 'partially_returned'
}

// Mock data — replace with Supabase query in production
const MOCK_DATA: IssueRecord[] = [
  { id: '1', reference: 'ISSUE-001', worker_name: 'Peter Mwangi', worker_id: 'WR-002', tool_name: 'Drill', quantity: 1, site: 'Site A', issue_date: '2025-11-18', expected_return: '2025-11-21', status: 'issued' },
  { id: '2', reference: 'ISSUE-002', worker_name: 'David Ochieng', worker_id: 'WR-003', tool_name: 'Hammer', quantity: 3, site: 'Site B', issue_date: '2025-11-19', expected_return: '2025-11-20', status: 'overdue' },
  { id: '3', reference: 'ISSUE-003', worker_name: 'James Otieno', worker_id: 'WR-004', tool_name: 'Extension cable', quantity: 2, site: 'Site A', issue_date: '2025-11-20', expected_return: '2025-11-22', status: 'issued' },
]

export default function AccountabilityPage() {
  const [search, setSearch] = useState('')
  const [filterWorker, setFilterWorker] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'outstanding' | 'overdue'>('all')

  const filtered = MOCK_DATA.filter(r => {
    if (search && !(r.worker_name.toLowerCase().includes(search.toLowerCase()) || r.tool_name.toLowerCase().includes(search.toLowerCase()) || r.reference.toLowerCase().includes(search.toLowerCase()))) return false
    if (filterWorker && r.worker_id !== filterWorker) return false
    if (filterStatus === 'outstanding' && r.status !== 'issued') return false
    if (filterStatus === 'overdue' && r.status !== 'overdue') return false
    return true
  })

  const overdueCount = MOCK_DATA.filter(r => r.status === 'overdue').length
  const outstandingCount = MOCK_DATA.filter(r => r.status === 'issued').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Accountability</h1>
          <p className="text-sm text-muted mt-0.5">Workers currently holding tools and quantities</p>
        </div>
        <Link href="/storekeeper/outstanding" className="btn-secondary text-xs">View Storekeeper Outstanding</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Issued" value={outstandingCount + overdueCount} color="blue" />
        <SummaryCard label="Outstanding" value={outstandingCount} color="green" />
        <SummaryCard label="Overdue" value={overdueCount} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-52">
          <label className="form-label">Search</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Worker name, tool, or reference…" className="form-input" />
        </div>
        <div>
          <label className="form-label">Worker</label>
          <select value={filterWorker} onChange={e => setFilterWorker(e.target.value)} className="form-input w-40">
            <option value="">All Workers</option>
            {Array.from(new Set(MOCK_DATA.map(r => r.worker_id))).map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="form-input w-40">
            <option value="all">All</option>
            <option value="outstanding">Outstanding</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Worker</th>
              <th>Tool</th>
              <th>Qty</th>
              <th>Site</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td><span className="font-mono text-xs text-brand-blue">{r.reference}</span></td>
                <td className="font-medium">{r.worker_name}<br /><span className="text-xs text-muted">{r.worker_id}</span></td>
                <td>{r.tool_name}</td>
                <td className="text-center font-semibold">{r.quantity}</td>
                <td className="text-muted">{r.site}</td>
                <td>{formatDate(r.issue_date)}</td>
                <td className={r.status === 'overdue' ? 'text-red-600 font-semibold' : ''}>{formatDate(r.expected_return)}</td>
                <td><StatusChip status={r.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-muted">No accountability records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
  }
  const textColors: Record<string, string> = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${textColors[color]}`}>{value}</p>
    </div>
  )
}

function StatusChip({ status }: { status: string }) {
  if (status === 'overdue') return <span className="badge badge-red">Overdue</span>
  if (status === 'partially_returned') return <span className="badge badge-yellow">Partial Return</span>
  return <span className="badge badge-green">Issued</span>
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
