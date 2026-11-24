'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface DamageRecord {
  id: string
  tool_name: string
  asset_code: string
  reported_by: string
  worker_name: string | null
  site: string
  reported_at: string
  damage_description: string
  status: 'reported' | 'inspected' | 'under_repair' | 'written_off' | 'resolved'
  repair?: { status: string; started_at?: string; completed_at?: string }
}

const MOCK_DAMAGES: DamageRecord[] = [
  { id: '1', tool_name: 'Drill', asset_code: 'T-DRILL-012', reported_by: 'John Kamau', worker_name: null, site: 'Site A', reported_at: '2025-11-19T16:30:00Z', damage_description: 'Motor not engaging. Intermittent power loss.', status: 'under_repair', repair: { status: 'in_progress', started_at: '2025-11-20T09:00:00Z' } },
  { id: '2', tool_name: 'Spade', asset_code: 'T-SPD-007', reported_by: 'John Kamau', worker_name: 'Grace Wambui', site: 'Site D', reported_at: '2025-11-18T14:00:00Z', damage_description: 'Wooden handle cracked near blade socket.', status: 'reported' },
  { id: '3', tool_name: 'Extension cable 50m', asset_code: 'T-CBL-022', reported_by: 'John Kamau', worker_name: null, site: 'Site B', reported_at: '2025-11-17T11:00:00Z', damage_description: 'Cable fault — exposed wiring near plug.', status: 'inspected' },
]

const STATUS_OPTIONS = ['reported', 'inspected', 'under_repair', 'written_off', 'resolved'] as const
const TOOL_OPTIONS = ['Drill', 'Hammer', 'Spade', 'Extension cable 50m', 'Circular Saw', 'Tape measure 5m', 'Pipe wrench 18"', 'Voltage tester']

