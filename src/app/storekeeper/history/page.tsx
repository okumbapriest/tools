'use client'

import { useState } from 'react'

type ActionType = 'issue' | 'return' | 'register' | 'transfer' | 'damage' | 'repair' | 'adjustment'

interface HistoryEntry {
  id: string
  action: ActionType
  reference: string
  detail: string
  date: string
  user: string
}

const MOCK_HISTORY: HistoryEntry[] = [
  { id: '1', action: 'issue', reference: 'ISSUE-003', detail: 'Extension cable ×2, Pipe wrench ×1 → James Otieno (WR-004)', date: '2025-11-20T10:30:00Z', user: 'John Kamau' },
  { id: '2', action: 'return', reference: 'RETURN-008', detail: 'Hammer ×2 received (good condition) from Peter Mwangi', date: '2025-11-20T09:15:00Z', user: 'John Kamau' },
  { id: '3', action: 'register', reference: 'WR-005', detail: 'Registered new worker: Grace Wambui — Plumber, Site D', date: '2025-11-19T14:00:00Z', user: 'John Kamau' },
  { id: '4', action: 'damage', reference: 'DR-001', detail: 'Reported drill motor failure at Site A', date: '2025-11-19T16:30:00Z', user: 'John Kamau' },
  { id: '5', action: 'transfer', reference: 'TRANSFER-004', detail: 'Spade ×1 transferred from Peter Mwangi → David Ochieng', date: '2025-11-18T15:00:00Z', user: 'John Kamau' },
  { id: '6', action: 'issue', reference: 'ISSUE-002', detail: 'Hammer ×3 → David Ochieng (WR-003), Site B', date: '2025-11-19T08:00:00Z', user: 'John Kamau' },
  { id: '7', action: 'register', reference: 'T-HAM-001', detail: 'Added 40× Hammers to inventory', date: '2025-11-15T08:00:00Z', user: 'John Kamau' },
  { id: '8', action: 'repair', reference: 'REP-001', detail: 'Started repairing Drill (motor problem) — T-DRILL-012', date: '2025-11-20T09:00:00Z', user: 'John Kamau' },
  { id: '9', action: 'return', reference: 'RETURN-007', detail: 'Drill ×1 received (needs repair) from Samuel Kipchoge', date: '2025-11-18T11:00:00Z', user: 'John Kamau' },
  { id: '10', action: 'adjustment', reference: 'ADJ-001', detail: 'Stock adjustment: +5 Tape measures (found in storage)', date: '2025-11-17T10:00:00Z', user: 'John Kamau' },
]

const ACTION_CONFIG: Record<ActionType, { label: string; icon: string; color: string; bg: string }> = {
  issue:     { label: 'Issue', icon: '➕', color: 'text-blue-700', bg: 'bg-blue-50' },
  return:    { label: 'Return', icon: '↩️', color: 'text-green-700', bg: 'bg-green-50' },
  register:  { label: 'Registration', icon: '📋', color: 'text-purple-700', bg: 'bg-purple-50' },
  transfer:  { label: 'Transfer', icon: '↔️', color: 'text-amber-700', bg: 'bg-amber-50' },
  damage:    { label: 'Damage', icon: '⚠️', color: 'text-red-700', bg: 'bg-red-50' },
  repair:    { label: 'Repair', icon: '🔧', color: 'text-orange-700', bg: 'bg-orange-50' },
  adjustment:{ label: 'Adjustment', icon: '⚖️', color: 'text-slate-700', bg: 'bg-slate-50' },
}

export default function HistoryPage() {
  const [actionFilter, setActionFilter] = useState<ActionType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = MOCK_HISTORY.filter(entry => {
    if (actionFilter !== 'all' && entry.action !== actionFilter) return false
    if (search && !entry.detail.toLowerCase().includes(search.toLowerCase()) && !entry.reference.toLowerCase().includes(search.toLowerCase())) return false
    if (dateFrom && new Date(entry.date) < new Date(dateFrom)) return false
    if (dateTo && new Date(entry.date) > new Date(dateTo)!) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-charcoal">History</h1>
        <p className="text-sm text-muted mt-0.5">Complete operational history of the store</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-52">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reference or detail…" className="form-input pl-10" />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value as ActionType | 'all')} className="form-input w-40">
          <option value="all">All Actions</option>
          {Object.entries(ACTION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input w-36" title="From date" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input w-36" title="To date" />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filtered.map(entry => {
          const cfg = ACTION_CONFIG[entry.action]
          return (
            <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${cfg.bg}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                  <span className="font-mono text-xs text-brand-blue">{entry.reference}</span>
                  <span className="text-xs text-slate-400 ml-auto">{formatDateTime(entry.date)}</span>
                </div>
                <p className="text-sm text-charcoal mt-0.5">{entry.detail}</p>
                <p className="text-xs text-muted mt-1">by {entry.user}</p>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted">No history matches your filters</div>
        )}
      </div>

      <p className="text-xs text-muted text-center">Records are append-only. Transactions are never silently deleted.</p>
    </div>
  )
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
