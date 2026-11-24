'use client'

import { useState, useEffect } from 'react'
import { getAllTools, searchTools } from '@/lib/queries'
import type { Tool } from '@/types/database'

export default function InventoryPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [filtered, setFiltered] = useState<Tool[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterCondition, setFilterCondition] = useState<'all' | 'good' | 'damaged' | 'under_repair'>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const result = await getAllTools()
    setTools(result ?? [])
    setFiltered(result ?? [])
  }

  useEffect(() => {
    let result = tools
    if (search.trim()) {
      result = result.filter(t =>
        t.tool_name.toLowerCase().includes(search.toLowerCase()) ||
        (t.asset_code ?? '').toLowerCase().includes(search.toLowerCase())
      )
    }
    if (filterCategory) {
      result = result.filter(t => (t as any).categories?.name === filterCategory)
    }
    if (filterCondition !== 'all') {
      if (filterCondition === 'damaged') {
        result = result.filter(t => (t.damaged_quantity ?? 0) > 0)
      } else if (filterCondition === 'under_repair') {
        result = result.filter(t => (t.under_repair_quantity ?? 0) > 0)
      }
    }
    setFiltered(result)
  }, [search, filterCategory, filterCondition, tools])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-charcoal">Inventory Overview</h1>
          <p className="text-sm text-brand-muted mt-0.5">View all tools, balances and conditions</p>
        </div>
        <button className="btn-secondary text-xs" onClick={() => window.location.href = '/storekeeper/tools'}>
          Go to Tool Store
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative flex-1 min-w-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by tool name or asset code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <select className="form-input w-40" value={filterCondition} onChange={e => setFilterCondition(e.target.value as any)}>
          <option value="all">All Conditions</option>
          <option value="good">Good Only</option>
          <option value="damaged">Has Damaged</option>
          <option value="under_repair">Needs Repair</option>
        </select>
        <select className="form-input w-40" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {Array.from(new Set((tools as any[]).map(t => t.categories?.name).filter(Boolean))).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm data-table">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Category</th>
              <th>Total</th>
              <th>Available</th>
              <th>Issued</th>
              <th>Damaged</th>
              <th>Under Repair</th>
              <th>Missing</th>
              <th>Condition</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tool => (
              <tr key={tool.id} className="hover:bg-slate-50">
                <td className="font-medium">
                  {tool.tool_name}
                  {tool.asset_code && <span className="block text-xs text-muted">{tool.asset_code}</span>}
                </td>
                <td className="text-muted">{(tool as any).categories?.name || '—'}</td>
                <td>{tool.total_quantity}</td>
                <td className={tool.available_quantity <= tool.minimum_stock ? 'text-red-600 font-semibold' : ''}>{tool.available_quantity}</td>
                <td>{tool.issued_quantity}</td>
                <td className={(tool.damaged_quantity ?? 0) > 0 ? 'text-red-600' : ''}>{tool.damaged_quantity ?? 0}</td>
                <td className={(tool.under_repair_quantity ?? 0) > 0 ? 'text-amber-600' : ''}>{tool.under_repair_quantity ?? 0}</td>
                <td className={(tool.missing_quantity ?? 0) > 0 ? 'text-red-600' : ''}>{tool.missing_quantity ?? 0}</td>
                <td><ConditionBadge condition={tool.condition} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-8 text-muted">No tools match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, string> = {
    good: 'badge badge-green',
    damaged: 'badge badge-red',
    under_repair: 'badge badge-yellow',
    missing: 'badge badge-gray',
    retired: 'badge badge-gray',
  }
  return <span className={map[condition] || 'badge badge-gray'}>{condition}</span>
}
