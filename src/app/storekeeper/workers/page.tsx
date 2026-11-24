'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { searchWorkers, getAllWorkers, createWorker, updateWorker } from '@/lib/queries'
import type { Worker } from '@/types/database'

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '',
    worker_id: '',
    phone_number: '',
    trade: '',
    assigned_site_id: '',
    supervisor: '',
    status: 'active' as const,
    notes: '',
  })

  useEffect(() => {
    loadWorkers()
  }, [search])

  async function loadWorkers() {
    setLoading(true)
    try {
      const result = search.trim()
        ? await searchWorkers(search)
        : await getAllWorkers()
      setWorkers(result)
    } catch (e) {
      console.error('Failed to load workers', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingId) {
        const updated = await updateWorker(editingId, form)
        setWorkers(prev => prev.map(w => w.id === editingId ? updated : w))
      } else {
        const newWorker = await createWorker(form)
        setWorkers(prev => [...prev, newWorker])
      }
      resetForm()
    } catch (e) {
      alert('Failed to save worker: ' + e)
    }
  }

  function resetForm() {
    setForm({ full_name: '', worker_id: '', phone_number: '', trade: '', assigned_site_id: '', supervisor: '', status: 'active', notes: '' })
    setShowForm(false)
    setEditingId(null)
  }

  function startEdit(worker: Worker) {
    setEditingId(worker.id)
    setForm({
      full_name: worker.full_name,
      worker_id: worker.worker_id,
      phone_number: worker.phone_number ?? '',
      trade: worker.trade ?? '',
      assigned_site_id: worker.assigned_site_id ?? '',
      supervisor: worker.supervisor ?? '',
      status: worker.status as any,
      notes: worker.notes ?? '',
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-charcoal">Workers</h1>
          <p className="text-sm text-brand-muted mt-0.5">Register and search workers</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
          <span>+ Add Worker</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by worker name, ID or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-brand-charcoal mb-4">{editingId ? 'Edit Worker' : 'Register Worker'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input required className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Worker ID *</label>
              <input required className="form-input" placeholder="WR-XXX" value={form.worker_id} onChange={e => setForm({ ...form, worker_id: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Trade / Occupation</label>
              <input className="form-input" value={form.trade} onChange={e => setForm({ ...form, trade: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Assigned Site</label>
              <select className="form-input" value={form.assigned_site_id} onChange={e => setForm({ ...form, assigned_site_id: e.target.value })}>
                <option value="">Select site...</option>
                {/* Populated from sites API in production */}
              </select>
            </div>
            <div>
              <label className="form-label">Supervisor</label>
              <input className="form-input" value={form.supervisor} onChange={e => setForm({ ...form, supervisor: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editingId ? 'Save Changes' : 'Save Worker'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Trade</th>
              <th>Site</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted">Loading...</td></tr>
            ) : workers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted">{search ? 'No workers found' : 'No workers registered yet'}</td></tr>
            ) : workers.map((worker) => (
              <tr key={worker.id} className="hover:bg-slate-50">
                <td className="font-medium">{worker.full_name}</td>
                <td><span className="badge badge-gray">{worker.worker_id}</span></td>
                <td className="text-muted">{worker.trade || '—'}</td>
                <td className="text-muted">{worker.assigned_site_id ? 'Site assigned' : '—'}</td>
                <td><StatusBadge status={worker.status} /></td>
                <td>
                  <button onClick={() => startEdit(worker)} className="text-brand-blue hover:underline text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'active' ? 'badge badge-green' : 'badge badge-gray'
  return <span className={cls}>{status === 'active' ? 'Active' : 'Inactive'}</span>
}
