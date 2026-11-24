'use client'

import { useState } from 'react'

type Step = 1 | 2 | 3
type ReturnItem = { tool_id: string; tool_name: string; qty_returned: number; condition: string; notes: string }

// Mock outstanding issues for workers
const WORKER_ISSUES = [
  { worker_id: 'WR-002', worker_name: 'Peter Mwangi', items: [{ tool_id: '1', tool_name: 'Hammer', issued: 3, returned: 0, remaining: 3 }, { tool_id: '3', tool_name: 'Spade', issued: 1, returned: 0, remaining: 1 }] },
  { worker_id: 'WR-003', worker_name: 'David Ochieng', items: [{ tool_id: '2', tool_name: 'Drill', issued: 1, returned: 0, remaining: 1 }, { tool_id: '4', tool_name: 'Extension cable 50m', issued: 2, returned: 0, remaining: 2 }] },
]

const CONDITIONS = [
  { value: 'good', label: 'Good — ready for store' },
  { value: 'damaged', label: 'Damaged — needs repair' },
  { value: 'needs_repair', label: 'Needs Repair' },
  { value: 'incomplete', label: 'Incomplete / Discrepancy' },
]

export default function ReturnsPage() {
  const [step, setStep] = useState<Step>(1)
  const [search, setSearch] = useState('')
  const [selectedWorker, setSelectedWorker] = useState<typeof WORKER_ISSUES[0] | null>(null)
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const filteredWorkers = WORKER_ISSUES.filter(w =>
    w.worker_name.toLowerCase().includes(search.toLowerCase()) || w.worker_id.toLowerCase().includes(search.toLowerCase())
  )

  function selectWorker(worker: typeof WORKER_ISSUES[0]) {
    setSelectedWorker(worker)
    setReturnItems([])
    setStep(2)
  }

  function updateReturnItem(toolId: string, field: keyof ReturnItem, value: string | number) {
    setReturnItems(prev => prev.map(item => item.tool_id === toolId ? { ...item, [field]: value } : item))
  }

  function addReturnItem(item: ReturnItem) {
    if (!returnItems.find(r => r.tool_id === item.tool_id)) {
      setReturnItems(prev => [...prev, item])
    }
  }

  function confirmReturn() {
    setSubmitted(true)
  }

  function reset() {
    setStep(1)
    setSelectedWorker(null)
    setReturnItems([])
    setNotes('')
    setSubmitted(false)
    setSearch('')
  }

  const totalItems = returnItems.reduce((sum: number, item: ReturnItem) => sum + item.qty_returned, 0)

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-charcoal">Return Recorded</h1>
        <p className="text-muted mt-2">
          {totalItems} tool{totalItems > 1 ? 's' : ''} received and inspected.
          {returnItems.some((i: ReturnItem) => i.condition !== 'good') && ' Some items marked for repair.'}
        </p>
        <button onClick={reset} className="btn-primary mt-6">Record Another Return</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-charcoal">Record Return</h1>
        <p className="text-sm text-muted mt-0.5">Receive tools from workers and inspect their condition.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= s ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-brand-blue' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted px-1"><span>Find Worker</span><span>Inspect & Return</span><span>Confirm</span></div>

      {/* Step 1: Search Worker */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="relative mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name or worker ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-10"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            {filteredWorkers.map(w => (
              <button
                key={w.worker_id}
                onClick={() => selectWorker(w)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between border border-slate-200 hover:border-blue-300"
              >
                <div>
                  <div className="font-medium">{w.worker_name}</div>
                  <div className="text-xs text-muted">{w.worker_id} · {w.items.length} outstanding item{w.items.length > 1 ? 's' : ''}</div>
                </div>
                <span className="text-brand-blue text-sm">→</span>
              </button>
            ))}
            {filteredWorkers.length === 0 && <p className="text-sm text-muted text-center py-6">No workers found</p>}
          </div>
        </div>
      )}

      {/* Step 2: Inspect & Return */}
      {step === 2 && selectedWorker && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-charcoal">Outstanding Items</h2>
            <span className="badge badge-blue">{selectedWorker.worker_id}</span>
          </div>

          <div className="space-y-3">
            {selectedWorker.items.map(item => {
              const existing = returnItems.find(r => r.tool_id === item.tool_id)
              const hasReturn = !!existing
              return (
                <div key={item.tool_id} className={`border rounded-xl p-4 ${hasReturn ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                  {!hasReturn ? (
                    <button
                      onClick={() => addReturnItem({ tool_id: item.tool_id, tool_name: item.tool_name, qty_returned: 0, condition: 'good', notes: '' })}
                      className="w-full text-center py-2 text-sm text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      + Record Return for {item.tool_name}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.tool_name}</span>
                        <button onClick={() => setReturnItems(prev => prev.filter(r => r.tool_id !== item.tool_id))} className="text-red-500 text-xs hover:underline">Remove</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="form-label">Qty Returned</label>
                          <input
                            type="number"
                            min={0}
                            max={item.remaining}
                            value={returnItems.find(r => r.tool_id === item.tool_id)?.qty_returned ?? 0}
                            onChange={e => updateReturnItem(item.tool_id, 'qty_returned', parseInt(e.target.value) || 0)}
                            className="form-input"
                          />
                          <p className="text-xs text-muted mt-1">Max {item.remaining} available</p>
                        </div>
                        <div>
                          <label className="form-label">Condition</label>
                          <select
                            value={returnItems.find(r => r.tool_id === item.tool_id)?.condition ?? 'good'}
                            onChange={e => updateReturnItem(item.tool_id, 'condition', e.target.value)}
                            className="form-input"
                          >
                            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Inspection Notes</label>
                        <input
                          value={returnItems.find(r => r.tool_id === item.tool_id)?.notes ?? ''}
                          onChange={e => updateReturnItem(item.tool_id, 'notes', e.target.value)}
                          className="form-input"
                          placeholder="Any observations…"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {returnItems.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <span className="font-semibold">{returnItems.reduce((s, i) => s + i.qty_returned, 0)}</span> tool{returnItems.reduce((s, i) => s + i.qty_returned, 0) > 1 ? 's' : ''} selected for return
            </div>
          )}

          <div className="flex justify-between mt-5">
            <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={returnItems.length === 0}
              className="btn-primary disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedWorker && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-charcoal mb-4">Confirm Return</h2>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted">Worker:</p>
            <p className="font-semibold">{selectedWorker.worker_name} ({selectedWorker.worker_id})</p>
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2 font-semibold text-muted">Tool</th>
                  <th className="text-center px-4 py-2 font-semibold text-muted">Returned</th>
                  <th className="text-left px-4 py-2 font-semibold text-muted">Condition</th>
                </tr>
              </thead>
              <tbody>
                {returnItems.map(item => (
                  <tr key={item.tool_id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 font-medium">{item.tool_name}</td>
                    <td className="px-4 py-2 text-center font-semibold">{item.qty_returned}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${item.condition === 'good' ? 'badge-green' : item.condition === 'damaged' ? 'badge-red' : 'badge-yellow'}`}>
                        {CONDITIONS.find(c => c.value === item.condition)?.label || item.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Additional notes (optional)…"
            className="form-input mb-4"
            rows={2}
          />

          <div className="flex items-start gap-2 mb-5">
            <input type="checkbox" id="confirmReturn" className="mt-1" />
            <label htmlFor="confirmReturn" className="text-sm text-slate-600">
              I confirm these tools have been physically received and inspected. Quantities and conditions are correct.
            </label>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
            <button onClick={confirmReturn} className="btn-primary py-2.5 px-8">Confirm Return</button>
          </div>
        </div>
      )}
    </div>
  )
}
