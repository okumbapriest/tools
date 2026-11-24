'use client'

import { useState } from 'react'
import { REPORT_PERIODS } from '@/lib/constants'

const REPORT_TYPES = [
  { id: 'inventory', label: 'Complete Inventory', description: 'Full stock overview with balances' },
  { id: 'available', label: 'Available Stock', description: 'Tools currently in store' },
  { id: 'issued', label: 'Issued Tools', description: 'All tools currently issued to workers' },
  { id: 'outstanding', label: 'Outstanding Tools', description: 'Tools past due date' },
  { id: 'returns', label: 'Returns Log', description: 'All returned tools with conditions' },
  { id: 'damaged', label: 'Damaged Tools', description: 'Damaged and repair inventory' },
  { id: 'worker', label: 'Worker Responsibility', description: 'Who holds which tools' },
  { id: 'movements', label: 'Tool Movement History', description: 'Full transaction ledger' },
]

const FORMATS = ['PDF', 'Excel (.xlsx)', 'CSV'] as const

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(REPORT_PERIODS[1]) // This Month by default
  const [selectedType, setSelectedType] = useState('inventory')
  const [selectedFormat, setSelectedFormat] = useState('PDF')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function generateReport() {
    setGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500)) // simulate API call
    setGenerating(false)
    setGenerated(true)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-charcoal">Inventory Reports</h1>
        <p className="text-sm text-muted mt-0.5">Generate and download reports for any period</p>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-charcoal mb-3">Select Period</h2>
        <div className="flex flex-wrap gap-2">
          {REPORT_PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod.days === p.days
                  ? 'bg-brand-blue text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report type selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-charcoal mb-3">Report Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REPORT_TYPES.map(rt => (
            <button
              key={rt.id}
              onClick={() => setSelectedType(rt.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selectedType === rt.id
                  ? 'border-brand-blue bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`font-semibold text-sm ${selectedType === rt.id ? 'text-brand-blue' : 'text-charcoal'}`}>
                {rt.label}
              </div>
              <div className="text-xs text-muted mt-0.5">{rt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Format & Generate */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-charcoal mb-3">Export Format</h2>
        <div className="flex gap-3 mb-5">
          {FORMATS.map(f => (
            <button
              key={f}
              onClick={() => setSelectedFormat(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFormat === f
                  ? 'bg-brand-blue text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-brand-blue'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {generated ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-green-800">Report Generated</h3>
            <p className="text-sm text-green-600 mt-1">
              {REPORT_TYPES.find(r => r.id === selectedType)?.label} · {selectedPeriod.label} · {selectedFormat}
            </p>
            <button className="mt-4 btn-primary" onClick={() => { setGenerated(false); generateReport() }}>
              Download Again
            </button>
          </div>
        ) : (
          <button onClick={generateReport} disabled={generating} className="btn-primary py-3 px-8 text-base">
            {generating ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />Generating…</>
            ) : (
              <>Generate Report →</>
            )}
          </button>
        )}
      </div>

      {/* Info note */}
      <div className="text-xs text-muted text-center">
        Reports include tool name, asset code, total quantity, available, issued, returned during period, damaged, under repair, missing, responsible worker, site, issue and return dates.
      </div>
    </div>
  )
}
