'use client'

import { useState } from 'react'

type TransferStep = 1 | 2 | 3
const WORKERS = [
  { id: 'WR-002', name: 'Peter Mwangi', site: 'Site A' },
  { id: 'WR-003', name: 'David Ochieng', site: 'Site B' },
  { id: 'WR-004', name: 'James Otieno', site: 'Site A' },
  { id: 'WR-001', name: 'John Kamau', site: 'Head Office' },
]
const TOOLS = [
  { id: '1', name: 'Hammer', available_for_transfer: 5 },
  { id: '2', name: 'Drill', available_for_transfer: 2 },
  { id: '3', name: 'Spade', available_for_transfer: 8 },
  { id: '4', name: 'Extension cable 50m', available_for_transfer: 3 },
]

export default function TransfersPage() {
  const [step, setStep] = useState<TransferStep>(1)
  const [fromWorker, setFromWorker] = useState('')
  const [toWorker, setToWorker] = useState('')
  const [selectedTool, setSelectedTool] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [site, setSite] = useState('')
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  const reset = () => { setStep(1); setFromWorker(''); setToWorker(''); setSelectedTool(''); setQuantity(1); setSite(''); setReason(''); setConfirmed(false); setAcknowledged(false) }

  async function handleConfirm() {
    // In production: API call to create transfer record
    await new Promise(r => setTimeout(r, 600))
    setConfirmed(true)
    if (step < 3) setStep(3)
  }

  async function handleAcknowledge() {
    await new Promise(r => setTimeout(r, 400))
    setAcknowledged(true)
  }

  const currentTool = TOOLS.find(t => t.id === selectedTool)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Transfers</h1>
          <p className="text-sm text-muted mt-0.5">Formally record tool handovers between workers</p>
        </div>
        {confirmed && (
          <button onClick={reset} className="btn-secondary text-xs">New Transfer</button>
        )}
      </div>

      {confirmed && !acknowledged ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2 className="font-semibold text-charcoal text-lg">Transfer Ready</h2>
          <p className="text-muted mt-1 text-sm">
            <span className="font-medium text-charcoal">{WORKERS.find(w => w.id === fromWorker)?.name}</span> is transferring{' '}
            <span className="font-medium">{quantity}× {currentTool?.name}</span> to{' '}
            <span className="font-medium">{WORKERS.find(w => w.id === toWorker)?.name}</span>.
          </p>
          {reason && <p className="text-sm text-slate-500 mt-2 italic">"{reason}"</p>}
          <p className="text-sm text-muted mt-3">The recipient must acknowledge receipt before the transfer is complete.</p>
          <button onClick={handleAcknowledge} className="btn-primary mt-5">Recipient Acknowledges</button>
        </div>
      ) : acknowledged ? (
        <div className="max-w-md mx-auto text-center py-10">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-charcoal">Transfer Complete</h2>
          <p className="text-muted mt-2">
            {currentTool?.name} ×{quantity} moved from {WORKERS.find(w => w.id === fromWorker)?.name} to {WORKERS.find(w => w.id === toWorker)?.name}.
            Both custody records preserved in history.
          </p>
          <button onClick={reset} className="btn-primary mt-5">Another Transfer</button>
        </div>
      ) : (
        <>
          {/* Stepper */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= s ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-brand-blue' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted px-1"><span>holders</span><span>details</span><span>confirm</span></div>

          {/* Step 1: Select Holders */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-charcoal">Select Holders</h2>
              <div>
                <label className="form-label">Current Holder *</label>
                <select value={fromWorker} onChange={e => setFromWorker(e.target.value)} className="form-input">
                  <option value="">Select worker…</option>
                  {WORKERS.map(w => <option key={w.id} value={w.id}>{w.name} ({w.id}) — {w.site}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">New Holder *</label>
                <select value={toWorker} onChange={e => setToWorker(e.target.value)} className="form-input" disabled={!fromWorker}>
                  <option value="">Select worker…</option>
                  {WORKERS.filter(w => w.id !== fromWorker).map(w => <option key={w.id} value={w.id}>{w.name} ({w.id}) — {w.site}</option>)}
                </select>
              </div>
              {fromWorker && toWorker && fromWorker === toWorker && (
                <p className="text-sm text-red-600">Current and new holder must be different.</p>
              )}
              <button
                onClick={() => { if (fromWorker && toWorker && fromWorker !== toWorker) setStep(2) }}
                disabled={!fromWorker || !toWorker || fromWorker === toWorker}
                className="btn-primary w-full"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Tool & Details */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-charcoal">Tool & Details</h2>
              <div>
                <label className="form-label">Tool *</label>
                <select value={selectedTool} onChange={e => setSelectedTool(e.target.value)} className="form-input">
                  <option value="">Select a tool…</option>
                  {TOOLS.map(t => <option key={t.id} value={t.id}>{t.name} (available: {t.available_for_transfer})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Quantity *</label>
                  <input type="number" min={1} max={currentTool?.available_for_transfer ?? 99} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Site</label>
                  <input value={site} onChange={e => setSite(e.target.value)} placeholder="Transfer site…" className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Transfer Reason</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this transfer happening?" className="form-input" rows={2} />
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                <button
                  onClick={() => { if (selectedTool && quantity > 0) setStep(3) }}
                  disabled={!selectedTool || quantity < 1}
                  className="btn-primary"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-charcoal">Confirm Transfer</h2>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">From</span><span className="font-medium">{WORKERS.find(w => w.id === fromWorker)?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted">To</span><span className="font-medium">{WORKERS.find(w => w.id === toWorker)?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted">Tool</span><span className="font-medium">{currentTool?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted">Quantity</span><span className="font-medium">{quantity}</span></div>
                {reason && <div className="pt-2 border-t border-slate-200"><span className="text-muted block">Reason</span><span className="italic mt-1">{reason}</span></div>}
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="transfer-confirm" className="mt-1" />
                <label htmlFor="transfer-confirm" className="text-sm text-slate-600">
                  I confirm this transfer. The tool moves out of <strong>{WORKERS.find(w => w.id === fromWorker)?.name}</strong>'s custody and into <strong>{WORKERS.find(w => w.id === toWorker)?.name}</strong>'s.
                </label>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                <button onClick={handleConfirm} className="btn-primary py-2.5 px-8">Confirm Transfer</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
