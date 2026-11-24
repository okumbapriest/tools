'use client'

import { useState } from 'react'
import Link from 'next/link'

interface OutstandingTool {
  id: string
  reference: string
  worker_name: string
  worker_id: string
  tool_name: string
  quantity: number
  issue_date: string
  expected_return: string
  status: 'outstanding' | 'overdue' | 'due_today'
  site: string
}

const MOCK_DATA: OutstandingTool[] = [
  { id: '1', reference: 'ISSUE-001', worker_name: 'Peter Mwangi', worker_id: 'WR-002', tool_name: 'Drill', quantity: 1, issue_date: '2025-11-18', expected_return: '2025-11-21', status: 'outstanding', site: 'Site A' },
  { id: '2', reference: 'ISSUE-002', worker_name: 'David Ochieng', worker_id: 'WR-003', tool_name: 'Hammer', quantity: 3, issue_date: '2025-11-19', expected_return: '2025-11-20', status: 'overdue', site: 'Site B' },
  { id: '3', reference: 'ISSUE-003', worker_name: 'James Otieno', worker_id: 'WR-004', tool_name: 'Extension cable', quantity: 2, issue_date: '2025-11-20', expected_return: '2025-11-22', status: 'outstanding', site: 'Site A' },
]

export default function OutstandingToolsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'outstanding' | 'overdue' | 'due_today'>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_DATA.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search && !(r.worker_name.toLowerCase().includes(search.toLowerCase()) || r.tool_name.toLowerCase().includes(search.toLowerCase()) || r.reference.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const totalOutstanding = MOCK_DATA.length
  const overdueCount = MOCK_DATA.filter(r => r.status === 'overdue').length
  const todayCount = MOCK_DATA.filter(r => r.status === 'due_today').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Outstanding Tools</h1>
          <p className="text-sm text-muted mt-0.5">Track every tool currently held by workers</p>
        </div>
        <Link href="/storekeeper/returns" className="btn-secondary text-xs">Record Return</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Outstanding" value={overdueCount + (MOCK_DATA.length - overdueCount)} color="blue" />
        <SummaryCard label="Overdue" value={overdueCount} color="red" />
        <SummaryCard label="Due Today" value={todayCount} color="amber" />
        <SummaryCard label="On Time" value={MOCK_DATA.filter(r => r.status === 'outstanding').length} color="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-52">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search worker, tool, or reference…" className="form-input pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="form-input w-40">
          <option value="all">All Status</option>
          <option value="outstanding">Outstanding</option>
          <option value="overdue">Overdue</option>
          <option value="due_today">Due Today</option>
        </select>
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
              <th>Issued</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td><span className="font-mono text-xs text-brand-blue">{r.reference}</span></td>
                <td>
                  <div className="font-medium">{r.worker_name}</div>
                  <div className="text-xs text-muted">{r.worker_id}</div>
                </td>
                <td>{r.tool_name}</td>
                <td className="text-center font-semibold">{r.quantity}</td>
                <td className="text-muted">{r.site}</td>
                <td>{formatDate(r.issue_date)}</td>
                <td className={r.status === 'overdue' ? 'text-red-600 font-semibold' : ''}>{formatDate(r.expected_return)}</td>
                <td><StatusChip status={r.status} /></td>
                <td className="space-x-2">
                  <Link href={`/storekeeper/returns`} className="text-brand-blue hover:underline text-xs">Return</Link>
                  <Link href="/storekeeper/transfers" className="text-slate-500 hover:underline text-xs">Transfer</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-10 text-muted">No outstanding tools found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50',
    amber: 'border-amber-200 bg-amber-50',
    green: 'border-green-200 bg-green-50',
  }
  const textColors: Record<string, string> = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    amber: 'text-amber-700',
    green: 'text-green-700',
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
  if (status === 'due_today') return <span className="badge badge-yellow">Due Today</span>
  return <span className="badge badge-green">Outstanding</span>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
