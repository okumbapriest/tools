'use client'

import { useState, useEffect } from 'react'
import { searchWorkers, getAllTools, createIssue } from '@/lib/queries'
import type { Worker, Tool } from '@/types/database'

type Step = 1 | 2 | 3 | 4
type IssueData = {
  worker_id: string
  site_id: string
  work_area: string
  expected_return_date: string
  purpose: string
  items: Array<{ tool_id: string; quantity: number }>
}

export default function IssueToolsPage() {
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<IssueData>({
    worker_id: '',
    site_id: '',
    work_area: '',
    expected_return_date: '',
    purpose: '',
    items: [],
  })
  const [workers, setWorkers] = useState<Worker[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [search, setSearch] = useState('')
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadTools()
  }, [])

  async function loadTools() {
    const result = await getAllTools()
    setTools(result ?? [])
  }

  async function searchWorkersFn(query: string) {
    if (!query.trim()) { setWorkers([]); return }
    const result = await searchWorkers(query)
    setWorkers(result)
  }

  function selectWorker(worker: Worker) {
    setSelectedWorker(worker)
    setData(d => ({ ...d, worker_id: worker.id }))
    setStep(2)
  }

  function addItem(tool: Tool, qty: number) {
    const existing = data.items.find(i => i.tool_id === tool.id)
    if (existing) {
      setData(d => ({
        ...d,
        items: d.items.map(i => i.tool_id === tool.id ? { ...i, quantity: Math.min(i.quantity + qty, tool.available_quantity) } : i),
      }))
    } else if (qty > 0) {
      setData(d => ({
        ...d,
        items: [...d.items, { tool_id: tool.id, quantity: Math.min(qty, tool.available_quantity) }],
      }))
    }
  }

  function removeItem(toolId: string) {
    setData(d => ({ ...d, items: d.items.filter(i => i.tool_id !== toolId) }))
  }

  async function submitIssue() {
    setLoading(true)
    try {
      // Generate reference
      const ref = `ISSUE-${Date.now().toString().slice(-6)}`
      const issue = await createIssue({
        reference: ref,
        ...data,
        status: 'issued',
      }, data.items)

      setSubmitted(true)
      setData({ worker_id: '', site_id: '', work_area: '', expected_return_date: '', purpose: '', items: [] })
      setSelectedWorker(null)
      setStep(1)
    } catch (e) {
      alert('Failed to issue tools: ' + e)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-charcoal">Tools Issued Successfully</h1>
        <p className="text-muted mt-2">The issue has been recorded. Stock has been updated.</p>
        <button onClick={() => setSubmitted(false)} className="btn-primary mt-6">Issue More Tools</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-brand-charcoal">Issue Tools</h1>
        <p className="text-sm text-brand-muted mt-0.5">Record tools being handed to a worker.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
              step >= s ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-brand-blue' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted px-1">
        <span>Worker</span><span>Work Info</span><span>Select Tools</span><span>Confirm</span>
      </div>

      {/* Step 1: Select Worker */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-brand-charcoal mb-4">Search Worker</h2>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Enter name or worker ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); searchWorkersFn(e.target.value) }}
              className="form-input pl-10"
              autoFocus
            />
          </div>
          {workers.length > 0 && (
            <ul className="mt-3 space-y-1 max-h-60 overflow-y-auto">
              {workers.map(w => (
                <li key={w.id}>
                  <button
                    onClick={() => selectWorker(w)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{w.full_name}</div>
                      <div className="text-xs text-muted">{w.worker_id} · {w.trade || 'No trade'} · {w.assigned_site_id ? 'Assigned site' : 'Unassigned'}</div>
                    </div>
                    <span className="text-brand-blue text-sm">→</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {search && workers.length === 0 && !loading && (
            <p className="text-sm text-muted mt-3 text-center">No workers found. Register first.</p>
          )}
        </div>
      )}

      {/* Step 2: Work Information */}
      {step === 2 && selectedWorker && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-charcoal">Work Information</h2>
            <span className="badge badge-blue">{selectedWorker.worker_id}</span>
          </div>
          <p className="text-sm text-muted mb-4">Worker: <span className="font-medium text-charcoal">{selectedWorker.full_name}</span></p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Site / Project</label>
              <select className="form-input" value={data.site_id} onChange={e => setData(d => ({ ...d, site_id: e.target.value }))}>
                <option value="">Select site...</option>
              </select>
            </div>
            <div>
              <label className="form-label">Work Area</label>
              <input className="form-input" value={data.work_area} onChange={e => setData(d => ({ ...d, work_area: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Expected Return Date</label>
              <input type="date" className="form-input" value={data.expected_return_date} onChange={e => setData(d => ({ ...d, expected_return_date: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Purpose / Task (optional)</label>
              <textarea className="form-input" rows={2} value={data.purpose} onChange={e => setData(d => ({ ...d, purpose: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button onClick={() => setStep(3)} className="btn-primary">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Select Tools */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-brand-charcoal mb-4">Select Tools</h2>
          <div className="space-y-2">
            {tools.map(tool => {
              const selected = data.items.find(i => i.tool_id === tool.id)
              return (
                <div key={tool.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="font-medium">{tool.tool_name}</div>
                    <div className="text-xs text-muted">Available: <span className={`font-semibold ${tool.available_quantity <= tool.minimum_stock ? 'text-red-600' : 'text-green-600'}`}>{tool.available_quantity}</span> / Total: {tool.total_quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => addItem(tool, -1)} disabled={!selected} className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30">−</button>
                    <input
                      type="number"
                      min={0}
                      max={tool.available_quantity}
                      value={selected?.quantity ?? 0}
                      onChange={e => addItem(tool, parseInt(e.target.value) - (selected?.quantity ?? 0))}
                      className="w-16 text-center form-input py-1"
                    />
                    <button onClick={() => addItem(tool, 1)} disabled={(selected?.quantity ?? 0) >= tool.available_quantity} className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30">+</button>
                    {selected && (
                      <button onClick={() => removeItem(tool.id)} className="ml-2 text-red-500 hover:text-red-700 text-xs">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {data.items.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                {data.items.reduce((sum, i) => sum + i.quantity, 0)} tool{data.items.reduce((sum, i) => sum + i.quantity, 0) > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
          <div className="flex justify-between mt-5">
            <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
            <button onClick={() => setStep(4)} disabled={data.items.length === 0} className="btn-primary">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-brand-charcoal mb-4">Acknowledgement & Confirm</h2>

          <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Worker:</span><span className="font-medium">{selectedWorker?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-muted">Site:</span><span>{data.site_id ? 'Selected' : 'Not specified'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Return by:</span><span className="font-medium">{data.expected_return_date || 'Not set'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Purpose:</span><span className="text-right max-w-48 truncate">{data.purpose || '—'}</span></div>
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2 font-semibold text-muted">Tool</th>
                  <th className="text-center px-4 py-2 font-semibold text-muted">Qty</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(item => {
                  const tool = tools.find(t => t.id === item.tool_id)
                  return (
                    <tr key={item.tool_id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2">{tool?.tool_name}</td>
                      <td className="px-4 py-2 text-center font-semibold">{item.quantity}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 mb-5">
            <input type="checkbox" id="confirm" className="mt-1" />
            <label htmlFor="confirm" className="text-sm text-slate-600">
              I confirm that the above tools are being issued to the named worker. The worker acknowledges receipt of these tools in good condition.
            </label>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="btn-secondary">← Back</button>
            <button onClick={submitIssue} disabled={loading} className="btn-primary py-2.5 px-8">
              {loading ? 'Recording...' : 'Confirm Tool Issue'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
