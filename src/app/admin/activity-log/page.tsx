'use client'

import { useState } from 'react'

type ActivityAction = 'tool_issued' | 'tool_returned' | 'worker_registered' | 'tool_added' |
  'storekeeper_changed' | 'report_downloaded' | 'tool_transferred' | 'damage_reported' |
  'repair_started' | 'repair_completed' | 'tool_edited' | 'login' | 'logout' | 'stock_adjusted'

interface LogEntry {
  id: string
  action: ActivityAction
  user_name: string
  user_email: string
  target_table: string
  target_id: string
  details: string
  created_at: string
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', action: 'tool_issued', user_name: 'John Kamau', user_email: 'john.kamau@toolroom.local', target_table: 'issues', target_id: 'ISSUE-001', details: 'Issued 1× Drill to WR-002', created_at: '2025-11-20T10:30:00Z' },
  { id: '2', action: 'tool_returned', user_name: 'John Kamau', user_email: 'john.kamau@toolroom.local', target_table: 'returns', target_id: 'RETURN-005', details: 'Received 2× Hammers (good condition)', created_at: '2025-11-20T09:15:00Z' },
  { id: '3', action: 'worker_registered', user_name: 'John Kamau', user_email: 'john.kamau@toolroom.local', target_table: 'workers', target_id: 'WR-005', details: 'Registered Grace Wambui', created_at: '2025-11-19T14:00:00Z' },
  { id: '4', action: 'tool_added', user_name: 'John Kamau', user_email: 'john.kamau@toolroom.local', target_table: 'tools', target_id: 'T-HAM-001', details: 'Added 40× Hammer to inventory', created_at: '2025-11-18T08:00:00Z' },
  { id: '5', action: 'login', user_name: 'System Administrator', user_email: 'admin@toolroom.local', target_table: '', target_id: '', details: 'Admin login from IP 196.201.45.1', created_at: '2025-11-22T08:00:00Z' },
  { id: '6', action: 'damage_reported', user_name: 'John Kamau', user_email: 'john.kamau@toolroom.local', target_table: 'damage_records', target_id: 'DR-001', details: 'Reported drill motor failure on Site A', created_at: '2025-11-19T16:30:00Z' },
  { id: '7', action: 'report_downloaded', user_name: 'System Administrator', user_email: 'admin@toolroom.local', target_table: 'report_records', target_id: 'RPT-2025-11', details: 'Downloaded Monthly Inventory Report (PDF)', created_at: '2025-11-21T11:00:00Z' },
  { id: '8', action: 'tool_transferred', user_name: 'John Kamau', user_email: 'john.kamau@toolroom.local', target_table: 'transfers', target_id: 'TRANSFER-001', details: 'Transferred 1× Spade from WR-002 to WR-003', created_at: '2025-11-18T15:00:00Z' },
]

const ACTION_LABELS: Record<ActivityAction, string> = {
  tool_issued: 'Tool Issued',
  tool_returned: 'Tool Returned',
  worker_registered: 'Worker Registered',
  tool_added: 'Tool Added',
  storekeeper_changed: 'Storekeeper Changed',
  report_downloaded: 'Report Downloaded',
  tool_transferred: 'Tool Transferred',
  damage_reported: 'Damage Reported',
  repair_started: 'Repair Started',
  repair_completed: 'Repair Completed',
  tool_edited: 'Tool Edited',
  login: 'User Login',
  logout: 'User Logout',
  stock_adjusted: 'Stock Adjusted',
}

const ACTION_COLORS: Record<ActivityAction, string> = {
  tool_issued: 'text-blue-600',
  tool_returned: 'text-green-600',
  worker_registered: 'text-green-600',
  tool_added: 'text-blue-600',
  storekeeper_changed: 'text-purple-600',
  report_downloaded: 'text-slate-600',
  tool_transferred: 'text-amber-600',
  damage_reported: 'text-red-600',
  repair_started: 'text-amber-600',
  repair_completed: 'text-green-600',
  tool_edited: 'text-slate-600',
  login: 'text-slate-500',
  logout: 'text-slate-500',
  stock_adjusted: 'text-slate-600',
}

export default function ActivityLogPage() {
  const [actionFilter, setActionFilter] = useState<ActivityAction | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchUser, setSearchUser] = useState('')

  const filtered = MOCK_LOGS.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false
    if (dateFrom && new Date(log.created_at) < new Date(dateFrom)) return false
    if (dateTo && new Date(log.created_at) > new Date(dateTo)!) return false
    if (searchUser && !log.user_name.toLowerCase().includes(searchUser.toLowerCase()) && !log.user_email.toLowerCase().includes(searchUser.toLowerCase())) return false
    return true
  })

  const actionOptions = Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-charcoal">Activity Log</h1>
        <p className="text-sm text-muted mt-0.5">Full audit trail of system actions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="form-label">Action</label>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value as ActivityAction | 'all')} className="form-input w-48">
            <option value="all">All Actions</option>
            {actionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input w-40" />
        </div>
        <div>
          <label className="form-label">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input w-40" />
        </div>
        <div className="flex-1 min-w-48">
          <label className="form-label">User</label>
          <input type="text" placeholder="Search name or email…" value={searchUser} onChange={e => setSearchUser(e.target.value)} className="form-input" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="text-muted whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                <td>
                  <span className={`font-medium text-xs uppercase tracking-wide ${ACTION_COLORS[log.action]}`}>
                    {ACTION_LABELS[log.action]}
                  </span>
                </td>
                <td>
                  <div className="font-medium">{log.user_name}</div>
                  <div className="text-xs text-muted">{log.user_email}</div>
                </td>
                <td>
                  {log.target_table && (
                    <span className="badge badge-gray">{log.target_table} · {log.target_id}</span>
                  )}
                </td>
                <td className="text-slate-600 max-w-xs truncate">{log.details}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-muted">No activity matches your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted text-center">Showing {filtered.length} of {MOCK_LOGS.length} entries. Records are append-only and never deleted.</p>
    </div>
  )
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
