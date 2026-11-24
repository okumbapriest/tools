'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface Tool {
  id: string
  tool_name: string
  asset_code: string | null
  category: string
  total_quantity: number
  available_quantity: number
  issued_quantity: number
  damaged_quantity: number
  condition: string
  storage_location: string | null
  minimum_stock: number
}

const MOCK_TOOLS: Tool[] = [
  { id: '1', tool_name: 'Hammer', asset_code: 'T-HAM-001', category: 'Hand Tools', total_quantity: 40, available_quantity: 27, issued_quantity: 13, damaged_quantity: 0, condition: 'good', storage_location: 'Shelf A1', minimum_stock: 5 },
  { id: '2', tool_name: 'Drill', asset_code: 'T-DRILL-012', category: 'Power Tools', total_quantity: 15, available_quantity: 9, issued_quantity: 6, damaged_quantity: 1, condition: 'good', storage_location: 'Shelf B2', minimum_stock: 3 },
  { id: '3', tool_name: 'Spade', asset_code: 'T-SPD-007', category: 'Hand Tools', total_quantity: 30, available_quantity: 21, issued_quantity: 9, damaged_quantity: 1, condition: 'good', storage_location: 'Shelf A3', minimum_stock: 5 },
  { id: '4', tool_name: 'Extension cable 50m', asset_code: 'T-CBL-022', category: 'Accessories', total_quantity: 20, available_quantity: 12, issued_quantity: 8, damaged_quantity: 0, condition: 'good', storage_location: 'Shelf C1', minimum_stock: 4 },
  { id: '5', tool_name: 'Tape measure 5m', asset_code: 'T-TAP-003', category: 'Measuring', total_quantity: 50, available_quantity: 38, issued_quantity: 12, damaged_quantity: 0, condition: 'good', storage_location: 'Shelf A1', minimum_stock: 10 },
  { id: '6', tool_name: 'Circular Saw', asset_code: 'T-SAW-015', category: 'Power Tools', total_quantity: 8, available_quantity: 5, issued_quantity: 2, damaged_quantity: 1, condition: 'good', storage_location: 'Shelf B1', minimum_stock: 2 },
]

export default function ToolStorePage() {
  const [tools, setTools] = useState<Tool[]>(MOCK_TOOLS)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [formData, setFormData] = useState({
    tool_name: '',
    asset_code: '',
    category: '',
    total_quantity: 0,
    storage_location: '',
    condition: 'good' as string,
    minimum_stock: 5,
    description: '',
  })

  const categories = ['Hand Tools', 'Power Tools', 'Measuring', 'Safety Equipment', 'Accessories', 'Plumbing', 'Electrical']

  const filtered = tools.filter(t => {
    if (search && !t.tool_name.toLowerCase().includes(search.toLowerCase()) && !(t.asset_code ?? '').toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    return true
  })

  function openNew() {
    setEditingTool(null)
    setFormData({ tool_name: '', asset_code: '', category: '', total_quantity: 0, storage_location: '', condition: 'good', minimum_stock: 5, description: '' })
    setShowForm(true)
  }

  function openEdit(tool: Tool) {
    setEditingTool(tool)
    setFormData({
      tool_name: tool.tool_name,
      asset_code: tool.asset_code ?? '',
      category: tool.category,
      total_quantity: tool.total_quantity,
      storage_location: tool.storage_location ?? '',
      condition: tool.condition,
      minimum_stock: tool.minimum_stock,
      description: '',
    })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingTool) {
      setTools(prev => prev.map(t => t.id === editingTool.id ? { ...t, ...formData } : t))
    } else {
      const newTool: Tool = {
        id: `new-${Date.now()}`,
        ...formData,
        available_quantity: formData.total_quantity,
        issued_quantity: 0,
        damaged_quantity: 0,
      }
      setTools(prev => [...prev, newTool])
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Tool Store</h1>
          <p className="text-sm text-muted mt-0.5">Register and manage inventory</p>
        </div>
        <Button onClick={openNew}>+ Register Tool</Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-52">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or asset code…" className="form-input pl-10" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="form-input w-44">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm data-table">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Asset Code</th>
              <th>Category</th>
              <th>Total</th>
              <th>Available</th>
              <th>Issued</th>
              <th>Damaged</th>
              <th>Min Stock</th>
              <th>Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tool => (
              <tr key={tool.id} className="hover:bg-slate-50">
                <td className="font-medium">{tool.tool_name}</td>
                <td><span className="font-mono text-xs text-brand-blue">{tool.asset_code || '—'}</span></td>
                <td className="text-muted">{tool.category}</td>
                <td>{tool.total_quantity}</td>
                <td className={tool.available_quantity <= tool.minimum_stock ? 'text-red-600 font-semibold' : ''}>{tool.available_quantity}</td>
                <td>{tool.issued_quantity}</td>
                <td className={(tool.damaged_quantity ?? 0) > 0 ? 'text-red-600' : ''}>{tool.damaged_quantity ?? 0}</td>
                <td>{tool.minimum_stock}</td>
                <td><StatusBadge condition={tool.condition} /></td>
                <td>
                  <button onClick={() => openEdit(tool)} className="text-brand-blue hover:underline text-xs mr-3">Edit</button>
                  <button className="text-slate-400 hover:text-slate-600 text-xs">History</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-10 text-muted">No tools match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Register / Edit Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingTool ? 'Edit Tool' : 'Register New Tool'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingTool ? 'Save Changes' : 'Register Tool'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tool Name *" value={formData.tool_name} onChange={e => setFormData(d => ({ ...d, tool_name: e.target.value }))} required placeholder="e.g., Hammer" />
            <Input label="Asset Code" value={formData.asset_code} onChange={e => setFormData(d => ({ ...d, asset_code: e.target.value.toUpperCase() }))} placeholder="e.g., T-HAM-001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category *" options={categories.map(c => ({ value: c, label: c }))} value={formData.category} onChange={e => setFormData(d => ({ ...d, category: e.target.value }))} />
            <Input label="Total Quantity *" type="number" min={0} value={String(formData.total_quantity)} onChange={e => setFormData(d => ({ ...d, total_quantity: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Storage Location" value={formData.storage_location} onChange={e => setFormData(d => ({ ...d, storage_location: e.target.value }))} placeholder="e.g., Shelf A1" />
            <Select label="Condition" options={[{ value: 'good', label: 'Good' }, { value: 'damaged', label: 'Damaged' }, { value: 'under_repair', label: 'Under Repair' }]} value={formData.condition} onChange={e => setFormData(d => ({ ...d, condition: e.target.value }))} />
          </div>
          <Input label="Minimum Stock Alert" type="number" min={0} value={String(formData.minimum_stock)} onChange={e => setFormData(d => ({ ...d, minimum_stock: parseInt(e.target.value) || 0 }))} helper="Alert when stock falls below this number" />
          <Input label="Description" value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} placeholder="Optional details about the tool…" />
        </form>
      </Modal>
    </div>
  )
}

function StatusBadge({ condition }: { condition: string }) {
  const map: Record<string, string> = { good: 'badge badge-green', damaged: 'badge badge-red', under_repair: 'badge badge-yellow' }
  return <span className={map[condition] || 'badge badge-gray'}>{condition}</span>
}