export default function DamagesPage() {
  const [damages, setDamages] = useState<DamageRecord[]>(MOCK_DAMAGES)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [viewDetail, setViewDetail] = useState<DamageRecord | null>(null)

  const [form, setForm] = useState({
    tool_name: '',
    reported_by: 'John Kamau',
    worker_name: '',
    site: 'Site A',
    damage_description: '',
  })

  const filtered = damages.filter(d => filterStatus === 'all' || d.status === filterStatus)

  function submitDamage(e: React.FormEvent) {
    e.preventDefault()
    const newDamage: DamageRecord = {
      id: `dr-${Date.now()}`,
      tool_name: form.tool_name,
      asset_code: 'T-AUTO',
      reported_by: form.reported_by,
      worker_name: form.worker_name || null,
      site: form.site,
      reported_at: new Date().toISOString(),
      damage_description: form.damage_description,
      status: 'reported',
    }
    setDamages(prev => [newDamage, ...prev])
    setShowForm(false)
    setForm({ tool_name: '', reported_by: 'John Kamau', worker_name: '', site: 'Site A', damage_description: '' })
  }

  function updateStatus(id: string, newStatus: string) {
    setDamages(prev => prev.map(d => d.id === id ? { ...d, status: newStatus as DamageRecord['status'] } : d))
    if (viewDetail?.id === id) setViewDetail(prev => prev ? { ...prev, status: newStatus as DamageRecord['status'] } : null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Damaged & Repairs</h1>
          <p className="text-sm text-muted mt-0.5">Report damage and track repair status</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Report Damage</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Reported" count={damages.filter(d => d.status === 'reported').length} color="red" />
        <StatTile label="Inspected" count={damages.filter(d => d.status === 'inspected').length} color="amber" />
        <StatTile label="Under Repair" count={damages.filter(d => d.status === 'under_repair').length} color="blue" />
        <StatTile label="Resolved" count={damages.filter(d => d.status === 'resolved' || d.status === 'written_off').length} color="green" />
      </div>

      {/* Filter */}
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input w-48">
        <option value="all">All Status</option>
        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
      </select>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(dr => (
          <DamageCard key={dr.id} dr={dr} onView={() => setViewDetail(dr)} onStatusChange={(s) => updateStatus(dr.id, s)} />
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-muted">No damage records found</div>
        )}
      </div>

      {/* Report Damage Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Report Damage" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submitDamage}>Submit Report</Button>
          </>
        }
      >
        <form onSubmit={submitDamage} className="space-y-4">
          <select value={form.tool_name} onChange={e => setForm(d => ({ ...d, tool_name: e.target.value }))} className="form-input" required>
            <option value="">Select tool…</option>
            {TOOL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Reported By</label>
              <input value={form.reported_by} onChange={e => setForm(d => ({ ...d, reported_by: e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Worker (if applicable)</label>
              <input value={form.worker_name} onChange={e => setForm(d => ({ ...d, worker_name: e.target.value }))} className="form-input" placeholder="Optional" />
            </div>
          </div>
          <select value={form.site} onChange={e => setForm(d => ({ ...d, site: e.target.value }))} className="form-input">
            <option value="Site A">Site A</option>
            <option value="Site B">Site B</option>
            <option value="Site C">Site C</option>
            <option value="Site D">Site D</option>
          </select>
          <div>
            <label className="form-label">Damage Description *</label>
            <textarea value={form.damage_description} onChange={e => setForm(d => ({ ...d, damage_description: e.target.value }))} className="form-input" rows={3} required placeholder="Describe what happened…" />
          </div>
          <p className="text-xs text-muted">Damage or loss records do not presume misconduct by the worker.</p>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!viewDetail} onClose={() => setViewDetail(null)} title="Damage Details" size="md"
        footer={
          <Button variant="secondary" onClick={() => setViewDetail(null)}>Close</Button>
        }
      >
        {viewDetail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">{viewDetail.tool_name}</div>
                <div className="text-xs text-muted font-mono">{viewDetail.asset_code}</div>
              </div>
              <StatusBadge status={viewDetail.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <DetailRow label="Reported By" value={viewDetail.reported_by} />
              <DetailRow label="Date" value={new Date(viewDetail.reported_at).toLocaleDateString('en-GB')} />
              <DetailRow label="Worker" value={viewDetail.worker_name || '—'} />
              <DetailRow label="Site" value={viewDetail.site} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted mb-1">Description</div>
              <p className="text-sm">{viewDetail.damage_description}</p>
            </div>
            {viewDetail.repair && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <div className="font-medium text-amber-800">Repair Status: {viewDetail.repair.status}</div>
                {viewDetail.repair.started_at && <div className="text-amber-700 mt-1">Started: {new Date(viewDetail.repair.started_at).toLocaleDateString('en-GB')}</div>}
                {viewDetail.repair.completed_at && <div className="text-green-700 mt-1">Completed: {new Date(viewDetail.repair.completed_at).toLocaleDateString('en-GB')}</div>}
              </div>
            )}
            <div>
              <label className="form-label">Update Status</label>
              <select
                value={viewDetail.status}
                onChange={e => updateStatus(viewDetail.id, e.target.value)}
                className="form-input"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function DamageCard({ dr, onView, onStatusChange }: { dr: DamageRecord; onView: () => void; onStatusChange: (s: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{dr.tool_name}</span>
            <span className="font-mono text-xs text-muted">{dr.asset_code}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 line-clamp-1">{dr.damage_description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted">
            <span>{dr.reported_by}</span>
            <span>·</span>
            <span>{dr.site}</span>
            <span>·</span>
            <span>{new Date(dr.reported_at).toLocaleDateString('en-GB')}</span>
            {dr.worker_name && <><span>·</span><span>Worker: {dr.worker_name}</span></>}
          </div>
        </div>
        <StatusBadge status={dr.status} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    reported: 'badge badge-red',
    inspected: 'badge badge-yellow',
    under_repair: 'badge badge-blue',
    written_off: 'badge badge-gray',
    resolved: 'badge badge-green',
  }
  return <span className={cls[status] || 'badge badge-gray'}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

function StatTile({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  }
  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs mt-1 opacity-75">{label}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
