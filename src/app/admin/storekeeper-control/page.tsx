'use client'

import { useState } from 'react'

// In production, fetch from Supabase
const CURRENT_STOREKEEPER = {
  id: 'usr_abc123',
  full_name: 'John Kamau',
  email: 'john.kamau@toolroom.local',
  phone: '+254 712 345 678',
  appointed_at: '2025-04-12',
  status: 'active',
}

// Other users in the system
const CANDIDATE_USERS = [
  { id: 'usr_xyz', full_name: 'Alice Muthoni', email: 'alice.m@toolroom.local', role: 'employee' },
  { id: 'usr_def', full_name: 'Brian Kamau', email: 'brian.k@toolroom.local', role: 'employee' },
  { id: 'usr_ghi', full_name: 'Carol Wanjiku', email: 'carol.w@toolroom.local', role: 'employee' },
]

export default function StorekeeperControlPage() {
  const [mode, setMode] = useState<'view' | 'appoint' | 'remove'>('view')
  const [selectedUser, setSelectedUser] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleAppoint() {
    if (!selectedUser) { setErrorMsg('Please select a user'); return }
    if (selectedUser === CURRENT_STOREKEEPER.id) { setErrorMsg('This user is already the storekeeper'); return }
    setSuccessMsg(`Successfully appointed ${CANDIDATE_USERS.find(u => u.id === selectedUser)?.full_name} as storekeeper.`)
    setMode('view')
    setSelectedUser('')
    setErrorMsg('')
  }

  function handleRemove() {
    if (confirmText !== CURRENT_STOREKEEPER.full_name) { setErrorMsg('Type the name to confirm removal'); return }
    setSuccessMsg(`${CURRENT_STOREKEEPER.full_name} has been removed as storekeeper. Historical records preserved.`)
    setMode('view')
    setConfirmText('')
    setErrorMsg('')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-charcoal">Storekeeper Control</h1>
        <p className="text-sm text-muted mt-0.5">Appoint and manage access to the physical store</p>
      </div>

      {/* Current Storekeeper Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-charcoal mb-4">Current Storekeeper</h2>
        {CURRENT_STOREKEEPER.status === 'active' ? (
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue font-bold text-2xl">
              {CURRENT_STOREKEEPER.full_name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-lg text-charcoal">{CURRENT_STOREKEEPER.full_name}</div>
              <div className="text-sm text-muted">{CURRENT_STOREKEEPER.email}</div>
              <div className="text-xs text-slate-400 mt-1">
                Active since {new Date(CURRENT_STOREKEEPER.appointed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted py-4">No active storekeeper appointed</div>
        )}

        {CURRENT_STOREKEEPER.status === 'active' && (
          <div className="flex gap-3">
            <button onClick={() => setMode('appoint')} className="btn-primary">Change Storekeeper</button>
            <button onClick={() => setMode('remove')} className="btn-danger">Remove Storekeeper</button>
          </div>
        )}
      </div>

      {/* Appoint Form */}
      {mode === 'appoint' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-charcoal mb-4">Appoint New Storekeeper</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Select User *</label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="form-input">
                <option value="">Choose a user…</option>
                {CANDIDATE_USERS.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (() => {
              const user = CANDIDATE_USERS.find(u => u.id === selectedUser)
              return user ? (
                <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Full Name</span><span className="font-medium">{user.full_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Email</span><span>{user.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Current Role</span><span className="badge badge-gray">{user.role}</span></div>
                  <div className="flex justify-between"><span className="text-muted">New Role</span><span className="badge badge-blue">Storekeeper</span></div>
                  <div className="flex justify-between"><span className="text-muted">Appointment Date</span><span>{new Date().toLocaleDateString('en-GB')}</span></div>
                </div>
              ) : null
            })()}

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setMode('view')} className="btn-secondary">Cancel</button>
              <button onClick={handleAppoint} className="btn-primary">Confirm Appointment</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation */}
      {mode === 'remove' && (
        <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
          <h2 className="font-semibold text-red-700 mb-2">⚠ Remove Storekeeper Access</h2>
          <p className="text-sm text-red-600/80 mb-4">
            This will remove {CURRENT_STOREKEEPER.full_name}'s ability to operate the store portal.
            All historical transactions and tool movements will be preserved.
          </p>
          <div className="mb-4">
            <label className="form-label">Type "{CURRENT_STOREKEEPER.full_name}" to confirm</label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              className="form-input"
              placeholder="Enter full name…"
            />
          </div>
          {errorMsg && <p className="text-sm text-red-600 mb-3">{errorMsg}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setMode('view')} className="btn-secondary">Cancel</button>
            <button onClick={handleRemove} className="btn-danger">Remove Access</button>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      {/* Activity notes */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>Note:</strong> Removing a storekeeper only revokes portal access. All historical issues, returns, transfers, and damage records remain intact and attributable.
      </div>
    </div>
  )
}
