'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await new Promise(r => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-charcoal">Settings</h1>
        <p className="text-sm text-muted mt-0.5">System configuration and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-charcoal mb-4">General</h2>
          <div className="space-y-4">
            <InputField label="System Name" defaultValue="TOOLROOM" helper="Display name shown in headers and footers" />
            <InputField label="Organization" defaultValue="ToolRoom Construction Services" />
            <SelectField
              label="Default Report Format"
              options={[{ value: 'pdf', label: 'PDF' }, { value: 'xlsx', label: 'Excel (.xlsx)' }, { value: 'csv', label: 'CSV' }]}
              defaultValue="pdf"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-charcoal mb-4">Notifications</h2>
          <div className="space-y-3">
            <ToggleRow label="Overdue tool alerts" desc="Notify when tools exceed expected return date" defaultChecked />
            <ToggleRow label="Low stock alerts" desc="Notify when tool quantity falls below minimum threshold" defaultChecked />
            <ToggleRow label="Damage report notifications" desc="Alert on new damage reports" defaultChecked />
            <ToggleRow label="Weekly summary email" desc="Send weekly inventory summary to admin" />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-charcoal mb-4">Security</h2>
          <div className="space-y-3">
            <ToggleRow label="Require password change every 90 days" desc="Enforce periodic password updates" />
            <ToggleRow label="Session timeout after 30 minutes" desc="Automatically log out inactive sessions" defaultChecked />
            <ToggleRow label="Two-factor authentication" desc="Require 2FA for all portal access" />
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-charcoal mb-4">Data Retention</h2>
          <div className="space-y-4">
            <InputField label="Activity log retention (days)" defaultValue="730" helper="How long activity logs are kept (2 years default)" />
            <InputField label="Transaction history retention (years)" defaultValue="7" helper="Years of transaction data retained for audit" />
            <div className="pt-2">
              <p className="text-sm text-muted">Records are never silently deleted. Historical data is always preserved even when a user or tool is deactivated.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" className="btn-primary py-2.5 px-8">Save Settings</button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

function InputField({ label, defaultValue, helper }: { label: string; defaultValue: string; helper?: string }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input defaultValue={defaultValue} className="form-input max-w-md" />
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  )
}

function SelectField({ label, options, defaultValue }: { label: string; options: { value: string; label: string }[]; defaultValue: string }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select defaultValue={defaultValue} className="form-input max-w-md">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false)
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-medium text-charcoal">{label}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-brand-blue' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}
